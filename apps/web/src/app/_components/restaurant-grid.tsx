// Presentational component: given a list of restaurants, render them as cards.
// No data fetching here — it just displays whatever it's handed (the page
// does the useQuery and passes the data in).

import type { RouterOutputs } from "@/trpc/react";
import Link from "next/link";

// "the type restaurants.list returns" → an array; [number] = one item of it.
type Restaurant = RouterOutputs["restaurants"]["list"][number];

function priceLabel(range: number | null): string {
  return range && range > 0 ? "$".repeat(range) : "—";
}

export function RestaurantGrid({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Restaurants
        </h1>
        <p className="mt-1 text-muted">
          {restaurants.length} places to explore
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((r) => (
          <Link
            key={r.id}
            href={`/restaurants/${r.id}`}
            className="block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <article
              key={r.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-28 items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 text-4xl">
                🍽️
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold leading-tight text-ink">{r.name}</h2>
                  <span className="shrink-0 text-sm font-semibold text-brand-strong">
                    {priceLabel(r.priceRange)}
                  </span>
                </div>

                <span className="mt-2 inline-block rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-brand-strong">
                  {r.cuisineType}
                </span>

                {r.address && (
                  <p className="mt-3 text-sm text-muted">{r.address}</p>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
