// Quick manual check of the API without an HTTP server: build a server-side
// "caller" and invoke a procedure directly. (This is also the shape a real
// procedure unit test will take later.)
//
// Run: DATABASE_URL=... pnpm --filter @pricy/api exec tsx src/dev-check.ts

import { restaurantsRouter } from "./routers/restaurants";
import { createCallerFactory, createContext } from "./trpc";

const createCaller = createCallerFactory(restaurantsRouter);

async function main() {
  // Build a caller with a real context (which carries the db client).
  const caller = createCaller(createContext());
  

  // Call the procedure exactly like a function — no HTTP involved.
  const rows = await caller.list();

  console.log(`restaurants.list → ${rows.length} rows\n`);

  // Print the full objects — every column — for the first 3 rows.
  console.log(rows.slice(0, 3));

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
