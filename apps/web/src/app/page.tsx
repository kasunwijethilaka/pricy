"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { trpc } from "@/trpc/react";
import { RestaurantFilters } from "./_components/restaurant-filters";
import { RestaurantGrid } from "./_components/restaurant-grid";

// useSearchParams() must be read under a Suspense boundary — Next.js needs it
// so the rest of the page can prerender while the client fills in the query
// string. The default export provides that boundary; the inner component does
// the actual work.
export default function AppHomePage() {
  return (
    <Suspense>
      <RestaurantBrowser />
    </Suspense>
  );
}

function RestaurantBrowser() {
  // The URL is the source of truth for filters. We read the same params the
  // filter bar writes, and turn them into the tRPC query input. Empty/absent
  // params become `undefined` so they simply don't constrain the query.
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() || undefined;
  const cuisine = searchParams.get("cuisine") || undefined;
  const priceStr = searchParams.get("price");
  const priceRange = priceStr ? Number(priceStr) : undefined;

  // React Query keys off the SERIALIZED input, so passing a fresh object each
  // render is fine — changing filters produces a new key and a new fetch,
  // and identical filters hit the cache.
  const listQuery = trpc.restaurants.list.useQuery({ q, cuisine, priceRange });

  // Loaded once; drives the cuisine dropdown.
  const cuisinesQuery = trpc.restaurants.cuisines.useQuery();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Restaurants
        </h1>
        <p className="mt-1 text-muted">
          {listQuery.isLoading
            ? "Loading…"
            : `${listQuery.data?.length ?? 0} ${
                listQuery.data?.length === 1 ? "place" : "places"
              } to explore`}
        </p>
      </header>

      <RestaurantFilters cuisines={cuisinesQuery.data ?? []} />

      {listQuery.error ? (
        <p className="text-red-600">Error: {listQuery.error.message}</p>
      ) : listQuery.isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <RestaurantGrid restaurants={listQuery.data ?? []} />
      )}
    </main>
  );
}
