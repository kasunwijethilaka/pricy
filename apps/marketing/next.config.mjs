// Where the "/app" (web) zone lives. Differs per environment, so it comes from
// an env var, with a local-dev fallback. In production set WEB_ZONE_URL in
// Vercel to the web zone's deployment URL. Server-side only (no NEXT_PUBLIC_).
const WEB_ZONE_URL = process.env.WEB_ZONE_URL ?? "http://localhost:3001";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Multi-Zone stitching: the marketing app is the front door at "/". Any
  // request under /app/* is transparently proxied to the web zone, so the
  // whole thing looks like one site on a single domain. The web zone sets
  // basePath "/app", so all its pages AND assets live under /app — which is
  // why this single /app/:path* rule is enough to catch everything.
  async rewrites() {
    return [
      { source: "/app", destination: `${WEB_ZONE_URL}/app` },
      { source: "/app/:path*", destination: `${WEB_ZONE_URL}/app/:path*` },
    ];
  },
};

export default nextConfig;
