// Where the other zones live. These differ per environment, so they come from
// env vars, with local-dev fallbacks. In production set WEB_ZONE_URL and
// ADMIN_ZONE_URL in Vercel to each zone's deployment URL. Server-side only
// (no NEXT_PUBLIC_) — the browser never needs these internal URLs.
const WEB_ZONE_URL = process.env.WEB_ZONE_URL ?? "http://localhost:3001";
const ADMIN_ZONE_URL = process.env.ADMIN_ZONE_URL ?? "http://localhost:3002";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Multi-Zone stitching: the marketing app is the front door at "/". Any
  // request under /app/* or /admin/* is transparently proxied to the matching
  // zone, so the whole thing looks like one site on a single domain. Each zone
  // sets its own basePath, so all its pages AND assets live under that prefix —
  // which is why a single :path* rule per zone catches everything.
  async rewrites() {
    return [
      { source: "/app", destination: `${WEB_ZONE_URL}/app` },
      { source: "/app/:path*", destination: `${WEB_ZONE_URL}/app/:path*` },
      { source: "/admin", destination: `${ADMIN_ZONE_URL}/admin` },
      { source: "/admin/:path*", destination: `${ADMIN_ZONE_URL}/admin/:path*` },
    ];
  },
};

export default nextConfig;
