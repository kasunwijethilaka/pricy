// Web-zone header. A plain Server Component — no hooks, no interactivity, so
// it ships zero client JS. Rendered once in the root layout, above every page.

import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand → web-zone home (the list). Same zone, so <Link>. */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-ink"
        >
          <span aria-hidden className="text-xl">
            🍽️
          </span>
          Pricy
        </Link>

        <span className="hidden text-sm text-muted sm:block">
          Browse menus · estimate your bill
        </span>
      </div>
    </header>
  );
}
