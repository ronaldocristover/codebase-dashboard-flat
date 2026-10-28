# AGENTS.md — TokoKu Dashboard

Rules for agents working in this repo. Read also:

- [`docs/CONTEXT.md`](docs/CONTEXT.md) — project context, commands, limits
- [`docs/SYSTEM-DESIGN.md`](docs/SYSTEM-DESIGN.md) — routes, layers, data flow
- [`docs/svelte-best-practices.md`](docs/svelte-best-practices.md) — Svelte 5 / SvelteKit 3 rules

## What this is

Admin dashboard for a fictional online store. Mock data served by a dummy
in-memory API. No database, no production backend. Focus: flat UI, responsive,
English copy.

## Commands

```sh
npm run dev                 # dev server (default 5173, 5174 if taken)
npm test                    # all tests, single run
npm run test:unit           # vitest watch
npm run check               # svelte-check, must be 0 errors
npm run build               # build verification
```

Do not stop the dev server with `pkill -f "vite dev"`; the pattern matches the
calling shell and can kill it too. Use `kill $(lsof -t -i:5174)`, with the port
the server actually runs on.

## Structure and imports

- Internal imports always `#lib/...` (`$lib` is gone in SvelteKit 3).
- `src/routes/` for pages and composition; `src/lib/components/` for components;
  `src/lib/utils/` for pure logic; `src/lib/stores/` for global state;
  `src/lib/mock/` for sample data; `src/lib/server/` for server-only modules.
- Never import from `src/routes/` into `src/lib/`.
- `#lib/server/*` is server-only. Import it from `+server.ts` (or
  `+page.server.ts`) only — never from components, pages, or `+page.ts`.
- Filter/sort/paginate/format logic stays in pure functions under `utils`, not in
  markup.

## Dummy API and data

- Store: `src/lib/server/memberStore.ts` — module-level arrays seeded from
  `src/lib/mock/members.ts`. `src/lib/mock/orders.ts` derives sample orders per
  member. Everything resets when the server restarts; there is no persistence.
- Endpoints: `GET /api/members`, `POST /api/members`, `GET /api/members/[id]`,
  `PATCH /api/members/[id]`, `GET /api/members/[id]/orders`.
- Endpoints answer `401 {"error":"Unauthorized"}` without a session, enforced once
  in `src/hooks.server.ts`. There are no roles or per-route permissions; a real
  API needs both.
- Validation lives in `src/lib/utils/memberValidation.ts` so API handlers and
  forms share one rule set. Do not duplicate field rules in markup.
- Pages read data through `fetch` in `+page.ts`. Do not import the store into
  page or component code.
- Keep mock member dates relative (`isoDaysAgo`) so the 7/30/90-day filters are
  never empty.

## Svelte 5

- Runes mode is forced by the compiler. No `export let`, `$:`, `on:click`, slots,
  or store auto-subscription for page state.
- `$state` for changing values, `$derived` / `$derived.by` for derived values,
  `$effect` only for side effects with cleanup.
- Props always typed: `let { x }: { x: string } = $props()`.
- Children do not mutate props; use callbacks (`onPageChange`) or `$bindable` when
  two-way binding is truly needed.
- Never answer Svelte API questions from memory. Use the Svelte MCP in
  `opencode.jsonc` (`list-sections`, `get-documentation`, `svelte-autofixer`) or
  Context7, then follow the current docs.

## SvelteKit 3

- Navigation state from `$app/state` (`page`, `navigating`), not `$app/stores`.
- Runtime info from `$app/env` (`browser`, `building`, `dev`), not
  `$app/environment`.
- New environment variables go through `src/env.ts` + `defineEnvVars`; no
  `$env/*`.
- The adapter is configured in `vite.config.ts` inside `sveltekit()`. There is no
  `svelte.config.js`.
- API routes are `+server.ts` files under `src/routes/api/`; return `json(...)`
  and throw `error(...)` from `@sveltejs/kit`. Validate the body before touching
  the store.
- Auth is a server session: `src/hooks.server.ts` reads the `tokoku_session`
  cookie and sets `event.locals.user`. The guard lives in
  `(dashboard)/+layout.server.ts`; `/api/*` answers `401` without a session.
  `ssr` stays on for the dashboard.
- Redirects use `redirect(303, '/login')` and are thrown, not returned.

## UI and styling

- Color and font tokens live only in `src/routes/layout.css` (`@theme`). Never
  write raw hex in markup.
- Palette: `primary #014BAA`, `cream #F8F3F0`, plus `line`, `ink`, `muted`,
  `success`, `warning`, `danger`.
- Flat design: no gradients, no `shadow-*`, max radius `rounded-lg`.
- Icons and charts are inline SVG. Do not add icon or chart libraries.
- Plus Jakarta Sans is loaded in `src/app.html`.
- All UI copy is English. Rupiah keeps the `Rp` prefix and Indonesian digit
  grouping (`toLocaleString('id-ID')`); dates use English month names.
- Layout must work on mobile: wide tables use `overflow-x-auto`, the sidebar
  becomes a drawer.

## Accessibility

- Every icon-only button needs an `aria-label`.
- Dropdowns: `aria-haspopup`, `aria-expanded`, close on Escape and outside click.
- Active pagination page: `aria-current="page"`.
- Nav items without a page render as `<button>`, not `<a href="#">`.
- Do not remove focus indicators without a clear replacement.

## Testing

- Every new non-trivial logic branch needs a test.
- Tests are colocated: `Name.test.ts` next to `Name.svelte`.
- Query by role/label, not class selectors.
- `expect.requireAssertions` is on: a test without assertions fails.
- Bug fix: write the failing test first, then fix.
- `src/lib/server/**` is excluded from Vitest in `vite.config.ts`. Keep the store
  thin and put the rules in `utils` where they can be tested.
- Before finishing: `npm test` and `npm run check` must pass.

## Boundaries to preserve

- Auth is a server session (`src/lib/server/session.ts` + `src/hooks.server.ts`).
  Sessions live in process memory, so a restart logs everyone out; the `shortcut:`
  comment in `session.ts` explains the limit.
- The API is a dummy: in-memory, resets on restart, and only checks that a
  session exists. Do not present it as a backend.
- Menu items Products, Orders, and Reports intentionally have no pages.
- There is no production adapter. Do not claim the app is deploy-ready.

## Don't

- Don't add a dependency for something a platform API already does.
- Don't change `package.json` / `tsconfig.json` without a clear reason.
- Don't write comments that restate the code.
- Don't reformat files unrelated to the change.
- Don't commit secrets, tokens, or `.env` files.
