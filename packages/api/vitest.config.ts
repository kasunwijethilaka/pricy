import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Tests live in the top-level test/ tree (mirroring src/), not co-located.
    include: ["test/**/*.test.ts"],

    // Server-side code — run in Node, not a browser-like (jsdom) environment.
    environment: "node",

    // Runs BEFORE any test module is imported. We use it to load DATABASE_URL
    // so that importing @pricy/db (which reads it at import time) doesn't throw.
    setupFiles: ["./vitest.setup.ts"],

    server: {
      deps: {
        // Our workspace packages (@pricy/api, @pricy/db) ship raw TypeScript
        // from src/, not a built dist/. "inline" tells Vitest to transform
        // them itself instead of treating them as prebuilt node_modules —
        // the Vitest equivalent of Next's `transpilePackages`.
        inline: [/@pricy\//],
      },
    },
  },
});
