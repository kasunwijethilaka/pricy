"use client";

// The browser-side tRPC setup for the web zone.
// - `trpc` is the typed client every component uses (trpc.restaurants.list…).
// - `TRPCProvider` wires up React Query + the tRPC client and must wrap the app.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import { useState, type ReactNode } from "react";

import type { AppRouter } from "@pricy/api";

// The typed client. Given the AppRouter TYPE, it knows every procedure —
// `trpc.restaurants.list.useQuery()` is fully typed, autocompleted, checked.
export const trpc = createTRPCReact<AppRouter>();

// Reads the OUTPUT (return) types of procedures straight from AppRouter, e.g.
// RouterOutputs["restaurants"]["list"] is exactly what restaurants.list returns.
// Lets UI components be typed by the API without redefining the shape.
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCProvider({ children }: { children: ReactNode }) {
  // One QueryClient per browser session (React Query's cache lives here).
  // useState(() => ...) creates it once, not on every render.
  const [queryClient] = useState(() => new QueryClient());

  // The tRPC client: a single httpBatchLink pointing at our endpoint.
  // The url is the base path the client sends every call to (matches the
  // route handler's `endpoint`). batching = multiple calls in one request.
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: "/app/api/trpc" })],
    }),
  );

  // Both providers must wrap the app: tRPC for the client, React Query for
  // the data cache the hooks rely on.
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
