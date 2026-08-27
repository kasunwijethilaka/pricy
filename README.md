# Pricy

Browse restaurant menus with **real prices** and estimate your bill — subtotal,
tax, service charge, tip, and per-person split — before you order.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC-2596BE?style=flat&logo=trpc&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat&logo=drizzle&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=flat&logo=turborepo&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

---

## Features

- 🍽️ **Browse restaurants** — search and filter by cuisine, price range, and free text.
- 📋 **Real menus, real prices** — every item carries a price, currency, and description.
- 🧮 **Bill calculator** — add items and get subtotal, tax, service charge, tip, and a per-person split before you order.
- ⭐ **Favorites & history** — save the places you like and revisit what you've priced (requires an account).
- 📈 **Price history** — prices are tracked over time so trends can be charted per item.
- 🤖 **AI menu import** *(roadmap)* — snap a photo of a menu and have it extracted into structured data for review.

## Tech stack

Grouped by the problem each tool solves — the stack is deliberately chosen so
the API and business logic can be reused by a future mobile client without a
rewrite.

| Layer | Choice | Role |
| --- | --- | --- |
| **Monorepo** | Turborepo + pnpm workspaces | One repo, many apps/packages, cached task graph |
| **Frontend** | Next.js (App Router) + React | Server components, routing, SSR/SSG per zone |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first styling with accessible component primitives |
| **API layer** | tRPC | End-to-end typesafe procedures, defined once, shared by every app |
| **ORM** | Drizzle ORM | Typesafe SQL and migration-driven schema changes |
| **Database** | PostgreSQL (Neon serverless) | Relational data — restaurants, menus, price history |
| **Auth** | Auth.js (NextAuth v5) | Email + OAuth, one session shared across all zones |
| **Cache** | Redis (Upstash) | Low-latency reads for hot queries |
| **Object storage** | Cloudflare R2 (S3-compatible) | Restaurant and menu-item images |
| **AI** | Anthropic API (vision) | Menu photo → structured JSON extraction *(roadmap)* |
| **Deployment** | Vercel | One project per zone, deployed independently |

## Architecture

Pricy is a **Turborepo monorepo** deployed as a **Multi-Zone** app: three
independent Next.js apps ("zones") that behave as one site on a single domain.

- **`marketing`** owns `/` — the public, SEO-facing front door. It has read-only database access.
- **`web`** owns `/app` — the bill calculator, favorites, and visit history.
- **`admin`** owns `/admin` — menu submission, moderation, and AI import.

The zones deploy independently but share three things that make them feel like
one app:

1. **A single tRPC API** in `packages/api` — the one source of truth for every
   query. No app duplicates data logic; each imports the procedures it's
   allowed to use.
2. **A shared session cookie** scoped to the domain, so signing in once works
   across every zone.
3. **Rewrites** — the marketing zone proxies `/app/*` and `/admin/*` to the
   other zones, so visitors only ever see one domain.

> **Why Multi-Zone?** Each zone can be developed, built, and deployed on its own
> pipeline, and can scale independently — the public marketing site and the
> logged-in app don't share a blast radius — while users experience a single,
> seamless site.

### Repo layout

```
apps/
  marketing/   # "/" zone — public site, SEO, read-only DB access
  web/         # "/app" zone — bill calculator, favorites, history
  admin/       # "/admin" zone — submissions, moderation, AI import
packages/
  api/         # shared tRPC routers — the single source of truth
  ui/          # shared shadcn/ui components
  db/          # Drizzle schema + migrations
  bill-calc/   # pure, framework-agnostic bill logic (unit tested)
  config/      # shared eslint / tsconfig
```

### Data model

| Table | Key fields |
| --- | --- |
| `users` | id, email, name, image_url, created_at |
| `restaurants` | id, name, cuisine_type, address, lat, lng, price_range, cover_image_url |
| `menu_items` | id, restaurant_id, name, category, price, currency, description, image_url |
| `price_history` | id, menu_item_id, price, recorded_at |
| `favorites` | user_id, restaurant_id (composite key) |
| `menu_submissions` | id, user_id, restaurant_id, status, payload (jsonb) |

`price_history` is its own table (rather than a JSON field on `menu_items`) so
price trends can be queried and charted independently.

## Getting started

### Prerequisites

- **Node 22** — pinned in [`.nvmrc`](./.nvmrc); run `nvm use` to match it.
- **pnpm 11** — pinned via the `packageManager` field; pnpm self-manages to it.

### Setup

```bash
nvm use          # switch to Node 22
pnpm install     # install all workspaces
```

### Development

One command boots **every zone** at once (via `turbo run dev`):

```bash
pnpm dev
```

Each zone is a separate server on its own port:

| Zone        | URL                         | Port | Owns path |
| ----------- | --------------------------- | ---- | --------- |
| `marketing` | http://localhost:3000       | 3000 | `/`       |
| `web`       | http://localhost:3000/app   | 3001 | `/app`    |
| `admin`     | http://localhost:3000/admin | 3002 | `/admin`  |

**Always visit the app through `localhost:3000`** — the marketing zone is the
front door and *rewrites* `/app/*` and `/admin/*` to the other zones. Because
each zone is its own server, **all three must be running** for cross-zone links
to work; if a target zone is down you'll get a 500 (`ECONNREFUSED`) when its
path is requested. The web/admin ports (3001/3002) also serve directly, mainly
for isolated debugging.

### Environment variables

Local dev needs none — the rewrites fall back to `localhost:3001` / `:3002`.
See [`apps/marketing/.env.example`](./apps/marketing/.env.example) for the
`WEB_ZONE_URL` / `ADMIN_ZONE_URL` variables set in production.

### Common scripts

Run from the repo root; Turbo fans each out across the workspaces:

```bash
pnpm dev         # run all zones in dev mode
pnpm build       # production build of every zone
pnpm lint        # lint all packages
pnpm typecheck   # type-check all packages
```

## Roadmap

- [x] Foundations — Turborepo, three zones, Drizzle schema, Auth.js
- [x] Multi-Zone wiring — rewrites, shared cookie, path-filtered CI
- [x] Restaurant + menu CRUD — seed data, listing and detail pages
- [x] Search & filters — cuisine, price range, text
- [ ] Bill calculator — fully unit-tested, in the Web zone
- [ ] User accounts — favorites, visit history
- [ ] Owner/admin submission flow — add/edit restaurant + menu
- [ ] AI menu import — photo → vision → structured menu → human review
- [ ] Polish — PWA, map view, analytics
