# Notes 01 — Monorepo layout & the tRPC round-trip

Learning notes from pairing on Pricy. Covers: how the packages depend on each
other, how one API call travels browser → Postgres → browser, what the web
zone's `react.tsx` does, and why its two providers exist.

> These are *learning notes*, not an ADR. Decision records go in `docs/adr/`.

---

## 1. Package layers — who depends on whom

The repo is a **pnpm workspace** (`pnpm-workspace.yaml` globs `apps/*` and
`packages/*`). That glob is what lets one folder import another by name via the
`"workspace:*"` protocol — pnpm symlinks the local package instead of
downloading from npm, so edits are live with no publish step.

```
LAYER 3 · apps (deployable Next.js zones)

┌─ @pricy/web  (:3001) ───────────────────────┐     ┌─ @pricy/marketing (:3000) ──────────┐
│ dependencies:                                │     │ dependencies:                        │
│   "@pricy/api": "workspace:*"                │     │   next, react, react-dom             │
│   "@trpc/client": "^11.18.0"                 │     │   (no @pricy/* runtime dep)          │
│   "@trpc/react-query": "^11.18.0"            │     │ devDependencies:                     │
│   "@tanstack/react-query": "^5.101.4"        │     │   "@pricy/config": "workspace:*"     │
│   next, react, react-dom                     │     └──────────────────────────────────────┘
│ devDependencies:                             │     ┌─ @pricy/admin (:3002) ───────────────┐
│   "@pricy/config": "workspace:*"             │     │ dependencies:                        │
└──────────────────────────────────────────────┘     │   next, react, react-dom             │
                     │                                │   (no @pricy/* runtime dep)          │
   the ONE runtime   │  "@pricy/api": "workspace:*"   │ devDependencies:                     │
   link in the repo  │  (it's in dependencies)        │   "@pricy/config": "workspace:*"     │
                     ▼                                └──────────────────────────────────────┘
┌─ @pricy/api ────────────────────────────────┐
│ "exports": { ".": "./src/index.ts" }         │      marketing + admin have NO arrow down:
│ dependencies:                                │      their only @pricy/* line is the
│   "@pricy/db": "workspace:*"                 │      devDep on @pricy/config. That's why
│   "@trpc/server": "^11.18.0"                 │      only web renders real data today.
│   "zod": "^4.4.3"                            │
│ devDependencies:                             │
│   "@pricy/config": "workspace:*"             │
└──────────────────────────────────────────────┘
                     │
                     │  "@pricy/db": "workspace:*"  (it's in dependencies)
                     ▼
┌─ @pricy/db ─────────────────────────────────┐
│ "exports": { ".": "./src/index.ts" }         │
│ dependencies:                                │
│   "drizzle-orm": "^0.45.2"                   │
│   "postgres": "^3.4.9"  ← the ONLY Postgres dep in the whole repo
│ devDependencies:                             │
│   "@pricy/config": "workspace:*", drizzle-kit, dotenv, tsx
└──────────────────────────────────────────────┘

SIDE · @pricy/config  (leaf — no deps of its own)
  "files": ["tsconfig.base.json"]
  Listed in devDependencies of ALL five packages above.
  Build-time only: each package's tsconfig extends it. Never in a runtime bundle.
```

### Three things to remember

1. **The runtime spine is one straight line: `web → api → db`.** Only
   `@pricy/web` has a `@pricy/*` entry in its **`dependencies`**. That single
   line is the whole live connection between UI and database.
2. **`marketing` and `admin` are dead-ended today.** Their only `@pricy/*` link
   is `@pricy/config` in *devDependencies*. They gain
   `"@pricy/api": "workspace:*"` when those zones get built (build steps 3+/7).
3. **`postgres` appears exactly once, at the bottom.** No app lists it. That's
   the *type-only boundary* made physical (see §2).

### `dependencies` vs `devDependencies`

| Edge | Line | Section | Meaning |
|---|---|---|---|
| web → api | `"@pricy/api": "workspace:*"` | `dependencies` | ships at runtime |
| api → db | `"@pricy/db": "workspace:*"` | `dependencies` | runtime queries |
| everyone → config | `"@pricy/config": "workspace:*"` | `devDependencies` | build-time only |

### Raw-TS exports force `transpilePackages`

`api` and `db` set `"exports": { ".": "./src/index.ts" }` — pointing at raw
TypeScript, not a compiled `dist/`. There is no per-package build step. That is
exactly why `apps/web/next.config.js` carries
`transpilePackages: ["@pricy/api", "@pricy/db"]` — Next compiles the TS itself.
**Add a new package to the runtime spine → add it to `transpilePackages` too**,
or Next chokes on the raw TS.

---

## 2. The tRPC round-trip — one call, browser → Postgres → browser

Tracing `trpc.restaurants.list.useQuery()`. The horizontal split is the
**type-only boundary**: everything above ships to the browser, everything below
runs only on the server.

```
 BROWSER (client bundle)                    SERVER (never shipped to browser)
 ───────────────────────                    ─────────────────────────────────
 ① page.tsx  trpc.restaurants.list.useQuery()
 ② react.tsx  typed client + React Query cache (miss → fetch)
 ③ httpBatchLink  GET /app/api/trpc?batch=1&input=…
        │ ……… HTTP ………▶  ④ Next strips basePath  /app → ""
                          ⑤ route.ts  fetchRequestHandler, endpoint "/api/trpc",
                             createContext() → { db }, resolves "restaurants.list"
                          ⑥ appRouter → restaurantsRouter.list
                             ctx.db.select().from(restaurants)
                          ⑦ Drizzle → postgres-js → Postgres → rows
        ◀……… JSON ………  ⑧ serialize rows
 ⑨ httpBatchLink resolves → React Query caches under ["restaurants","list"]
 ⑩ hook returns { data, isLoading:false } → component re-renders
```

### Key points per stop

- **② is the type-only boundary.** `AppRouter` is imported with `import type`,
  so the browser knows the *shape* of every procedure (autocomplete,
  type-checking, `RouterOutputs`) but contains none of the query code.
- **GET vs POST:** `.query` → GET, `.mutation` → POST. That's why `route.ts`
  exports the same handler as both.
- **The basePath gotcha (④/⑤):** the browser calls `/app/api/trpc` *with*
  `/app`; Next strips `/app` before the route handler runs, so the handler's
  `endpoint` must be `/api/trpc` *without* it. The adapter does
  `pathname.slice(endpoint.length)` — too long an endpoint eats characters off
  the procedure name (`restaurants.list` → `taurants.list`).
- **Context (⑤):** `createContext()` builds `{ db }` fresh **per request**.
  This is where the logged-in user/session will later be attached. Procedures
  reach the db via `ctx.db`, never by importing it — which is the seam that
  makes procedures unit-testable with a fake `ctx`.
- **`postgres` never climbs up (⑦).** web depends on api depends on db, yet the
  Postgres driver stays server-side because only a *type* crossed at ②.

### The three mechanisms, visible in one call

- **`workspace:*`** — why `import { appRouter } from "@pricy/api"` in route.ts
  resolves to the local package.
- **`transpilePackages`** — why Next can compile that raw-TS import.
- **type-only boundary** — the horizontal split: `import type` at ② vs value
  `import` at ⑤. Same package name, imported two different ways.

---

## 3. `apps/web/src/trpc/react.tsx` — the client half of the API

The browser-side entry point to the API (counterpart to `route.ts`, the server
entry point). One per zone, `"use client"`. Three jobs:

**Job 1 — the typed client**
```ts
export const trpc = createTRPCReact<AppRouter>();
```
`<AppRouter>` is a *type* param → zero server code shipped. Generates a React
Query hook (`.useQuery`, `.useMutation`, …) for every procedure automatically.

**Job 2 — output types**
```ts
export type RouterOutputs = inferRouterOutputs<AppRouter>;
```
Lets UI derive types from the API's return types, e.g. in `restaurant-grid.tsx`:
`type Restaurant = RouterOutputs["restaurants"]["list"][number];`. Schema change
→ procedure return type changes → component either keeps compiling or points at
what to fix. No hand-maintained DTOs drifting.

**Job 3 — the provider (runtime plumbing)**
```tsx
const [queryClient] = useState(() => new QueryClient());        // the cache
const [trpcClient]  = useState(() => trpc.createClient({        // the transport
  links: [httpBatchLink({ url: "/app/api/trpc" })],
}));
```
- `useState(() => …)` creates each **once per browser session**, not per render.
  Bare `new QueryClient()` in the body would throw away the cache every render
  and re-fetch forever.
- The transport URL includes **`/app`** (browser-facing, with basePath) — the
  mirror of route.ts's `/api/trpc` (server-facing, without).

Per-zone, not shared: the admin zone gets its *own* `react.tsx` pointing at
`/admin/api/trpc`. The shared thing is `packages/api` (router + types); the
client wiring is app-local because URL/basePath differ per zone.

---

## 4. Why `trpc.Provider` gets BOTH `client` and `queryClient`

```tsx
<trpc.Provider client={trpcClient} queryClient={queryClient}>   // @trpc/react-query
  <QueryClientProvider client={queryClient}>                    // @tanstack/react-query
    {children}
```

`queryClient` is passed **twice** on purpose. These are **two different
libraries with two separate React Contexts**. tRPC's hooks are a thin wrapper
over React Query, so each provider must be handed what it needs:

| Prop | Given to | Why |
|---|---|---|
| `client={trpcClient}` | `trpc.Provider` only | the HTTP transport — a tRPC-only concept React Query doesn't have |
| `queryClient={queryClient}` | **both** providers | one shared cache, so tRPC's imperative helpers *and* React Query's hooks read/write the same store |

**Why tRPC needs its own reference to the cache:** hooks aren't the only way
tRPC touches it. Imperative utilities bypass hooks:
```ts
const utils = trpc.useUtils();
await utils.restaurants.list.invalidate();   // reaches into the cache directly
```
For that, tRPC's provider must hold the query client itself.

**The bug this prevents:** the two must be the **same instance**. If tRPC held
cache A and `QueryClientProvider` held cache B, then hooks read/write B while
`invalidate()` pokes A → invalidations "succeed" but the UI never updates.
Passing one `queryClient` to both keeps them in sync.

> Footnote: tRPC v11 also ships a newer integration with a single provider (no
> double-pass). This code uses the classic `createTRPCReact` pattern, where the
> two-provider + shared-`queryClient` shape is correct.

### How the providers get "triggered" (runtime)

They don't run logic — they put values into React Context. They're "triggered"
when a descendant hook (`trpc.restaurants.list.useQuery()` in `page.tsx`) reads
that context via `useContext`:

1. `TRPCProvider` mounts (from `layout.tsx`), `useState` builds `queryClient` +
   `trpcClient` once, providers place them in context. Nothing fetched yet.
2. `page.tsx` renders → the hook reads both contexts → gets the transport +
   cache → cache miss → fetches → returns `{ isLoading: true }`.
3. Response lands in `queryClient` → hook re-renders with `data`.
4. Later re-renders/navigation reuse the *same* `queryClient` → cache hits, no
   HTTP. (This is why persistence via `useState` matters.)

Remove `QueryClientProvider` → "No QueryClient set" throw. Remove
`trpc.Provider` → no transport, throw. The providers are the two dependencies
every `trpc.*.useQuery()` silently requires.
