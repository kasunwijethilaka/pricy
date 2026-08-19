/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @pricy/api and @pricy/db ship raw TypeScript source (their package.json
  // "exports" point at src/index.ts), so Next must compile them itself —
  // it doesn't transpile node_modules by default.
  transpilePackages: ["@pricy/api", "@pricy/db"],
  // This app owns the "/app" zone. basePath tells Next to prefix every route
  // and asset with /app, so links/CSS resolve correctly both locally
  // (http://localhost:3001/app) and in production behind the marketing
  // rewrite (pricy.com/app/*). See CLAUDE.md "Multi-Zone wiring".
  basePath: "/app",
};

export default nextConfig;
