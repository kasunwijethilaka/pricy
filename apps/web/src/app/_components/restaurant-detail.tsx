// Presentational component: given ONE restaurant (with its nested menu items),
// render the detail page. No data fetching here — the page does the useQuery
// and passes the data in, mirroring page.tsx ↔ restaurant-grid.tsx.

import Link from "next/link";

import type { RouterOutputs } from "@/trpc/react";

// The type restaurants.byId returns — a single object (not an array), whose
// `menuItems` is the nested relation we fetched with `with: { menuItems: true }`.
type Restaurant = RouterOutputs["restaurants"]["byId"];

function priceLabel(range: number | null): string {
  return range && range > 0 ? "$".repeat(range) : "—";
}

// Menu prices are whole-rupee integers (e.g. 6500 = LKR 6,500), so just group
// the thousands — no decimals.
function formatPrice(currency: string, price: number): string {
  return `${currency} ${price.toLocaleString()}`;
}

export function RestaurantDetail({ restaurant }: { restaurant: Restaurant }) {
  const { name, cuisineType, address, priceRange, coverImageUrl, menuItems } =
    restaurant;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Back to the list — same-zone navigation, so <Link>. */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <span aria-hidden>←</span> All restaurants
      </Link>

      {/* Hero card */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 text-6xl sm:h-52">
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span aria-hidden>🍽️</span>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink">
                {name}
              </h1>
              <span className="mt-2 inline-block rounded-full bg-orange-50 px-3 py-0.5 text-xs font-medium text-brand-strong">
                {cuisineType}
              </span>
            </div>
            <span className="shrink-0 text-lg font-bold text-brand-strong">
              {priceLabel(priceRange)}
            </span>
          </div>

          {address && (
            <p className="mt-4 flex items-start gap-2 text-sm text-muted">
              <span aria-hidden>📍</span>
              {address}
            </p>
          )}
        </div>
      </div>

      {/* Menu */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-ink">Menu</h2>
          <span className="text-sm text-muted">{menuItems.length} items</span>
        </div>

        {menuItems.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center text-muted">
            No menu items yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {menuItems.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{item.name}</p>
                  {item.description && (
                    <p className="mt-0.5 text-sm text-muted">
                      {item.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 font-semibold text-ink">
                  {formatPrice(item.currency, item.price)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
