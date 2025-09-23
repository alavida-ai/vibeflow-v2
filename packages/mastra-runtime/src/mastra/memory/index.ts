import { createOpenRouterProvider } from "../router";
import { TEXT_EMBEDDING_3_SMALL } from "../constants";
import { createOpenAI } from "@ai-sdk/openai";
import { Memory } from "@mastra/memory";
import { PgVector } from "@mastra/pg";
import { getSharedStorage } from "../storage";

const router = createOpenRouterProvider({
  apiKey: process.env.OPENROUTER_API_KEY!
});

// Create OpenAI client configured for OpenRouter embeddings
const openaiForEmbeddings = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})  

/**
 * Creates a Memory instance with shared PostgreSQL storage and vector search
 * @param connectionString - PostgreSQL connection string (e.g., "postgresql://user:password@host:port/database")
 * @returns Configured Memory instance
 */
export function createMemory(connectionString: string) {
  // Reuse shared storage instance to avoid duplicate connections
  const storage = getSharedStorage();

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

// Default memory instance using environment variable
const defaultConnectionString = process.env.DATABASE_URL!;
export const memory = createMemory(defaultConnectionString);
