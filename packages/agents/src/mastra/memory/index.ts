import { openai } from "@ai-sdk/openai";
import { Memory } from "@mastra/memory";
import { PostgresStore, PgVector } from "@mastra/pg";
 
// PostgreSQL connection details
const host = "aws-1-eu-west-2.pooler.supabase.com";
const port = 6543;
const user = "postgres.vbdntompztegzppzjzep";
const database = "postgres";
const password = "zeBWGkeXWCBnYHoE";
const connectionString = `postgresql://postgres.vbdntompztegzppzjzep:zeBWGkeXWCBnYHoE@aws-1-eu-west-2.pooler.supabase.com:6543/postgres`;
 
// Initialize memory with PostgreSQL storage and vector search

export const storage = new PostgresStore({
  host,
  port,
  user,
  database,
  password,
});

export const memory = new Memory({
  storage,
  vector: new PgVector({ connectionString }),
  embedder: openai.embedding("text-embedding-3-small"),
  options: {
    semanticRecall: {
      topK: 5,
      messageRange: 4,
    },
  },
});
