// Web-zone footer. Also a plain Server Component. The year is computed at
// render time on the server, so there's no client/server hydration mismatch.

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted sm:flex-row">
        <p>© {year} Pricy · Menu prices are for reference only.</p>
        <p>Colombo, Sri Lanka</p>
      </div>
    </footer>
  );
}
