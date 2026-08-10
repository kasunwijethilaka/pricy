/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app owns the "/app" zone. basePath tells Next to prefix every route
  // and asset with /app, so links/CSS resolve correctly both locally
  // (http://localhost:3001/app) and in production behind the marketing
  // rewrite (pricy.com/app/*). See CLAUDE.md "Multi-Zone wiring".
  basePath: "/app",
};

export default nextConfig;
