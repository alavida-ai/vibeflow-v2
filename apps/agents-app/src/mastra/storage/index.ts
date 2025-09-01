import { PostgresStore } from "@mastra/pg";

export const createStorage = () => {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
    }

  return new PostgresStore({
    connectionString: process.env.DATABASE_URL!,
  })
}   