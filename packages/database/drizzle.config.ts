// import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import path from 'path';

// Load .env from project root
// config({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: "postgresql://postgres.rzlvlqkvjmljdzdoyggh:DHNwmaGLYOwjItSA@aws-1-eu-north-1.pooler.supabase.com:6543/postgres",
  },
});
