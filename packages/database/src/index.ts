import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./db/schema/index";
import { config } from "dotenv";

config();

let _client: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_client) return _client;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const db = postgres(url, { max: 1, prepare: false, ssl: 'allow' });
  _client = drizzle(db, { schema });
  return _client;
}

export { schema };