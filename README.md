# PopChoice

AI-powered movie recommendations for groups. Everyone answers a few questions, and the AI finds the one movie the whole group will enjoy.

## How It Works

1. Enter how many people and how much time you have
2. Each person answers four questions — favorite movie, new/classic, mood, favorite film person
3. AI analyzes everyone's preferences, searches the vector database, and recommends a movie with a poster and reason

## The AI Pipeline

- **Embeddings** — User answers are combined and converted into vectors using Ollama (nomic-embed-text)
- **Semantic Search** — Query vector is matched against movie vectors in Supabase using cosine similarity
- **LLM Reasoning** — gemma3:4b picks the best movie and explains why it fits the group
- **Movie Posters** — TMDB API provides official posters and metadata

## Tech Stack

- **Next.js** — Full-stack React framework
- **Ollama** — Local AI (nomic-embed-text + gemma3:4b)
- **Supabase** — PostgreSQL with pgvector for vector storage
- **LangChain** — Text splitting for movie data
- **TMDB API** — Movie posters and metadata
- **Tailwind CSS** — Styling

## Getting Started

### Prerequisites

- Node.js 20+
- [Ollama](https://ollama.com) with these models:
  ```bash
  ollama pull nomic-embed-text
  ollama pull gemma3:4b
  ```
- A [Supabase](https://supabase.com) project with pgvector enabled
- A [TMDB API key](https://developer.themoviedb.org/docs/getting-started) (free)

### Supabase Setup

Create a `movies` table and a `match_movies` function in your Supabase project. The table needs `content` (text) and `embedding` (vector) columns.

### Installation

```bash
git clone https://github.com/Mu-Aleem/Pop-choice.git
cd Pop-choice
npm install
```

### Environment Variables

Create a `.env` file:

```
SUPABASE_URL=your_supabase_url
SUPABASE_API_KEY=your_supabase_anon_key
TMDB_API_KEY=your_tmdb_api_key
USE_MOCKS=false
```

### Seed the Database

```bash
npx tsx scripts/seed-movies.ts
```

This embeds the movie data and stores the vectors in Supabase.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing with Mock Data

Set `USE_MOCKS=true` in `.env` to test the UI without Ollama or Supabase running.

## Project Structure

```
app/
  page.tsx                    — Main page with multi-step flow
  components/
    StartView.tsx             — Start screen (people count + time)
    QuestionsView.tsx         — Per-person questions
    MovieView.tsx             — Movie result with poster
  api/
    recommend/route.ts        — AI recommendation endpoint
__mocks__/
  movies.ts                   — Movie data
  recommendations.ts          — Mock recommendations for testing
scripts/
  seed-movies.ts              — Seeds Supabase with movie embeddings
```

## License

MIT
