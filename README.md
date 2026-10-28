# TokoKu Dashboard

Admin dashboard for a fictional online store, built with a flat design. SvelteKit
3, Svelte 5 (runes), TypeScript, and Tailwind CSS v4. Data comes from a dummy
in-memory API — no database, no real backend.

## Quick start

```sh
npm install
npm run dev
```

Open `http://localhost:5173` (Vite moves to `5174` if the port is busy). Login
accepts the demo account `rina@tokoku.id` / `rahasia`. The session is an
`httpOnly` cookie, but sessions live in server memory, so a restart logs you out.

## Commands

```sh
npm test          # all tests
npm run test:unit # vitest watch
npm run check     # svelte-check
npm run build     # production build
npm run preview   # preview the build
```

## Features

- `/login` — sign-in form with a branding panel
- `/logout` — POST action that destroys the session and returns to `/login`
- `/` — ecommerce dashboard: KPI cards, sales trend, conversion funnel,
  customer mix, revenue by channel, top products, inventory alerts, recent orders
- `/member` — member table with search, status/date filters, sorting, pagination,
  Excel export and import with a downloadable template
- `/member/new` — create a member
- `/member/[id]` — member detail with that member's orders
- `/member/[id]/edit` — edit an existing member
- `/form-element` — showcase of reusable form controls (inputs, pickers, tabs, feedback)
- Responsive sidebar (drawer on mobile), avatar dropdown with logout

## API

Reads and writes go through route handlers backed by
`src/lib/server/memberStore.ts` (members, in memory) and
`src/lib/mock/orders.ts` (sample orders per member). Changes survive navigation
but not a server restart. Every `/api/*` request needs a session; without one the
guard in `src/hooks.server.ts` answers `401 {"error":"Unauthorized"}`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/members` | List members |
| `POST` | `/api/members` | Create a member |
| `GET` | `/api/members/[id]` | Read one member |
| `PATCH` | `/api/members/[id]` | Update a member |
| `GET` | `/api/members/[id]/orders` | Orders for one member |

## Structure

```
src/hooks.server.ts   reads the session cookie, sets locals.user, answers /api/* with 401
src/lib/components/   UI components + colocated tests
src/lib/mock/         sample data (members, orders, dashboard)
src/lib/server/       server-only modules (session, rate limit, logger, HTTP helpers, member store)
src/lib/stores/       UI state (sidebar, mobile drawer)
src/lib/utils/        format, validation, filter, sort, pagination (pure)
src/routes/           pages, dashboard shell, server guard, API routes
```

## Documentation

- [Project context](docs/CONTEXT.md)
- [System design](docs/SYSTEM-DESIGN.md)
- [Svelte 5 & SvelteKit 3 best practices](docs/svelte-best-practices.md)
- [Agent rules](AGENTS.md)

## Limitations

A UI demo, not a production product. Auth is a server session: the `tokoku_session`
`httpOnly` cookie is resolved in `src/hooks.server.ts` into `event.locals.user`,
the guard in `(dashboard)/+layout.server.ts` redirects a signed-out visitor to
`/login`, and `/api/*` answers `401` without a session. Sessions live in process
memory, so a restart logs everyone out. The API is a dummy and loses data on
restart. Products, Orders, and Reports have no pages. No deploy adapter is
configured.
