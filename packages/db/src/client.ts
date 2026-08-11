import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

// Read the connection string from the environment — never hardcode credentials.
// Locally this comes from packages/db/.env; in production, from the host (Vercel).
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy packages/db/.env.example to .env, or set it in your environment.",
  );
}

// The raw postgres-js connection — the "engine" that speaks the Postgres wire
// protocol. (Simple single client is fine for local dev; we'll revisit
// connection pooling when the API runs on serverless in production.)
const queryClient = postgres(DATABASE_URL);

// The Drizzle instance — the typed query builder every tRPC procedure uses.
// Passing `{ schema }` is what makes queries aware of your tables and columns.
export const db = drizzle(queryClient, { schema });

export type Database = typeof db;
