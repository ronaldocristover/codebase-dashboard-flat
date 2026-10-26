# TokoKu Dashboard — Context

Project context for humans and agents. For detailed architecture see
[`SYSTEM-DESIGN.md`](./SYSTEM-DESIGN.md). For coding rules see
[`AGENTS.md`](../AGENTS.md) and
[`svelte-best-practices.md`](./svelte-best-practices.md).

## What this is

**TokoKu** is an admin dashboard for a fictional online store. It is a UI demo,
not a production product. Sample data is served by a dummy in-memory API: no
database, no external backend, no persistence.

Status: feature work is complete for the demo scope — login, dashboard, member
list, and member create/detail/edit. Verify with the commands below rather than
trusting this line.

## Stack

| Area | Choice |
| --- | --- |
| Framework | SvelteKit 3, Svelte 5 (runes), TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (`@theme` tokens, no config file) |
| Test | Vitest 4 + jsdom + `@testing-library/svelte` |
| Icons/charts | Inline SVG. No icon or chart library. |
| Font | Plus Jakarta Sans (Google Fonts, `src/app.html`) |
| Adapter | `adapter-auto` (no deploy target yet) |

## Commands

```sh
npm run dev                 # dev server (5173, or 5174 when busy)
npm run dev -- --port 5174  # another port
npm test                    # all tests, single run
npm run test:unit           # vitest watch
npm run check               # svelte-check + sync
npm run build               # production build
npm run preview             # preview the build
```

Do not kill the dev server with `pkill -f "vite dev"` from the same shell — the
pattern also matches that shell's own command line and kills it. Use
`kill $(lsof -t -i:5174)`, with the port the server is actually on.

## Directory map

```
src/
  app.html                     font, <html lang="en">, title
  lib/
    components/                UI components + colocated tests
    mock/                      sample data (members, orders, dashboard)
    server/                    server-only modules (in-memory member store)
    stores/                    auth + UI state (in-memory)
    utils/                     format, validation, filter/sort/paginate (pure)
    types.ts                   domain types
  routes/
    layout.css                 @theme design tokens + body
    +layout.svelte             root (favicon)
    login/                     login page
    api/members/
      +server.ts               GET, POST   /api/members
      [id]/+server.ts          GET, PATCH  /api/members/[id]
      [id]/orders/+server.ts   GET        /api/members/[id]/orders
    (dashboard)/               shell: sidebar + top nav
      +layout.ts               guard (ssr = false)
      +layout.svelte           shell
      +error.svelte            404 that keeps the shell
      +page.svelte             dashboard
      member/+page.ts          loads the member list from the API
      member/+page.svelte      member table
      member/new/+page.svelte  create member
      member/[id]/+page.ts     loads member + orders
      member/[id]/+page.svelte member detail
      member/[id]/edit/+page.ts         loads member for editing
      member/[id]/edit/+page.svelte     edit form
```

## Core conventions

- Internal imports use `#lib/*` (`$lib` was removed in SvelteKit 3).
- Svelte 5 runes: `$state`, `$derived`, `$effect`, `$props`. No `export let`,
  `$:`, `on:click`, or slots.
- Non-UI logic is pure functions in `src/lib/utils/` and tested separately.
  Member field rules live in `memberValidation.ts` so the API and the forms
  share them.
- `src/lib/server/` is server-only. Only `+server.ts` files import it; pages get
  data through `fetch` in `+page.ts`.
- Components take typed props; no global store for page state. Stores are
  reserved for login status and sidebar/drawer state.
- UI copy is English. Currency keeps `Rp` plus Indonesian digit grouping
  (`toLocaleString('id-ID')`); dates use English month names.
- Tailwind utilities directly in markup. Colors come from `@theme` tokens, not
  raw hex.
- Flat design: no gradients, no shadows, no large radii.

## Deliberate limits

- **Mock auth.** `src/lib/stores/auth.ts` accepts any valid email plus a non-empty
  password, held in memory. Refresh logs you out. The guard is UX, not security.
- **Dummy API.** `src/lib/server/memberStore.ts` keeps members in module-level
  arrays seeded from `src/lib/mock/members.ts`; orders are generated in
  `src/lib/mock/orders.ts`. Create and edit calls work until the server restarts,
  then reset. Endpoints are unauthenticated.
- **Mock data.** Member dates are relative to today (`isoDaysAgo`) so the
  7/30/90-day filters never come up empty.
- **Dead menu.** Products, Orders, and Reports have no pages; they render as
  non-navigating buttons. Unknown routes use `(dashboard)/+error.svelte`.
- **No production adapter.** The build succeeds but the app is not ready to
  deploy.

## Decision history

- SvelteKit 3 (not 2) because that is what `sv create` generated when the project
  started.
- Tests moved from Playwright browser mode to jsdom because Playwright is not
  available on this machine.
- `resolve.conditions: ['browser']` is active only under `VITEST`, so
  `@testing-library/svelte` mounts the browser build of Svelte instead of the
  server build.
- `src/lib/server/**` is excluded from the Vitest `include` list; store logic
  stays thin and testable rules sit in `utils`.
- Sidebar state lives in a module store, not `localStorage`: it resets on every
  refresh.
- The guard is in `(dashboard)/+layout.ts` with `ssr = false`; the shell is not
  rendered on the server.
- Member pages were added on top of the dummy API rather than a real backend, to
  keep the repo dependency-free and runnable offline.
