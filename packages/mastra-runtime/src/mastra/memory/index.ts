import { createOpenRouterProvider } from "../router";
import { TEXT_EMBEDDING_3_SMALL } from "../constants";
import { createOpenAI } from "@ai-sdk/openai";
import { Memory } from "@mastra/memory";
import { PostgresStore, PgVector } from "@mastra/pg";

const router = createOpenRouterProvider({
  apiKey: process.env.OPENROUTER_API_KEY!
});

// Create OpenAI client configured for OpenRouter embeddings
const openaiForEmbeddings = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})  

/**
 * Creates a Memory instance with PostgreSQL storage and vector search
 * @param connectionString - PostgreSQL connection string (e.g., "postgresql://user:password@host:port/database")
 * @returns Configured Memory instance
 */
export function createMemory(connectionString: string) {
  const storage = new PostgresStore({
    connectionString,
  });

  return new Memory({
    storage,
    vector: new PgVector({ connectionString }),
    embedder: openaiForEmbeddings.embedding(TEXT_EMBEDDING_3_SMALL),
    options: {
      semanticRecall: {
        topK: 5,
        messageRange: 4,
      },
    },
  });
}

// TODO: ensure we load this from env
// Default memory instance using environment variable
const defaultConnectionString = process.env.DATABASE_URL!;
export const memory = createMemory(defaultConnectionString);
