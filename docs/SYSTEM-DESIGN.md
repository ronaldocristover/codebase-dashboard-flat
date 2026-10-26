# TokoKu Dashboard — System Design

This document describes the application architecture: routes, layers, data flow,
guards, visual tokens, and testing strategy. For general context see
[`CONTEXT.md`](./CONTEXT.md). For coding rules see [`AGENTS.md`](../AGENTS.md) and
[`svelte-best-practices.md`](./svelte-best-practices.md).

## 1. Purpose and constraints

Admin dashboard for a fictional online store. Sample data is served by a dummy,
in-memory API: no database, no external backend, no persistence. The focus is UI
behavior plus pure filter and validation logic, not production networking.

Constraints that shape the design:

- No icon or chart dependencies; all SVG is written inline.
- No gradients, shadows, or large corners. Separators use 1px borders.
- Auth is an in-memory simulation only; the guard is UX, not security.
- The API is unauthenticated and keeps data in module-level arrays. Writes last
  until the server restarts.
- SSR is disabled for the dashboard area, so auth and sidebar stores stay
  client-only. API endpoints still execute on the server.

## 2. Route map

| Route | File | Access | Content |
| --- | --- | --- | --- |
| `/login` | `src/routes/login/+page.svelte` | public | Email + password form, branding panel on the left |
| `/` | `src/routes/(dashboard)/+page.svelte` | guard | 4 stat cards, line chart, bar chart, recent orders table |
| `/member` | `src/routes/(dashboard)/member/+page.svelte` | guard | Member table: search, filter, sort, pagination; Excel import/export dialogs |
| `/member/new` | `src/routes/(dashboard)/member/new/+page.svelte` | guard | Create form; POST to the API; inline field errors |
| `/member/[id]` | `src/routes/(dashboard)/member/[id]/+page.svelte` | guard | Member profile plus that member's orders |
| `/member/[id]/edit` | `src/routes/(dashboard)/member/[id]/edit/+page.svelte` | guard | Prefilled form; PATCH to the API |
| `*` (inside the shell) | `src/routes/(dashboard)/+error.svelte` | guard | 404 that still shows sidebar + top nav |

The `(dashboard)` group does not add a URL segment. It groups routes that share
the same shell and guard.

The root `src/routes/+layout.svelte` only mounts the favicon; the dashboard shell
lives in `(dashboard)/+layout.svelte`. As a result the login page never renders
the sidebar, and a 404 inside the dashboard keeps the navigation visible.

### API routes

| Method + path | File | Response |
| --- | --- | --- |
| `GET /api/members` | `src/routes/api/members/+server.ts` | `200` with `Member[]` |
| `POST /api/members` | `src/routes/api/members/+server.ts` | `201` with the created `Member`; `400` with `{ errors }` |
| `GET /api/members/[id]` | `src/routes/api/members/[id]/+server.ts` | `200` with `Member`; `404` with `{ message: 'Member not found' }` |
| `PATCH /api/members/[id]` | `src/routes/api/members/[id]/+server.ts` | `200` with the updated `Member`; `400` with `{ errors }`; `404` with `{ message: 'Member not found' }` |
| `GET /api/members/[id]/orders` | `src/routes/api/members/[id]/orders/+server.ts` | `200` with `MemberOrder[]`; `404` with `{ message: 'Member not found' }` |

- Validation failures return `400` and a body shaped `{ errors }`, where each key
  is a field name (`nama`, `email`, `hp`, `status`) and each value is an English
  message. Malformed JSON returns `{ errors: { body: 'Invalid JSON' } }`.
- Unknown members use `error(404, 'Member not found')`, which SvelteKit renders as
  `{ message: 'Member not found' }`.
- `PATCH` merges the incoming fields over the stored member before validating, so
  a partial payload still passes the full rule set.
- Handlers validate before touching the store. Field rules live in
  `src/lib/utils/memberValidation.ts` and are shared with the forms.

## 3. Layers

```
routes/            page composition, page-local state, Tailwind markup
  (dashboard)/     shell + guard + error boundary + member pages
  api/members/     +server.ts handlers: parse, validate, call the store
lib/components/    presentational components + colocated tests
lib/server/        server-only in-memory member store (never client code)
lib/stores/        cross-component state (auth, UI)
lib/utils/         pure functions: format, filter/sort/paginate, validation
lib/mock/          sample data: members, orders, dashboard
lib/types.ts       shared domain types
```

Dependency direction: `routes` may import every layer; `components` may import
`utils`, `stores`, and `types`; `utils` imports only `types`; `server` imports
`mock`, `utils`, and `types`; only `+server.ts` files import `#lib/server/*`. No
layer imports from `routes`. Pages and components never import the server store;
they read data through `fetch` in a load function.

Page state (filters, sort, active page, form fields) deliberately lives in page
components, not in a global store. Stores are reserved for state that is truly
cross-component: login status and sidebar/drawer state.

## 4. Member data flow

### 4.1 List

The list page receives its rows from `+page.ts`, then filters, sorts, and
paginates on the client. One direction, no side effects:

```
data.members from +page.ts
   │
   ├─ $state raw            query, statusFilter, rentang, page, sortKey, sortDir
   │
   ├─ filterMembers()       → $derived terfilter
   ├─ sortMembers()         → $derived terurut
   └─ paginate()            → $derived halaman { items, total, totalPages, from, to }
                                 │
                                 └─ render table / empty state / Pagination
```

- `sekarang` is computed once when the component is created; date filters use it
  so results do not shift mid-interaction.
- Every filter change calls `resetHalaman()`, so `page` returns to 1.
- `ubahSort()` switches `sortKey`, flips the direction when the same column is
  picked again, and resets the page.
- The empty state appears when `halaman.items.length === 0` and offers a reset
  button.
- Filter, sort, and paginate are pure functions that accept an optional `now`
  parameter, so they can be tested without faking the global clock.

The 50 seeded members use `isoDaysAgo()` so the 7/30/90-day filters always have
rows. Dates are not hardcoded, so the demo does not expire.

### 4.2 Detail and edit

```
/member/[id]        +page.ts → GET member + GET orders (parallel) → data
/member/[id]/edit   +page.ts → GET member                          → data
/member/new         no load; the form starts empty and POSTs
```

- Independent requests in the detail load run with `Promise.all`.
- A `404` from the API becomes `error(404, 'Member not found')` in the load, so
  the nearest `+error.svelte` renders inside the dashboard shell.
- `data` holds serializable values only; components take it as a typed prop.
- Navigating after create or edit reruns the universal load, so the list and
  detail pages read the updated in-memory store.

### 4.3 Create and edit form

- Each field is a local `$state` value seeded from `data.member` on the edit page.
- Field errors are local `$state` and replaced with the API's `{ errors }` body
  when the server answers `400`.
- On success the form navigates with `goto()` — to the list or the member detail
  page.
- Forms may call `validateMemberInput` for immediate feedback, but the API always
  validates again.

### 4.4 Dummy store and orders

`src/lib/server/memberStore.ts` keeps members in a module-level array, seeded
from `src/lib/mock/members.ts` with a shallow copy. `listMembers()` and
`findMember()` return copies, so callers cannot mutate the store by accident.

- New IDs follow `MBR-####`: the highest existing number plus one, padded to four
  digits.
- `createMember()` sets `bergabung` to today's ISO date and `totalBelanja` to 0.
- `updateMember()` keeps fields the patch omits and returns `undefined` when the
  ID is unknown.
- `resetMembers()` restores the seed; tests call it between cases.

`src/lib/mock/orders.ts` derives orders deterministically from the seed members:
the first member has none, member index `i` has `i % 7` orders, and invoice,
amount, status, and date are computed from the index. Newly created members are
not in that map, so they have no orders.

### 4.5 Excel import and export

The member list header opens two dialogs from `lib/components/`:

- **Export** writes the current filtered and sorted rows (all pages, not just the
  visible page) to a `.xlsx` workbook with Name, Email, Phone, Joined, Total
  Spend, and Status columns.
- **Import** reads a `.xlsx` workbook, validates each row with the shared
  `validateMemberInput()`, previews valid and skipped rows, then creates the valid
  rows through `POST /api/members`, one request per row. When the import finishes
  the page calls `invalidateAll()` so the list reflects the new members.
- The import dialog offers a downloadable template. The workbook has a `Members`
  sheet with headers only and an `Example` sheet with one sample row. Only the
  first sheet is read, so the example is never imported.

`src/lib/utils/memberExcel.ts` owns the mapping and parsing; the Excel libraries
(`read-excel-file`, `write-excel-file`) are loaded dynamically so the list page
does not pay for them until a dialog is used.

## 5. Auth and guard

Flow:

```
/login  ──submit──►  login(email, password)
                        │ validates email format + non-empty password
                        ▼
                    auth.set(true)  ──►  goto('/')
                        │
                        ▼
             (dashboard)/+layout.ts  ──get(auth) false──►  redirect(303, '/login')
```

- `auth` is an in-memory `writable(false)`. A refresh clears the session.
- `ssr = false` in `(dashboard)/+layout.ts` makes the guard run in the browser,
  where the store exists. Without it, the server has no login state.
- The guard only checks that a session exists; there are no roles, permissions,
  or expiry.
- Logout lives in the avatar dropdown (`UserMenu`), not the sidebar: `logout()`
  then `goto('/login')`.
- A logged-in user who opens `/login` is sent to `/` via `onMount`.
- API routes have no auth check at all. That is acceptable only for this demo; a
  real API must authenticate every route.

Because the guard is client-side, anyone calling a dashboard route directly gets
an empty shell until hydration finishes, then a redirect. That is enough for a
demo, not for production. Real auth belongs in `hooks.server.ts`, with an
`httpOnly` cookie and a session check on the server before rendering data.

## 6. UI state

| State | Location | Nature |
| --- | --- | --- |
| `auth` | `lib/stores/auth.ts` | global, in-memory |
| `sidebarCollapsed` | `lib/stores/ui.ts` | global, persists until refresh |
| `mobileNavOpen` | `lib/stores/ui.ts` | global, mobile drawer |
| `submenu` | `Sidebar.svelte` | local, one open submenu |
| `open` | `UserMenu.svelte` | local, avatar dropdown |
| filter/sort/page | member list page | local per page |
| form fields + `errors` | member new/edit pages | local per page |

The mobile drawer uses `$effect` to install an `Escape` listener, lock
`document.body.style.overflow`, and restore everything in cleanup. Focus is not
trapped (no focus trap yet); this is a known limit.

## 7. Design tokens

Tokens are defined once in `src/routes/layout.css` through Tailwind v4 `@theme`,
then used as utilities (`bg-primary`, `text-muted`, `border-line`).

| Token | Value | Usage |
| --- | --- | --- |
| `primary` | `#014BAA` | primary actions, headings, active items |
| `primary-soft` | `#E7EFFB` | active item background, badges |
| `cream` | `#F8F3F0` | app background and top nav |
| `line` / `line-strong` | `#E9E1DB` / `#E3DAD3` | card, table, input borders |
| `ink` | `#2B2B2B` | primary text |
| `muted` | `#9A9089` | secondary text |
| `success` / `warning` / `danger` + `-bg`, `-line` variants | green, amber, red | order and member statuses |
| `font-sans` | Plus Jakarta Sans | all text |

Visual rules: maximum radius `rounded-lg`, no `shadow-*`, no `bg-gradient-*`.
Hierarchy comes from text size, font weight, and borders — not shadows.

## 8. Shared components

| Component | Role | Notes |
| --- | --- | --- |
| `Logo` | TokoKu wordmark | props `onDark`, `size` |
| `Sidebar` | primary navigation | dead items render as `<button>`, not `<a>` |
| `TopNav` | page title + mobile toggle + avatar | no search input |
| `UserMenu` | profile dropdown and logout | outside click + Escape close it |
| `StatCard` | metric summary | up/down trend from data |
| `StatusPill` | order/member status | colour variants from tokens |
| `Breadcrumb` | navigation trail | last item has no link |
| `Pagination` | page controls | `onPageChange` callback, `aria-current` |
| `LineChart` / `BarChart` | inline SVG charts | no library |
| `Modal` | dialog shell | Escape, backdrop, focus trap, scroll lock |
| `MemberImportModal` / `MemberExportModal` | Excel transfer dialogs | template download, row preview, per-row POST |

All components use typed `$props()` and do not touch stores unless the state is
genuinely global.

## 9. Testing strategy

Three levels:

1. **Pure logic** — `src/lib/utils/*.test.ts` and `src/lib/mock/members.test.ts`.
   Covers filters (query, status, date range), sorting (asc/desc, stability),
   pagination (page bounds), formatting (Rupiah, dates), and member validation
   rules (required name, email shape, phone digits, status values). No DOM
   needed.
2. **API contract** — `src/routes/api/members/api.test.ts` runs with
   `// @vitest-environment node`. It calls the exported handlers with a fake
   `RequestEvent`, resets the store in `beforeEach`, and asserts status codes,
   `{ errors }` keys, `404` message, incrementing list length, and deterministic
   order data.
3. **Components and pages** — colocated `*.test.ts` files using
   `@testing-library/svelte` + jsdom. Covers rendering, click/input interaction,
   aria state, empty state, guard navigation, form submission and field errors,
   and the member detail page.

Configuration in `vite.config.ts`:

- `environment: 'jsdom'`, overridden per file with `// @vitest-environment node`
  for API tests.
- `setupFiles: ['./vitest-setup.ts']`
- `expect.requireAssertions: true` — a test without assertions fails
- `exclude: ['src/lib/server/**']` — the store stays thin; rules live in `utils`
  where they can be tested
- `resolve.conditions: ['browser']` only under `VITEST`, so mounted Svelte is the
  browser build, not the server build

Commands: `npm test` (single run), `npm run test:unit` (watch),
`npm run check` (svelte-check), `npm run build` (production verification).

## 10. Build and deploy

The adapter is configured inside `sveltekit()` in `vite.config.ts`, not in
`svelte.config.js` (this project has no such file). It currently uses
`adapter-auto`, which only recognises some platforms. Without a deploy target the
build still succeeds but prints a warning.

For production, pick one:

- `@sveltejs/adapter-node` → standalone Node server, good for VPS/Docker.
- `@sveltejs/adapter-static` → static SPA; plausible because the dashboard does
  not need SSR, but the guard still has to become real auth.
- A platform adapter (Vercel/Netlify/Cloudflare) if hosting is already chosen.

Release steps: `npm ci` → `npm run check` → `npm test` → `npm run build` → run
the adapter output.

## 11. Limits and risks

- **Auth is not security.** Session in memory, guard on the client, no cookie.
- **Dummy API.** Data lives in module-level arrays and resets when the server
  restarts. There is no persistence.
- **Unauthenticated API.** Every endpoint is open. Demo only.
- **No delete.** Members can be created and edited, not removed.
- **Import is sequential and does not deduplicate.** Re-importing the same file
  creates duplicate members; every row is a separate `POST`.
- **No concurrency control.** Simultaneous writes are last-write-wins.
- **Generated orders.** Orders are derived from seed indexes; new members have
  none, and orders do not change when a member is edited.
- **Dead menu.** Products, Orders, and Reports have no pages; the Reports submenu
  is label-only.
- **No production adapter.** The build succeeds; the app is not deploy-ready.
- **Partial accessibility.** Dialogs have Escape, backdrop close, a focus trap, and
  focus restore; the mobile drawer still has no focus trap.
- **Decorative charts.** The line chart uses `preserveAspectRatio="none"` to fill
  the width; data points are percentage-positioned HTML so they stay round, but
  stroke width still stretches on wide screens.

## 12. Next steps

If this demo becomes a product, a sensible order of changes:

1. Replace in-memory auth with a server session (`hooks.server.ts`, `httpOnly`
   cookie) and require auth on the API.
2. Replace `memberStore.ts` with a database behind `+page.server.ts`; keep the
   shared validation module so API and forms cannot drift.
3. Add `adapter-node` (or a platform adapter) and a build pipeline.
4. Add loading and error states to tables, charts, detail pages, and forms.
5. Add delete with confirmation, then finish the Products, Orders, and Reports
   pages so no menu item is dead.
