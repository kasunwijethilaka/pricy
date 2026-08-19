// The tRPC foundation. Every router and procedure is built from what this
// file exports: `router`, `publicProcedure`, and `createContext`.

import { initTRPC } from "@trpc/server";

import { db } from "@pricy/db";

// Context: a fresh object built for EVERY request, holding the shared
// resources procedures may need. For now just the database client — so a
// procedure reaches it via `ctx.db` instead of importing db itself.
//
// Later this is also where the logged-in user/session goes, which is how
// procedures will know *who* is calling (the basis for auth + role checks).
export function createContext() {
  return { db };
}

// The shape of our context, inferred from createContext's return value.
// tRPC uses this so `ctx` is fully typed inside every procedure.
export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC ONCE, telling it about our Context. This produces the
// builders we use everywhere else. (Global options like error formatting or
// data serialization would be configured here too.)
const t = initTRPC.context<Context>().create();

// Groups procedures into namespaces, e.g. router({ list: ..., byId: ... }).
export const router = t.router;

// The base procedure: callable by anyone (no auth). Real endpoints build on
// this. Later we'll add protectedProcedure / ownerProcedure on top of it.
export const publicProcedure = t.procedure;

// Lets us build a "server-side caller" — invoke procedures directly in code
// (no HTTP), for tests and scripts.
export const createCallerFactory = t.createCallerFactory;
