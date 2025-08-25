import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./db/schema";
import type * as SchemaTypes from "./db/schema";

export module Database {
  // Get your Supabase connection string from SST Resource or environment variable
  const DATABASE_URL = process.env.DATABASE_URL!;

  // Create a postgres connection
  const db = postgres(DATABASE_URL, { max: 1 });
  
  // Create a Drizzle ORM instance
  export const client = drizzle(db, {
    schema: schema,
  });

  export const tables = schema;
}

export type { SchemaTypes };