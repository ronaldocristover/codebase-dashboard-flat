# Best Practices — Svelte 5 and SvelteKit 3

The rules in this document come from the official documentation (see
[Sources](#sources)) and from patterns already used in this repo. Every rule is
paired with a real example, so agents do not invent APIs.

Project versions: Svelte `^5.57`, SvelteKit `^3.0`, Vite `^8`, Tailwind `^4`.

## 1. Runes are mandatory

Runes mode is forced for all project code in `vite.config.ts`:

```ts
sveltekit({
	compilerOptions: {
		runes: ({ filename }) =>
			filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	}
});
```

As a result, the following Svelte 4 patterns **must not** appear:

| Don't | Use |
| --- | --- |
| `export let nama` | `let { nama } = $props()` |
| `$: harga = qty * unit` | `const harga = $derived(qty * unit)` |
| `on:click={...}` | `onclick={...}` |
| `<slot />` | `{@render children()}` |
| `$: { ... }` for side effects | `$effect(() => { ... })` |
| `$app/stores` | `$app/state` |
| `$app/environment` | `$app/env` |
| `$env/static/*`, `$env/dynamic/*` | `src/env.ts` + `$app/env/public` / `$app/env/private` |

## 2. `$state` for changing data

`$state` makes a value reactive. Objects and arrays are wrapped in proxies, so
nested mutations are tracked too.

Repo example — `src/routes/(dashboard)/member/+page.svelte`:

```ts
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

let query = $state('');
let statusFilter = $state<'semua' | MemberStatus>('semua');
let rentang = $state<'semua' | 7 | 30 | 90>('semua');
let page = $state(1);
let sortKey = $state<SortKey>('bergabung');
let sortDir = $state<SortDir>('desc');
```

The list receives its rows from `+page.ts` through `data.members`; it does not
import mock data or the server store.

Rules:

- Give a generic type when the initial value does not cover the whole domain
  (`$state<'semua' | 7 | 30 | 90>('semua')`).
- Do not put large never-mutated data in `$state`; use `$state.raw` or a plain
  constant.
- Keep page state local to the page component. Lift it into a store only when it
  is genuinely shared across components.
- Form fields and their error map are page-local `$state` too; do not mirror them
  into a global store.

## 3. `$derived` for derived values, not `$effect`

`$derived` computes a value from other values and has no side effects. It is the
first choice whenever "value B is computed from value A".

Repo example — the member table pipeline:

```ts
const terfilter = $derived(
	filterMembers(data.members, { query, status: statusFilter, joinedWithin: rentang }, sekarang)
);
const terurut = $derived(sortMembers(terfilter, sortKey, sortDir));
const halaman = $derived(paginate(terurut, page, PER_HALAMAN));
```

For multi-line computations use `$derived.by` — example from
`src/lib/components/Pagination.svelte`:

```ts
const nomor = $derived.by(() => {
	if (totalPages === 0) return [];
	const jumlah = Math.min(5, totalPages);
	const mulai = Math.max(1, Math.min(page - 2, totalPages - jumlah + 1));
	return Array.from({ length: jumlah }, (_, i) => mulai + i);
});
```

Do not copy a derived result into `$state` through `$effect`; that creates two
sources of truth and an extra render.

## 4. `$effect` only for side effects

`$effect` is for touching the outside world: DOM listeners, `document.body`,
timers, browser APIs. Always return cleanup.

Repo example — `src/lib/components/UserMenu.svelte`:

```ts
$effect(() => {
	if (!open) return;

	const klikLuar = (event: MouseEvent) => {
		if (akar && !akar.contains(event.target as Node)) open = false;
	};
	const tombolEsc = (event: KeyboardEvent) => {
		if (event.key === 'Escape') open = false;
	};

	document.addEventListener('click', klikLuar);
	document.addEventListener('keydown', tombolEsc);

	return () => {
		document.removeEventListener('click', klikLuar);
		document.removeEventListener('keydown', tombolEsc);
	};
});
```

Rules:

- Read dependencies inside the effect so tracking is automatic. A value read
  inside an `if` branch that does not run is not a dependency.
- Do not use `$effect` to derive values, mutate other state, or sync props.
- To read a value without tracking it, use `untrack(() => ...)` from `svelte`.
- For work that should run only once on mount, `onMount` states the intent more
  clearly.
- Global listeners in components that mount and unmount often must have cleanup.

## 5. Typed props and `$bindable`

Every component receives props through `$props()` with explicit types.

```svelte
<script lang="ts">
	let { judul, onToggleMenu }: { judul: string; onToggleMenu: () => void } = $props();
</script>
```

- Write defaults in the destructuring: `let { size = 'md' } = $props()`.
- Children must not mutate props. When a child needs to change a parent value,
  the first choice is a callback (`onPageChange` in `Pagination.svelte`).
- Use `$bindable()` only when two-way binding is genuinely needed:

```svelte
<script lang="ts">
	let { value = $bindable('') } = $props();
</script>
```

This repo does not use `$bindable`; keep the callback pattern so data flows one
way.

## 6. Snippets replace slots

The dashboard layout uses a children snippet:

```svelte
<script lang="ts">
	import type { LayoutProps } from './$types';
	let { children }: LayoutProps = $props();
</script>

<main>{@render children()}</main>
```

Named snippets can act as implicit props:

```svelte
<Table data={fruits}>
	{#snippet header()}<th>fruit</th>{/snippet}
	{#snippet row(d)}<td>{d.name}</td>{/snippet}
</Table>
```

Do not mix `<slot />` with snippets. A snippet that needs parameters declares
them; it does not use slot props.

## 7. Module state and SSR leakage

Stores in `src/lib/stores/` are module singletons — created once per process. On
the server, a singleton is shared across requests, so user state could leak to
another user.

This repo keeps SSR on for the dashboard and is still safe, because the only
module stores left (`sidebarCollapsed`, `mobileNavOpen`) hold UI flags that are
only mutated from browser event handlers and never during render. Login state is
not in a store: it comes from the request cookie through `hooks.server.ts` +
`event.locals`.

Rules:

- Per-user/per-request state must come from `load` (server) or a cookie, not from
  a module variable.
- Pure UI state (sidebar, drawer) may live in a module only while it defaults to
  the same value on the server and the client; check the SSR HTML if you change
  the default or mutate it during render.
- `writable` stores still work with runes: `$sidebarCollapsed` in `Sidebar.svelte`
  is auto-subscription. Do not write `get(store)` in markup; it disables
  reactivity.

`src/lib/server/memberStore.ts` and `src/lib/server/session.ts` are module
singletons too, shared by every request. That is intentional for this dummy API
but makes the data global and lost on restart; sessions are keyed per user and
gated by the `hooks.server.ts` check. `#lib/server/*` must never be imported from
components, pages, or `+page.ts`; only `+server.ts`/`+page.server.ts` files and
tests reach it.

## 8. SvelteKit 3: import `#lib`, not `$lib`

SvelteKit 3 uses the `#lib` alias. In this repo the alias is mapped only for
subpaths, not for bare `#lib`:

- `package.json` → `"imports": { "#lib/*": "./src/lib/*" }`
- `tsconfig.json` → `paths: { "#lib/*": ["./src/lib/*"] }`

Bare `#lib` is deliberately not mapped because nothing imports it and
`src/lib/index.ts` is not a public API.

Examples:

```ts
import { sidebarCollapsed } from '#lib/stores/ui';
import { filterMembers } from '#lib/utils/memberFilters';
import { findMember } from '#lib/server/memberStore'; // +server.ts only
```

Rules:

- Internal imports always use `#lib/...`; never write `../../lib/...`.
- Add an export to `src/lib/index.ts` only when it is part of the library's public
  API. Today the file contains comments only; direct per-module imports are
  clearer.
- `$lib` is the old alias; do not use it in new code.
- `#lib/server/*` is server-only. Importing it from client-reachable code breaks
  the build or leaks server data.

## 9. `$app/state` replaces `$app/stores`

`page`, `navigating`, and `updated` are now imported from `$app/state` and are
already reactive with runes. Do not write `$page`.

Repo example — `src/routes/(dashboard)/+layout.svelte`:

```ts
import { page } from '$app/state';

const judul = $derived(page.url.pathname.startsWith('/member') ? 'Members' : 'Dashboard');
```

`Sidebar.svelte` also reads `page.url.pathname` to mark the active item.

Rules:

- Wrap `page.*` reads in `$derived` when the value changes between navigations;
  `$:` will not update it.
- `page.error` is available for error UI; `+error.svelte` uses `page.status`.
- `page.data` holds the merged `load` results; do not copy it into a store.

## 10. Route groups, guards, and redirects

The `src/routes/(dashboard)/` structure groups pages that share a shell without
changing the URL. The guard lives in `+layout.server.ts`:

```ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	if (!locals.user) redirect(303, '/login');

	return { user: locals.user };
};
```

`locals.user` is filled by `src/hooks.server.ts` from the session cookie, so the
guard runs on the server and the dashboard still renders with SSR.

Rules:

- `redirect()` from `@sveltejs/kit` is thrown, not returned; do not swallow it
  with an empty `try/catch`.
- Use status `303` for redirects after a state change.
- Put the guard in `+layout.server.ts`, not a universal `load`: only the server
  version can read `locals` and run before HTML is rendered.
- A `+server.ts` route outside the group is not covered by the layout guard. This
  repo checks `/api/*` once in `hooks.server.ts` and answers `401`; a route that
  needs finer rules must check `locals.user` itself.
- Pages that need the shell and a custom 404 put `+error.svelte` inside the group,
  such as `(dashboard)/+error.svelte`.
- Only add `export const ssr = false` when a module store would otherwise render
  differently on the server; `load` in a server layout still runs with it set.

## 11. Data loading for member pages

Pages read the dummy API through a universal `+page.ts` load and the `fetch`
provided by SvelteKit. Repo example — `src/routes/(dashboard)/member/+page.ts`:

```ts
import type { PageLoad } from './$types';
import type { Member } from '#lib/types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/members');
	const members = (await res.json()) as Member[];

	return { members };
};
```

The page takes the result as `data`:

```svelte
<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>
```

The detail page loads two independent resources in parallel and turns a missing
member into a real 404:

```ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const [memberRes, ordersRes] = await Promise.all([
		fetch(`/api/members/${params.id}`),
		fetch(`/api/members/${params.id}/orders`)
	]);
	if (memberRes.status === 404) error(404, 'Member not found');

	return {
		member: await memberRes.json(),
		orders: await ordersRes.json()
	};
};
```

The edit page loads only the member and throws the same `error(404)` when the API
returns 404.

Rules:

- `+page.ts` is a universal load (runs on the server during SSR, then in the
  browser on navigation); `+page.server.ts` is for database or secret access. The
  dummy API needs only `+page.ts`.
- Always use the provided `fetch`, so relative URLs and cookies work in both
  environments.
- Never import `#lib/server/*` from `+page.ts`; go through the API.
- Return serializable data only. No classes or functions.
- Throw `error(404, ...)` for a missing member; the nearest `+error.svelte`
  renders the message inside the dashboard shell.
- Use `Promise.all` for independent requests in one load.
- A universal load reruns on navigation, so create/edit changes are visible when
  navigating back to the list or detail page.

## 12. Forms and mutations

Member create and edit are client-side forms that talk to the API. Form state is
local and field errors come from the server response:

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let nama = $state(data.member.nama);
	let errors = $state<Record<string, string>>({});

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		const res = await fetch(`/api/members/${data.member.id}`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ nama })
		});

		if (res.status === 400) {
			errors = (await res.json()).errors;
			return;
		}
		await goto(`/member/${data.member.id}`);
	}
</script>

<form onsubmit={onSubmit} novalidate>
	<input bind:value={nama} name="nama" />
	{#if errors.nama}<p role="alert">{errors.nama}</p>{/if}
	<button type="submit">Save</button>
</form>
```

Rules:

- Keep every field and the error map in page-local `$state`. There is no global
  store for form state.
- The API returns `400` with `{ errors }` keyed by field name; assign that object
  to the local error state instead of inventing messages in the page.
- Validate on the server as well. `src/lib/utils/memberValidation.ts` is the one
  rule set shared by API handlers and forms; do not duplicate field rules in
  markup.
- On success, navigate with `goto()` to the list or the member detail page.
- Use `onsubmit` (runes event syntax) and `event.preventDefault()`; there is no
  `on:submit`.

If a form moves to SvelteKit form actions instead of the API, keep progressive
enhancement and repeat validation on the server:

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<form method="POST" use:enhance>
	<input name="nama" />
	<button>Save</button>
</form>
```

Form actions are not used for the member pages today because the dummy API is
the data source.

## 13. Environment variables and `defineEnvVars`

SvelteKit 3 centralises env in `src/env.ts` with `defineEnvVars` from
`@sveltejs/kit/env`:

```ts
import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_API_URL: { public: true, schema: (v) => v ?? 'http://localhost:5173' },
	SESSION_SECRET: { public: false }
});
```

- `public: true` → may be imported from `$app/env/public` (ships to the browser).
- `public: false` (default) → only from `$app/env/private`, which is server-only.
- `schema` validates at startup; failing fast beats a spreading `undefined`.
- `static: true` inlines the value at build time and enables dead-code
  elimination.
- `$app/env` provides `browser`, `building`, `dev`, and `version` — the replacement
  for `$app/environment`.
- Never put a secret in `public: true` or in `$app/env/public`.
- This project has no env yet; add `src/env.ts` only when a real variable exists.

## 14. Adapter and build

In SvelteKit 3 the adapter is passed to `sveltekit()` in `vite.config.ts`:

```ts
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit({ adapter: adapter() })]
});
```

- `adapter-auto` only supports recognised platforms; without a deploy target it
  prints a warning. For production choose `adapter-node`, `adapter-static`, or a
  platform adapter.
- `adapter-static` suits a client-only dashboard, but it does not replace server
  auth.
- Verify builds with `npm run build`, not only `npm run dev`.

## 15. Tailwind v4 and tokens

- Design tokens live only in `src/routes/layout.css` inside `@theme`. Never write
  raw hex in markup.
- Use colours through utilities: `bg-primary`, `text-muted`, `border-line`,
  `bg-success-bg`.
- There is no `tailwind.config.js`; configuration is CSS-based.
- Flat design: no `shadow-*`, no `bg-gradient-*`, maximum radius `rounded-lg`.
- Import CSS once, in the root layout (`src/routes/+layout.svelte`).

## 16. Accessibility

Patterns already in use and expected to stay:

- Icon-only buttons have an `aria-label` (menu toggle, pagination arrows).
- Dropdowns use `aria-haspopup`, `aria-expanded`, `role="menu"`, and close on
  Escape.
- The active pagination page uses `aria-current="page"`.
- Navigation items without a page render as `<button>`, not `<a href="#">`.
- Filter inputs have an `aria-label` because their visual label is a placeholder.
- Keep focus visible: do not remove `outline` without a clear replacement
  (`focus:border-primary` alone is not enough in every case).

Still missing and fair game when touching the related component: a focus trap for
the mobile drawer and `aria-live` for filter results that change.

Form field errors are rendered next to their field with `role="alert"`.

## 17. Testing

- Test non-UI logic as pure functions in `src/lib/utils/*.test.ts`. Pass `now` as
  a parameter so tests do not depend on the real clock.
- Validation rules are tested directly in `memberValidation.test.ts`; API
  handlers and forms both rely on that module.
- API contract tests use `// @vitest-environment node` at the top of the file,
  import the exported handlers, and call them with a fake `RequestEvent`. Reset
  the in-memory store in `beforeEach`, then assert status codes and body shapes.
- `src/lib/server/**` is excluded from the Vitest `include` list. Keep the store
  thin; put testable rules in `utils`.
- Component and page tests use `@testing-library/svelte`; query by role/label, not
  CSS classes. Page tests cover the loaded `data` input, not the API itself.
- Tests are colocated: `Pagination.test.ts` next to `Pagination.svelte`.
- `expect.requireAssertions: true` means every test must assert something.
- `resolve.conditions: ['browser']` only under `VITEST`; without it
  `@testing-library/svelte` may load the server build of Svelte and fail to mount.
- Every bug fix starts with a failing test (RED), then the implementation (GREEN).
- Run `npm test` and `npm run check` before committing.

## 18. Project code style

- TypeScript strict; no `any` without a reason written in a comment.
- Domain identifiers stay Indonesian because the domain is Indonesian:
  `bergabung`, `totalBelanja`, `anggota`, `halaman`. General technical names stay
  English: `filterMembers`, `sortMembers`, `onPageChange`.
- UI copy is English, including errors, empty states, and API messages.
- Rupiah keeps the `Rp` prefix and Indonesian digit grouping
  (`toLocaleString('id-ID')`). Dates use English month names
  (Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec).
- Comments only explain "why" that the code cannot show. Deliberate limits use
  the format `shortcut: <limit>, <when to upgrade>`.
- Do not add a dependency for something the platform APIs can do (icons, charts,
  date libraries).

## 19. Using the Svelte MCP

This project registers the `svelte` MCP server in `opencode.jsonc`
(`npx -y @sveltejs/mcp`). Use it before answering Svelte API questions:

1. `list-sections` → find the relevant documentation section.
2. `get-documentation` → fetch the current documentation for that section.
3. `svelte-autofixer` → run it on newly written Svelte code until no suggestions
   remain.
4. `playground-link` → only for snippets that are not written to a file.

Rule: do not answer Svelte/SvelteKit API questions from memory when the MCP or
Context7 is available. Documentation wins over habit.

## Sources

Collected through Context7 on 2026-10-25, then verified against the official
pages:

- Context7 library `/websites/svelte_dev_svelte` — Svelte 5: runes, `$state`,
  `$derived`, `$effect`, `$props`, `$bindable`, snippets, stores.
- Context7 library `/websites/svelte_dev_kit` — SvelteKit 3: `load`,
  `$app/state`, `defineEnvVars`, adapters, testing.
- <https://svelte.dev/docs/svelte/$state>
- <https://svelte.dev/docs/svelte/$derived>
- <https://svelte.dev/docs/svelte/$effect>
- <https://svelte.dev/docs/svelte/snippet>
- <https://svelte.dev/docs/kit/load>
- <https://svelte.dev/docs/kit/$app-state>
- <https://svelte.dev/docs/kit/$app-env>
- <https://svelte.dev/docs/kit/@sveltejs-kit-env>
- <https://svelte.dev/docs/kit/adapters>
- <https://svelte.dev/docs/kit/auth>
- <https://svelte.dev/docs/ai/mcp>
- <https://svelte.dev/docs/ai/tools>
