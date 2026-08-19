// Public API of @pricy/api — the surface the zones and the HTTP handler import.
//
// Client-facing components import from here (the router type + client helpers);
// they never touch @pricy/db directly. All data access flows through these
// procedures.

// The combined router (server-side) and its TYPE (for the typed client).
export { appRouter, type AppRouter } from "./root";

// Context factory + its type — used by the HTTP handler to build per-request
// context, and by tests/callers.
export { createContext, type Context } from "./trpc";
