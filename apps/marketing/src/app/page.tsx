export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-orange-50 via-white to-white">
      {/* soft decorative glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-orange-200/40 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-5xl flex-col px-6">
        <header className="flex items-center justify-between py-6">
          <span className="text-lg font-bold tracking-tight text-ink">
            Pricy
          </span>
          <nav className="flex items-center gap-6 text-sm text-muted">
            {/* Cross-zone links MUST be plain <a>, never <Link> (Multi-Zone rule) */}
            <a href="/app" className="transition-colors hover:text-ink">
              Bill calculator
            </a>
            <a
              href="/app"
              className="rounded-full bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-brand-strong"
            >
              Open app
            </a>
          </nav>
        </header>

        <section className="flex flex-col items-center py-24 text-center sm:py-32">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-brand-strong backdrop-blur">
            Real menu prices, no surprises
          </span>

          <h1 className="max-w-3xl text-balance text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">
            Know the bill{" "}
            <span className="text-brand">before</span> you order.
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg text-muted">
            Browse restaurant menus with real prices, add what you&apos;re
            craving, and get an instant estimate — tax, service charge, tip, and
            the split per person.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="/app"
              className="rounded-full bg-brand px-7 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-brand-strong"
            >
              Estimate a bill
            </a>
            <a
              href="/app"
              className="rounded-full border border-slate-200 bg-white px-7 py-3 text-base font-semibold text-ink transition-colors hover:border-slate-300"
            >
              Browse restaurants
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
