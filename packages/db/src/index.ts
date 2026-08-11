// Public API of @pricy/db.
//
// Only tRPC procedures (packages/api) import this package; client-facing
// components never touch it directly.

// The typed database client.
export { db, type Database } from "./client";

// The schema (tables) — so consumers can reference columns in queries.
export * from "./schema";
