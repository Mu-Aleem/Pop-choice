import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { mockRecommendations } from "@/__mocks__/recommendations";

function getOpenAI() {
  return new OpenAI({
    apiKey: "ollama",
    baseURL: "http://localhost:11434/v1",
  });
}

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_API_KEY!
  );
}

const TMDB_BASE = "https://api.themoviedb.org/3";

/** Build a text summary from all users' answers to embed. */
function buildQuery(
  allAnswers: Array<{
    favoriteMovie: string;
    era: string;
    mood: string;
    favoritePerson: string;
  }>,
  timeAvailable: string
): string {
  const parts = allAnswers.map((a, i) => {
    let text = `Person ${i + 1} likes "${a.favoriteMovie}"`;
    if (a.era) text += `, prefers ${a.era} movies`;
    if (a.mood) text += `, in the mood for something ${a.mood}`;
    if (a.favoritePerson) text += `, admires ${a.favoritePerson}`;
    return text;
  });
  return `${parts.join(". ")}. Available time: ${timeAvailable}. Recommend a movie everyone would enjoy.`;
}

/** Create an embedding vector from text. */
async function createEmbedding(input: string): Promise<number[]> {
  const res = await getOpenAI().embeddings.create({
    model: "nomic-embed-text",
    input,
  });
  return res.data[0].embedding;
}

/** Find nearest movie matches in Supabase. */
async function findNearestMatch(embedding: number[]): Promise<string> {
  const { data } = await getSupabase().rpc("match_movies", {
    query_embedding: embedding,
    match_threshold: 0.3,
    match_count: 4,
  });
  return (data ?? []).map((doc: { content: string }) => doc.content).join("\n");
}

/** Fetch poster URL from TMDB. */
async function fetchPoster(
  movieTitle: string,
  year?: string
): Promise<{ posterUrl: string | null; overview: string }> {
  if (!process.env.TMDB_API_KEY) return { posterUrl: null, overview: "" };
  try {
    const query = encodeURIComponent(movieTitle);
    const yearParam = year ? `&year=${year}` : "";
    const url = `${TMDB_BASE}/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}${yearParam}`;
    const res = await fetch(url);
    const data = await res.json();
    const movie = data.results?.[0];
    if (!movie) return { posterUrl: null, overview: "" };
    return {
      posterUrl: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      overview: movie.overview || "",
    };
  } catch {
    return { posterUrl: null, overview: "" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { allAnswers, timeAvailable, previousTitles } = await req.json();

    // Use mock data when USE_MOCKS is set (for testing without Ollama/Supabase)
    if (process.env.USE_MOCKS === "true") {
      const excluded = new Set(previousTitles ?? []);
      const available = mockRecommendations.filter(
        (m) => !excluded.has(m.title)
      );
      const pick =
        available[Math.floor(Math.random() * available.length)] ??
        mockRecommendations[0];
      return NextResponse.json(pick);
    }

    // 1. Build a query from everyone's preferences
    const query = buildQuery(allAnswers, timeAvailable);

    // 2. Embed the query
    const embedding = await createEmbedding(query);

    // 3. Find matching movies in Supabase
    const context = await findNearestMatch(embedding);

    // 4. Ask LLM to pick the best movie and explain why
    const excludeClause =
      previousTitles?.length > 0
        ? `Do NOT recommend these movies (already suggested): ${previousTitles.join(", ")}.`
        : "";

    const chatResponse = await getOpenAI().chat.completions.create({
      model: "gemma3:4b",
      messages: [
        {
          role: "system",
          content: `You are an enthusiastic movie expert. Given context about movies and a group's preferences, recommend ONE movie from the context. ${excludeClause} Respond in this exact JSON format: {"title": "Movie Name", "year": "YYYY", "reason": "Why this movie is perfect for the group"}. Only output valid JSON, nothing else.`,
        },
        {
          role: "user",
          content: `Movie context:\n${context}\n\nGroup preferences: ${query}`,
        },
      ],
      temperature: 0.7,
    });

    const raw = chatResponse.choices[0].message.content ?? "{}";

    // Parse JSON from LLM response
    let recommendation: { title: string; year: string; reason: string };
    try {
      recommendation = JSON.parse(raw);
    } catch {
      // Try to extract JSON from the response
      const match = raw.match(/\{[\s\S]*\}/);
      recommendation = match
        ? JSON.parse(match[0])
        : { title: "Unknown", year: "", reason: raw };
    }

    // 5. Fetch poster from TMDB
    const { posterUrl, overview } = await fetchPoster(
      recommendation.title,
      recommendation.year
    );

    return NextResponse.json({
      title: recommendation.title,
      year: recommendation.year,
      reason: recommendation.reason,
      description: overview,
      posterUrl,
    });
  } catch (err) {
    console.error("Recommend error:", err);
    return NextResponse.json(
      { error: "Failed to get recommendation" },
      { status: 500 }
    );
  }
}
