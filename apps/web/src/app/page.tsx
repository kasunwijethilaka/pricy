export default function AppHomePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-medium text-brand-strong">
          web zone · /app
        </span>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-ink">
          Bill calculator
        </h1>
        <p className="mt-3 max-w-xl text-lg text-muted">
          This is the <strong className="text-ink">web</strong> zone — where the
          bill calculator, favorites, and visit history will live. Right now it&apos;s
          a placeholder to prove the Multi-Zone routing works end to end.
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-muted">
          You&apos;re viewing this under the <code className="text-ink">/app</code>{" "}
          base path. Coming next (Milestone 5): the real calculator, powered by{" "}
          <code className="text-ink">packages/bill-calc</code> and tRPC.
        </div>

        {/*
          Cross-zone link back to the marketing zone MUST be a plain <a>, not
          next/link — <Link> only works for navigation *within* this app.
          In production the marketing zone lives at "/"; locally it runs on
          its own port (http://localhost:3000).
        */}
        <a
          href="/"
          className="mt-8 inline-block text-sm font-medium text-brand-strong hover:underline"
        >
          ← Back to pricy.com
        </a>
      </div>
    </main>
  );
}
