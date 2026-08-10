export default function AdminHomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-admin-strong">
          admin zone · /admin
        </span>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-ink">
          Menu moderation
        </h1>
        <p className="mt-3 max-w-xl text-lg text-muted">
          This is the <strong className="text-ink">admin</strong> zone — internal
          tools for submitting and editing restaurants and menus, moderating
          submissions, and (later) AI menu import. Right now it&apos;s a
          placeholder proving the Multi-Zone routing works end to end.
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 text-sm text-muted">
          You&apos;re viewing this under the{" "}
          <code className="text-ink">/admin</code> base path. Coming later
          (Milestone 7): restaurant &amp; menu submission, then AI menu import
          (Milestone 8) — the only zone allowed to call the Anthropic API.
        </div>

        {/*
          Cross-zone link back to the marketing zone MUST be a plain <a>, not
          next/link — <Link> only works for navigation *within* this app.
          In production the marketing zone lives at "/"; locally it runs on
          its own port (http://localhost:3000).
        */}
        <a
          href="/"
          className="mt-8 inline-block text-sm font-medium text-admin-strong hover:underline"
        >
          ← Back to pricy.com
        </a>
      </div>
    </main>
  );
}
