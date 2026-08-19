// The HTTP endpoint that exposes the tRPC API to the browser.
//
// A Next.js route handler at app/api/trpc/[trpc]/ catches every request to
// /api/trpc/* and hands it to tRPC's fetch adapter, which figures out which
// procedure to run and returns its result.

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createContext } from "@pricy/api";

function handler(req: Request) {
  return fetchRequestHandler({
    // The path the ROUTE HANDLER sees. Next.js strips the "/app" basePath from
    // the pathname before a route handler runs, so this must NOT include /app —
    // even though the browser calls /app/api/trpc. The adapter does
    // pathname.slice(endpoint.length), so a too-long endpoint eats characters
    // off the procedure name (e.g. "restaurants.list" → "taurants.list").
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });
}

// tRPC uses GET for queries and POST for mutations, so the same handler serves
// both HTTP methods.
export { handler as GET, handler as POST };
