/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app owns the "/admin" zone. basePath prefixes every route and asset
  // with /admin, so links/CSS resolve correctly both locally
  // (http://localhost:3002/admin) and in production behind the marketing
  // rewrite (pricy.com/admin/*). See CLAUDE.md "Multi-Zone wiring".
  basePath: "/admin",
};

export default nextConfig;
