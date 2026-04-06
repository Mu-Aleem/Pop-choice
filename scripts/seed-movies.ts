/**
 * Seed script: Takes movie data from __mocks__/movies.ts,
 * creates embeddings via Ollama (nomic-embed-text),
 * and stores them in Supabase vector database.
 *
 * Steps:
 *   1. Read movies from __mocks__/movies.ts
 *   2. Split long content into chunks (using LangChain text splitter)
 *   3. Create embeddings for each chunk via Ollama
 *   4. Insert chunks + embeddings into Supabase "movies" table
 *
 * Run: npx tsx scripts/seed-movies.ts
 */

import "dotenv/config";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import movies from "../__mocks__/movies";

// --- Config ---
const openai = new OpenAI({
  apiKey: "ollama",
  baseURL: "http://localhost:11434/v1",
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_API_KEY!
);

// --- Step 1: Chunk the movie content ---
async function splitMovies() {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0,
    separators: ["\n\n", "\n"],
  });

  // Each movie's content becomes one or more chunks
  const allChunks: string[] = [];
  for (const movie of movies) {
    const docs = await splitter.createDocuments([movie.content]);
    for (const doc of docs) {
      allChunks.push(doc.pageContent);
    }
  }

  console.log(`Split ${movies.length} movies into ${allChunks.length} chunks`);
  return allChunks;
}

// --- Step 2: Create embeddings and store in Supabase ---
async function createAndStoreEmbeddings() {
  const chunks = await splitMovies();

  console.log("Creating embeddings and inserting into Supabase...");

  const results = await Promise.all(
    chunks.map(async (content) => {
      const embeddingResponse = await openai.embeddings.create({
        model: "nomic-embed-text",
        input: content,
      });
      return {
        content,
        embedding: embeddingResponse.data[0].embedding,
      };
    })
  );

  // Insert all at once
  const { error } = await supabase.from("movies").insert(results);

  if (error) {
    console.error("Supabase insert error:", error);
  } else {
    console.log(
      `Successfully stored ${results.length} movie chunks in Supabase!`
    );
  }
}

createAndStoreEmbeddings().catch(console.error);
