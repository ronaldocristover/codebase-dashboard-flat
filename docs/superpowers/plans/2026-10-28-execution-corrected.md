# SaaS Readiness — Corrected Execution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox syntax.

**Goal:** Make the dashboard safe to run for real users: server-verified sessions, bounded API responses, validated input, visible errors.

**Architecture:** Auth moves from a client writable store to an httpOnly cookie read in `hooks.server.ts` and exposed as `event.locals.user`. Guard moves from a universal `load` to a server `load`. API endpoints gain pagination, a per-process rate limit, and structured error responses.

**Tech Stack:** SvelteKit 3 (`hooks.server.ts`, `event.locals`, form actions), Svelte 5 runes, Vitest. **No new dependencies.**

**Spec:** `docs/superpowers/plans/2026-10-28-saas-readiness.md` (audit findings 1, 2, 5, 8, 9, 10, 11, 14, 15, 16, 21, 24, 25)

## Global Constraints

- Svelte 5 runes only: `$props()`, `$state`, `$derived`, `$effect`. No `export let`, no `on:click`, no `$:`.
- Imports use `#lib/...`. `#lib/server/*` only from `hooks.server.ts`, `+server.ts`, `+page.server.ts`.
- Validation rules live only in `src/lib/utils/memberValidation.ts`. Never duplicate a field rule in markup.
- UI copy is English. Rupiah keeps `Rp` + `toLocaleString('id-ID')`.
- Domain identifiers stay Indonesian (`nama`, `hp`, `bergabung`, `totalBelanja`); technical names stay English.
- No new npm dependencies. No `pino`, no `dompurify`, no `lodash`, no `file-type`, no Prisma.
- `npm test` and `npm run check` must pass before each commit.
- Tests colocated. `expect.requireAssertions` is on — every test asserts.
- Deliberate limits get a `shortcut: <limit>, <when to upgrade>` comment.

## Review Focus

1. **Login with a wrong password** — must not create a session. Test: action with bad credentials returns `fail(400)` and sets no cookie.
2. **Dashboard without a cookie** — must redirect to `/login`. Test: server `load` throws redirect 303.
3. **Forged cookie value** — a made-up token must not authenticate. Test: `readSession('nope')` is `null`.
4. **`/api/members` with `perPage=99999`** — must clamp, not return everything. Test: response length is 100.
5. **Member name of 1000 characters** — must be rejected. Test: `validateMemberInput` returns `errors.nama`.

---

### Task 1: Server-side session core

**Files:**
- Modify: `src/app.d.ts`
- Create: `src/lib/server/session.ts`
- Create: `src/hooks.server.ts`
- Test: `src/lib/server/session.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `SESSION_COOKIE = 'tokoku_session'`; `createSession(userId: string): string`; `readSession(token: string | undefined): { userId: string } | null`; `destroySession(token: string): void`; `SESSION_MAX_AGE` (seconds)

- [ ] **Step 1: Declare `Locals` in `src/app.d.ts`**

```ts
declare global {
	namespace App {
		interface Locals {
			user: { id: string; email: string } | null;
		}
	}
}
```

- [ ] **Step 2: Write the failing test** in `src/lib/server/session.test.ts`

```ts
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createSession, destroySession, readSession } from './session';

describe('session', () => {
	it('reads back a session it created', () => {
		const token = createSession('user-1');
		expect(readSession(token)).toEqual({ userId: 'user-1' });
	});

	it('rejects an unknown token', () => {
		expect(readSession('nope')).toBeNull();
		expect(readSession(undefined)).toBeNull();
	});

	it('rejects a destroyed token', () => {
		const token = createSession('user-2');
		destroySession(token);
		expect(readSession(token)).toBeNull();
	});

	it('issues a distinct token per login', () => {
		expect(createSession('user-3')).not.toBe(createSession('user-3'));
	});
});
```

- [ ] **Step 3: Run it, expect failure**

Run: `npx vitest run src/lib/server/session.test.ts`
Expected: FAIL — cannot resolve `./session`.

- [ ] **Step 4: Implement `src/lib/server/session.ts`**

Use `crypto.randomUUID()` for the token and a module-level `Map<string, { userId: string; expires: number }>`. Expire on read (`Date.now() > expires` → delete, return null). `SESSION_MAX_AGE = 60 * 60 * 24 * 7`.

```ts
// shortcut: sessions live in process memory, so a restart logs everyone out; move to a database table when sessions must survive deploys.
```

- [ ] **Step 5: Create `src/hooks.server.ts`**

`handle` reads `event.cookies.get(SESSION_COOKIE)`, resolves `event.locals.user` from `readSession`, and returns `resolve(event)`. Look up the demo user record by id; the only seeded account is `{ id: 'user-1', email: 'rina@tokoku.id' }`.

- [ ] **Step 6: Run tests and check**

Run: `npx vitest run src/lib/server/session.test.ts && npm run check`
Expected: 4 passing, 0 check errors.

- [ ] **Step 7: Commit**

```bash
git add src/app.d.ts src/lib/server/session.ts src/lib/server/session.test.ts src/hooks.server.ts
git commit -m "feat: add server-side session store and request hook"
```

---

### Task 2: Login through a server form action

**Files:**
- Create: `src/routes/login/+page.server.ts`
- Modify: `src/routes/login/+page.svelte`
- Modify: `src/routes/login/login.test.ts`

**Interfaces:**
- Consumes: `createSession`, `SESSION_COOKIE`, `SESSION_MAX_AGE` from Task 1; `event.locals.user` from Task 1
- Produces: `actions.default` on `/login`; `load` that redirects a signed-in user to `/`

- [ ] **Step 1: Write the failing test** in `src/routes/login/login.test.ts`

Replace the client-store tests with action tests. Call `actions.default` with a fake event whose `cookies.set` is a `vi.fn()` and `request.formData()` returns a `FormData`.

```ts
// @vitest-environment node
// assert: empty form -> { status: 400 } with errors.email and errors.password
// assert: bad email format -> errors.email === 'Enter a valid email'
// assert: wrong password -> { status: 400 }, cookies.set NOT called
// assert: correct credentials -> no fail() thrown, cookies.set called with 'tokoku_session'
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run src/routes/login/login.test.ts`
Expected: FAIL — `./+page.server` not found.

- [ ] **Step 3: Implement `src/routes/login/+page.server.ts`**

- `load({ locals })`: if `locals.user`, `redirect(303, '/')`.
- `actions.default({ request, cookies })`: read `email`/`password` from `request.formData()`. Reuse the email pattern from `src/lib/utils/memberValidation.ts` — export `EMAIL` from there if it is not exported yet, do not copy the regex. Validate presence, then format. On failure `return fail(400, { email, errors })`. On success `cookies.set(SESSION_COOKIE, createSession('user-1'), { path: '/', httpOnly: true, sameSite: 'lax', secure: !dev, maxAge: SESSION_MAX_AGE })` and `redirect(303, '/')`.
- Credentials: the demo account is `rina@tokoku.id` / `rahasia`. Add `// shortcut: one hardcoded demo account, replace with a users table when accounts are real.`

`secure: !dev` — import `dev` from `$app/env`. Hardcoding `secure: true` breaks login on http.

- [ ] **Step 4: Update `src/routes/login/+page.svelte`**

- Remove `import { auth, login }` and the `onMount` redirect and the `kirim` handler.
- Accept `let { form }: { form: { errors?: Record<string,string>; email?: string } } = $props()`.
- Form becomes `<form method="POST" use:enhance>` from `$app/forms`.
- Field errors read `form?.errors?.email` / `form?.errors?.password`. Keep `role="alert"`, `aria-invalid`, `aria-describedby` exactly as they are today.
- Remove the "Remember me" checkbox only if it has no behavior — leave it, it is out of scope.

- [ ] **Step 5: Run tests and check**

Run: `npx vitest run src/routes/login/login.test.ts && npm run check`
Expected: all passing, 0 check errors.

- [ ] **Step 6: Commit**

```bash
git add src/routes/login/+page.server.ts src/routes/login/+page.svelte src/routes/login/login.test.ts src/lib/utils/memberValidation.ts
git commit -m "feat: authenticate through a server form action"
```

---

### Task 3: Server guard, logout, and removal of the client auth store

**Files:**
- Create: `src/routes/(dashboard)/+layout.server.ts`
- Delete: `src/routes/(dashboard)/+layout.ts`
- Create: `src/routes/logout/+page.server.ts`
- Modify: `src/lib/components/UserMenu.svelte`
- Delete: `src/lib/stores/auth.ts`, `src/lib/stores/auth.test.ts`
- Test: `src/routes/(dashboard)/guard.test.ts`

**Interfaces:**
- Consumes: `event.locals.user` (Task 1), `SESSION_COOKIE` + `destroySession` (Task 1)
- Produces: guarded dashboard; `POST /logout` form action

- [ ] **Step 1: Write the failing test** in `src/routes/(dashboard)/guard.test.ts`

```ts
// @vitest-environment node
// assert: load({ locals: { user: null } }) throws an object with status 303 and location '/login'
// assert: load({ locals: { user: { id: 'user-1', email: 'rina@tokoku.id' } } }) returns { user }
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run "src/routes/(dashboard)/guard.test.ts"`
Expected: FAIL — no `+layout.server`.

- [ ] **Step 3: Implement `src/routes/(dashboard)/+layout.server.ts`**

`export const load = ({ locals }) => { if (!locals.user) redirect(303, '/login'); return { user: locals.user }; }`

Delete `src/routes/(dashboard)/+layout.ts`. Its only content was `ssr = false` plus the client guard. Keep `ssr = false` only if the dev server shows a hydration mismatch — check in Step 6 before deciding.

- [ ] **Step 4: Implement `src/routes/logout/+page.server.ts`**

`actions.default({ cookies })`: read the token, `destroySession(token)`, `cookies.delete(SESSION_COOKIE, { path: '/' })`, `redirect(303, '/login')`.

- [ ] **Step 5: Update `src/lib/components/UserMenu.svelte`**

Replace the `keluar()` handler and `logout()` import with `<form method="POST" action="/logout">` wrapping the Sign out button (`type="submit"`). Keep `role="menuitem"`, `aria-haspopup`, `aria-expanded`, the outside-click and Escape effects. Update `UserMenu.test.ts`: assert the Sign out control is a submit inside a form whose action is `/logout`, instead of asserting `goto('/login')`.

- [ ] **Step 6: Delete the client auth store and verify in a browser**

`git rm src/lib/stores/auth.ts src/lib/stores/auth.test.ts`. Grep for `stores/auth` across `src` — no hits may remain.

Run `npm run dev`, then check by hand: `/member` while logged out redirects to `/login`; login reaches `/`; refresh stays logged in; Sign out returns to `/login` and a refresh does not re-enter.

- [ ] **Step 7: Run tests and check, then commit**

Run: `npm test && npm run check`

```bash
git add -A
git commit -m "feat: guard the dashboard with a server session and drop the client auth store"
```

---

### Task 4: Paginate the members API

**Files:**
- Modify: `src/routes/api/members/+server.ts`
- Modify: `src/routes/api/members/api.test.ts`
- Modify: `src/routes/(dashboard)/member/+page.ts`

**Interfaces:**
- Consumes: `listMembers()` from `#lib/server/memberStore`
- Produces: `GET /api/members?page=&perPage=` returning `{ members, pagination: { page, perPage, total, totalPages } }`

- [ ] **Step 1: Write the failing test** in `src/routes/api/members/api.test.ts`

```ts
// assert: ?page=2&perPage=5 -> members.length === 5, pagination.page === 2
// assert: no params -> perPage 20, page 1
// assert: ?perPage=99999 -> pagination.perPage === 100
// assert: ?page=abc -> pagination.page === 1 (not NaN)
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run src/routes/api/members/api.test.ts`
Expected: FAIL — body is a bare array.

- [ ] **Step 3: Implement pagination in the handler**

`page = Number.parseInt(raw, 10) || 1`, clamped to `>= 1`. `perPage` clamped to `1..100`, default 20. Slice the list. Return the envelope above.

- [ ] **Step 4: Update `src/routes/(dashboard)/member/+page.ts`**

The load currently treats the body as `Member[]`. It must now read `body.members`. The page keeps doing its own filter/sort/paginate on the full list — do not change the page component in this task.

- [ ] **Step 5: Run tests and check, then commit**

Run: `npm test && npm run check`

```bash
git add src/routes/api/members/+server.ts src/routes/api/members/api.test.ts "src/routes/(dashboard)/member/+page.ts"
git commit -m "feat: paginate the members API"
```

---

### Task 5: Rate limit the API

**Files:**
- Create: `src/lib/server/rateLimit.ts`
- Modify: `src/routes/api/members/+server.ts`, `src/routes/api/members/[id]/+server.ts`, `src/routes/api/members/[id]/orders/+server.ts`
- Test: `src/lib/server/rateLimit.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `checkRateLimit(key: string): { ok: boolean; remaining: number }`; `RATE_LIMIT = 100` per 60s window

- [ ] **Step 1: Write the failing test**

```ts
// assert: 100 calls with the same key -> all ok
// assert: the 101st call with the same key -> ok === false
// assert: a different key is unaffected
// assert: after the window passes (inject now), the key is allowed again
```

Take `now = Date.now` as an optional parameter so the window test does not sleep.

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run src/lib/server/rateLimit.test.ts`
Expected: FAIL — cannot resolve `./rateLimit`.

- [ ] **Step 3: Implement a fixed-window limiter**

Module-level `Map<string, { count: number; resetAt: number }>`. Key from `event.getClientAddress()` in handlers, falling back to `'unknown'`.

```ts
// shortcut: fixed-window counter in process memory, per instance; move to Redis when more than one instance serves traffic.
```

- [ ] **Step 4: Apply it in all three member handlers**

Return `json({ error: 'Too many requests' }, { status: 429 })` when `ok` is false. Do not add CORS headers — this app serves its own frontend; there is no cross-origin caller.

- [ ] **Step 5: Run tests and check, then commit**

Run: `npm test && npm run check`

```bash
git add src/lib/server/rateLimit.ts src/lib/server/rateLimit.test.ts src/routes/api/members
git commit -m "feat: rate limit the member endpoints"
```

---

### Task 6: Tighten member validation

**Files:**
- Modify: `src/lib/utils/memberValidation.ts`
- Modify: `src/lib/utils/memberValidation.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `MAX_NAMA = 100`, `MAX_EMAIL = 254`, `MAX_HP = 15`; exported `EMAIL` pattern

- [ ] **Step 1: Write the failing tests**

```ts
// assert: nama of 101 chars -> errors.nama === 'Name must be 100 characters or fewer'
// assert: nama of 100 chars -> no errors.nama
// assert: email of 255 chars -> errors.email
// assert: hp '1234567890' (no 8 after 0) -> errors.hp
// assert: hp '081234567890' -> no errors.hp
// assert: hp '6281234567890' -> no errors.hp
// assert: email 'user@.com' -> errors.email
// assert: email 'a@b.co' -> no errors.email
```

- [ ] **Step 2: Run them, expect failure**

Run: `npx vitest run src/lib/utils/memberValidation.test.ts`
Expected: FAIL on the length and prefix cases.

- [ ] **Step 3: Implement**

Keep the existing messages for the cases the current tests already pin (`'Name is required'`, `'Enter a valid email'`, `'Enter a valid phone number'`, `'Choose a valid status'`) — those tests must keep passing. Add length checks after the existing ones. Phone: keep the current digit-count rule, then add an Indonesian prefix check `^(\+62|62|0)8`. Export `EMAIL`.

- [ ] **Step 4: Run tests and check, then commit**

Run: `npm test && npm run check`

```bash
git add src/lib/utils/memberValidation.ts src/lib/utils/memberValidation.test.ts
git commit -m "feat: bound member field lengths and phone prefixes"
```

---

### Task 7: Reject non-image, non-PDF uploads

**Files:**
- Modify: `src/lib/utils/fileUpload.ts`
- Modify: `src/lib/components/form/FileUpload.svelte`
- Modify: `src/lib/components/form/MultiFileUpload.svelte`
- Modify: `src/lib/utils/fileUpload.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `fileTypeError(file: File): string | null`

- [ ] **Step 1: Write the failing test** in `src/lib/utils/fileUpload.test.ts`

```ts
// assert: new File([], 'a.pdf', { type: 'application/pdf' }) -> null
// assert: type 'image/png' -> null
// assert: type 'application/x-msdownload' -> a message naming the allowed types
// assert: type '' -> a message (unknown type is refused)
```

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run src/lib/utils/fileUpload.test.ts`
Expected: FAIL — `fileTypeError` is not exported.

- [ ] **Step 3: Implement `fileTypeError`**

Allowlist: `image/png`, `image/jpeg`, `image/gif`, `image/webp`, `application/pdf`. Message: `'Choose a PNG, JPG, GIF, WebP, or PDF file'`.

```ts
// shortcut: checks the browser-reported MIME type only; sniff bytes on the server when uploads are actually stored.
```

- [ ] **Step 4: Wire it into both upload components**

In `pick()`, call `fileTypeError` after `fileSizeError` and before assigning the file. For `MultiFileUpload`, filter each accepted file and set one error listing the rejected names.

- [ ] **Step 5: Run tests and check, then commit**

Run: `npm test && npm run check`

```bash
git add src/lib/utils/fileUpload.ts src/lib/utils/fileUpload.test.ts src/lib/components/form/FileUpload.svelte src/lib/components/form/MultiFileUpload.svelte
git commit -m "feat: restrict uploads to images and PDFs"
```

---

### Task 8: Log API failures and return honest errors

**Files:**
- Create: `src/lib/server/logger.ts`
- Modify: `src/routes/api/members/+server.ts`, `src/routes/api/members/[id]/+server.ts`, `src/routes/api/members/[id]/orders/+server.ts`
- Test: `src/lib/server/logger.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `logRequest(method: string, path: string, status: number, ms: number): void`; `logError(method: string, path: string, error: unknown): void`

- [ ] **Step 1: Write the failing test**

```ts
// assert: logRequest writes one line containing method, path, status, and duration
// assert: logError writes one line containing the message and does not throw on a non-Error value
```

Spy on `console.info` / `console.error`; restore after.

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run src/lib/server/logger.test.ts`
Expected: FAIL — cannot resolve `./logger`.

- [ ] **Step 3: Implement the logger**

Two functions over `console.info` / `console.error`, each emitting one JSON line `{ method, path, status, ms }` / `{ method, path, message }`. For non-`Error` values use `String(error)`.

- [ ] **Step 4: Wrap each handler body in `try/catch`**

Measure `Date.now()` at entry. Log every response. On an unexpected throw: `logError(...)`, then `json({ error: 'Something went wrong' }, { status: 500 })`. Never return the raw error message to the client — it can contain data. Validation `400`s stay as they are.

- [ ] **Step 5: Run tests and check, then commit**

Run: `npm test && npm run check`

```bash
git add src/lib/server/logger.ts src/lib/server/logger.test.ts src/routes/api/members
git commit -m "feat: log API requests and return generic 500s"
```

---

### Task 9: Debounce the member search

**Files:**
- Create: `src/lib/utils/debounce.ts`
- Modify: `src/routes/(dashboard)/member/+page.svelte`
- Test: `src/lib/utils/debounce.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `debounce<T extends (...args: never[]) => void>(fn: T, ms: number): { call: T; cancel: () => void }`

- [ ] **Step 1: Write the failing test**

```ts
// assert: three rapid call()s inside the delay invoke fn once
// assert: the value passed is the last one
// assert: cancel() before the delay elapses prevents the call
```

Use `vi.useFakeTimers()` and `vi.advanceTimersByTime`.

- [ ] **Step 2: Run it, expect failure**

Run: `npx vitest run src/lib/utils/debounce.test.ts`
Expected: FAIL — cannot resolve `./debounce`.

- [ ] **Step 3: Implement with `setTimeout`**

No dependency. `cancel` clears the pending timer. Return `{ call, cancel }`.

- [ ] **Step 4: Use it for the search box in the member page**

The search input keeps `bind:value={query}` for the field itself but writes to a separate `$state` (`queryInput`) that the debounced `call` copies into `query` after 250ms. Reset `page = 1` inside the debounced callback. Clean up with `$effect(() => () => cancel())` so a navigation does not leave a timer behind. The existing tests type with `fireEvent.input` and then assert immediately — switch them to `vi.advanceTimersByTime(250)` after typing, or the page tests will fail.

- [ ] **Step 5: Run tests and check, then commit**

Run: `npm test && npm run check`

```bash
git add src/lib/utils/debounce.ts src/lib/utils/debounce.test.ts "src/routes/(dashboard)/member/+page.svelte" "src/routes/(dashboard)/member/member-page.test.ts"
git commit -m "feat: debounce the member search input"
```

---

### Task 10: Cache headers that do not leak

**Files:**
- Modify: `src/routes/api/members/+server.ts`, `src/routes/api/members/[id]/+server.ts`, `src/routes/api/members/[id]/orders/+server.ts`

**Interfaces:**
- Consumes: the handlers from Tasks 4, 5, 8
- Produces: `Cache-Control: private, no-store` on every member response

- [ ] **Step 1: Add the header in one helper**

`src/lib/server/logger.ts` is the wrong home. Put `const PRIVATE_CACHE = { 'cache-control': 'private, no-store' }` in each handler's response options, or add a tiny `jsonPrivate(body, init)` helper in `src/lib/server/http.ts` and use it in all three handlers.

Do **not** use `public` or `max-age`. These responses are per-user and change on POST/PATCH.

- [ ] **Step 2: Verify by hand**

Run `npm run dev`, `curl -i localhost:5173/api/members | grep -i cache-control`.
Expected: `cache-control: private, no-store`.

- [ ] **Step 3: Run tests and check, then commit**

Run: `npm test && npm run check`

```bash
git add src/routes/api/members src/lib/server/http.ts
git commit -m "feat: mark member responses private and uncacheable"
```

---

## Parked

- **PostgreSQL + Prisma + backups + audit log** — needs a database. Not in this environment, and AGENTS.md declares the API a dummy. Decide the database before this work starts.
- **Virtualization** — the table paginates 10 rows. Revisit only if page size grows.
- **CSRF tokens** — SvelteKit form actions already reject cross-origin POSTs.
- **DOMPurify** — `renderMarkdown` already escapes all HTML before building tags.
