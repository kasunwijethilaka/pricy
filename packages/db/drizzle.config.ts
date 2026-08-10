// Loads packages/db/.env into process.env so DATABASE_URL is available below.
// (Side-effect import — it just runs dotenv's setup, no named exports needed.)
import "dotenv/config";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // Where your table definitions live — drizzle-kit reads this to know your
  // desired schema.
  schema: "./src/schema.ts",

  // Where generated SQL migration files get written. This folder is your
  // database's version history — commit it.
  out: "./drizzle",

  // Which database engine. Drizzle also supports "mysql" and "sqlite".
  dialect: "postgresql",

  // Connection used by `migrate` / `push` / `studio`. Not needed by `generate`
  // (which works purely from the schema files), but required here for the rest.
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // Print the SQL it plans to run, and warn before destructive changes.
  verbose: true,
  strict: true,
});
