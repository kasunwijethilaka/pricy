# Pricy

Browse restaurant menus with real prices and estimate your bill — subtotal, tax,
service charge, tip, and per-person split — before you order.

Pricy is a **Turborepo monorepo** deployed as a **Multi-Zone** app: three
independent Next.js apps ("zones") that behave as one site on a single domain.

> Architecture, data model, and conventions live in [CLAUDE.md](./CLAUDE.md).

## Prerequisites

- **Node 22** — the version is pinned in [`.nvmrc`](./.nvmrc); run `nvm use` to match it.
- **pnpm 11** — pinned via the `packageManager` field; pnpm self-manages to it.

## Setup

```bash
nvm use          # switch to Node 22
pnpm install     # install all workspaces
```

## Development

One command boots **every zone** at once (via `turbo run dev`):

```bash
pnpm dev
```

Each zone is a separate server on its own port:

| Zone        | URL                          | Port | Owns path  |
| ----------- | ---------------------------- | ---- | ---------- |
| `marketing` | http://localhost:3000        | 3000 | `/`        |
| `web`       | http://localhost:3000/app    | 3001 | `/app`     |
| `admin`     | http://localhost:3000/admin  | 3002 | `/admin`   |

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

## Common scripts

Run from the repo root; Turbo fans each out across the workspaces:

```bash
pnpm dev         # run all zones in dev mode
pnpm build       # production build of every zone
pnpm lint        # lint all packages
pnpm typecheck   # type-check all packages
```

## Repo layout

```
apps/
  marketing/   # "/" zone — public site, SEO
  web/         # "/app" zone — bill calculator, favorites, history
  admin/       # "/admin" zone — submissions, moderation, AI import
packages/
  config/      # shared tsconfig (eslint later)
```
