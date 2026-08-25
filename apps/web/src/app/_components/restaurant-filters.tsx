"use client";

// The filter bar for the restaurant list.
//
// The filters live in the URL query string (?q=…&cuisine=…&price=…), not in
// React state. Why URL state:
//   - shareable  — paste the link, someone sees the same filtered view
//   - refresh-safe — reloading keeps your filters
//   - back-button works — each applied filter is a navigable step
//   - the page reads the SAME params to build its tRPC query, so URL is the
//     single source of truth (this component writes it, the page reads it).

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// price_range is a smallint 1–4; render it as $ … $$$$.
const PRICE_OPTIONS = [1, 2, 3, 4];

export function RestaurantFilters({ cuisines }: { cuisines: string[] }) {
  // next/navigation client hooks:
  //   useSearchParams() → a READONLY URLSearchParams of the current query.
  //   usePathname()     → the current path ("/") without the query.
  //   useRouter()       → programmatic navigation; we use .replace() so
  //                       filter changes don't pile up in history.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The text box is the one control with LOCAL state: we let the user type
  // freely and only push to the URL after they pause (debounce), so we don't
  // fire a query + URL write on every keystroke.
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  // Write a single param into the URL, preserving the others. Passing an
  // empty value removes the param entirely (so it drops out of the query).
  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const query = params.toString();
    // scroll: false keeps the viewport put when filters change.
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  // Debounce the text box → URL. The timer resets whenever `q` changes (the
  // cleanup clears the pending write), so the URL only updates 300ms after
  // the last keystroke. `searchParams` is in the deps so the write always
  // merges onto the CURRENT query (e.g. if a dropdown changed meanwhile).
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((searchParams.get("q") ?? "") !== q.trim()) {
        setParam("q", q.trim());
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, searchParams]);

  const cuisine = searchParams.get("cuisine") ?? "";
  const price = searchParams.get("price") ?? "";
  const hasFilters = Boolean(q || cuisine || price);

  function clearAll() {
    setQ("");
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search restaurants…"
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-orange-100 sm:max-w-xs"
      />

      <select
        value={cuisine}
        onChange={(e) => setParam("cuisine", e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand sm:w-auto"
      >
        <option value="">All cuisines</option>
        {cuisines.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={price}
        onChange={(e) => setParam("price", e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand sm:w-auto"
      >
        <option value="">Any price</option>
        {PRICE_OPTIONS.map((p) => (
          <option key={p} value={String(p)}>
            {"$".repeat(p)}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-sm font-medium text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}
