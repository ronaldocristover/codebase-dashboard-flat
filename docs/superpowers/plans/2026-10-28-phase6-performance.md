# Phase 6: Performance Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SSKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add virtualization for large lists, debouncing for search/filter, and caching strategy for API responses.

**Architecture:** 
- Add virtualization to member table for large datasets
- Add debouncing to search and filter inputs
- Add caching headers to API endpoints
- Tests for performance improvements

**Tech Stack:** 
- `svelte-virtual-scroller` (virtualization)
- `lodash.debounce` (debouncing)
- Cache-Control headers

**Spec:** See `docs/superpowers/plans/2026-10-28-saas-readiness-audit.md` findings #22, #24, #25

## Global Constraints

- **Svelte 5 Runes:** All components must use `$props()`, `$state`, `$derived`, `$effect`
- **TypeScript Strict:** No `any` without explicit comment
- **Indonesian Domain Identifiers:** Technical terms stay English (`virtual`, `debounce`, `cache`)
- **File Structure:** Virtualization in `src/lib/components/`; debouncing in `src/lib/utils/`
- **Testing:** Tests must be colocated with the code they test

## Review Focus

1. **Virtualization:** Large lists render efficiently → Test: Render 1000 members and verify performance
2. **Debouncing:** Search/filter doesn't re-render on every keystroke → Test: Type quickly and verify debouncing
3. **Caching:** Cached API responses are served faster → Test: Call the same API endpoint twice and verify second call is faster
4. **Performance:** Search/filter is responsive → Test: Search with 1000 members and verify response time
5. **Memory:** Virtualization doesn't cause memory leaks → Test: Scroll through a large list and verify memory usage stays stable

---

## Task 1: Add virtualization to member table

**Files:**
- Modify: `src/routes/(dashboard)/member/+page.svelte`
- Test: `src/routes/(dashboard)/member/member-page.test.ts`

**Interfaces:**
- Consumes: `svelte-virtual-scroller` library
- Produces: Virtualized member table for large datasets

**Dependencies:** None

- [ ] **Step 1: Install svelte-virtual-scroller**

```bash
npm install svelte-virtual-scroller
```

- [ ] **Step 2: Add virtualization to member page**

Update `src/routes/(dashboard)/member/+page.svelte`:

```svelte
<script lang="ts">
	import type { PageData } from './$types';
	import { Pagination } from '#lib/components/Pagination.svelte';
	import { VirtualList } from 'svelte-virtual-scroller';

	let { data }: { data: PageData } = $props();

	let query = $state('');
	let statusFilter = $state<'semua' | MemberStatus>('semua');
	let rentang = $state<'semua' | 7 | 30 | 90>('semua');
	let page = $state(1);
	let sortKey = $state<SortKey>('bergabung');
	let sortDir = $state<SortDir>('desc');

	const PER_HALAMAN = 20;

	const terfilter = $derived(
		filterMembers(data.members, { query, status: statusFilter, joinedWithin: rentang }, sekarang)
	);
	const terurut = $derived(sortMembers(terfilter, sortKey, sortDir));
	const halaman = $derived(paginate(terurut, page, PER_HALAMAN));

	const totalItems = $derived(terurut.length);
	const totalPages = $derived(Math.ceil(totalItems / PER_HALAMAN));

	function handlePageChange(newPage: number) {
		page = newPage;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-2">
		<div class="flex-1 min-w-0">
			<h1 class="text-2xl font-semibold text-primary">Members</h1>
			<p class="text-sm text-muted">{totalItems} members</p>
		</div>
		<button onclick={() => goto('/member/new')} class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
			+ Add Member
		</button>
	</div>

	<!-- Filters -->
	<div class="grid gap-4 sm:grid-cols-3">
		<div>
			<label for="search" class="mb-1.5 block text-xs font-medium text-ink">Search</label>
			<input
				id="search"
				bind:value={query}
				placeholder="Search by name, email, or phone"
				class="w-full rounded-md border border-line-strong bg-white px-3 py-2 text-sm text-ink focus:outline-2 focus:outline-primary"
			/>
		</div>
		<div>
			<label for="status" class="mb-1.5 block text-xs font-medium text-ink">Status</label>
			<select
				id="status"
				bind:value={statusFilter}
				class="w-full rounded-md border border-line-strong bg-white px-3 py-2 text-sm text-ink focus:outline-2 focus:outline-primary"
			>
				<option value="semua">All</option>
				<option value="aktif">Active</option>
				<option value="nonaktif">Inactive</option>
			</select>
		</div>
		<div>
			<label for="rentang" class="mb-1.5 block text-xs font-medium text-ink">Joined Within</label>
			<select
				id="rentang"
				bind:value={rentang}
				class="w-full rounded-md border border-line-strong bg-white px-3 py-2 text-sm text-ink focus:outline-2 focus:outline-primary"
			>
				<option value="semua">All time</option>
				<option value={7}>7 days</option>
				<option value={30}>30 days</option>
				<option value={90}>90 days</option>
			</select>
		</div>
	</div>

	<!-- Table -->
	<div class="overflow-x-auto rounded-lg border border-line">
		<table class="min-w-full divide-y divide-line">
			<thead class="bg-cream">
				<tr>
					<th class="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">Name</th>
					<th class="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">Email</th>
					<th class="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">Phone</th>
					<th class="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">Joined</th>
					<th class="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider cursor-pointer hover:text-primary" onclick={() => handleSort('totalBelanja')}>
						Total Spend {sortKey === 'totalBelanja' && (sortDir === 'asc' ? '↑' : '↓')}
					</th>
					<th class="px-4 py-3 text-left text-xs font-semibold text-ink uppercase tracking-wider">Status</th>
					<th class="px-4 py-3 text-right text-xs font-semibold text-ink uppercase tracking-wider">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-line">
				<VirtualList
					let:item
					let:index
					bind:items={halaman.items}
					itemSize={50}
					estimatedItemHeight={50}
					overscan={10}
					components={{
						Item: ({ item, index }) => (
							<tr class="hover:bg-cream transition-colors">
								<td class="px-4 py-3 whitespace-nowrap text-sm text-ink">
									<a href={`/member/${item.id}`} class="font-medium text-primary hover:underline">
										{item.nama}
									</a>
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-sm text-muted">{item.email}</td>
								<td class="px-4 py-3 whitespace-nowrap text-sm text-muted">{item.hp}</td>
								<td class="px-4 py-3 whitespace-nowrap text-sm text-muted">{formatDate(item.bergabung)}</td>
								<td class="px-4 py-3 whitespace-nowrap text-sm text-ink">{formatRupiah(item.totalBelanja)}</td>
								<td class="px-4 py-3 whitespace-nowrap">
									<StatusPill status={item.status} />
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-right text-sm">
									<a
										href={`/member/${item.id}`}
										class="text-primary hover:underline"
									>
										View
									</a>
									<a
										href={`/member/${item.id}/edit`}
										class="ml-2 text-primary hover:underline"
									>
										Edit
									</a>
								</td>
							</tr>
						)
					}}
				/>
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	<div class="flex items-center justify-between">
		<p class="text-sm text-muted">
			Showing {halaman.from}–{halaman.to} of {halaman.total} members
		</p>
		<Pagination
			currentPage={page}
			totalPages={halaman.totalPages}
			onPageChange={handlePageChange}
		/>
	</div>
</div>
```

- [ ] **Step 3: Add test for virtualization**

```typescript
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import MemberPage from './+page.svelte';

describe('member page virtualization', () => {
	it('renders virtualized list', () => {
		const members = Array.from({ length: 100 }, (_, i) => ({
			id: `MBR-000${i + 1}`,
			nama: `Member ${i + 1}`,
			email: `member${i + 1}@example.com`,
			hp: `081234567890`,
			bergabung: '2026-10-01',
			totalBelanja: 100000,
			status: 'aktif' as MemberStatus
		}));

		const { container } = render(MemberPage, { props: { data: { members } } });

		// Should render more rows than visible (virtualization)
		expect(container.querySelectorAll('tbody tr')).toHaveLength(100);
	});

	it('handles sorting', async () => {
		const members = Array.from({ length: 50 }, (_, i) => ({
			id: `MBR-000${i + 1}`,
			nama: `Member ${i + 1}`,
			email: `member${i + 1}@example.com`,
			hp: `081234567890`,
			bergabung: '2026-10-01',
			totalBelanja: 100000 + i * 1000,
			status: 'aktif' as MemberStatus
		}));

		const { getByText } = render(MemberPage, { props: { data: { members } } });

		const sortButton = getByText('Total Spend');
		await fireEvent.click(sortButton);

		// Should be sorted by totalBelanja
		const rows = screen.getAllByRole('row');
		expect(rows[0]).toHaveTextContent('Rp 104000');
	});
});
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/routes/\(dashboard\)/member/member-page.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/routes/\(dashboard\)/member/+page.svelte src/routes/\(dashboard\)/member/member-page.test.ts
git commit -m "feat: add virtualization to member table"
```

---

## Task 2: Add debouncing to search and filter

**Files:**
- Create: `src/lib/utils/debounce.ts`
- Modify: `src/routes/(dashboard)/member/+page.svelte`
- Test: `src/lib/utils/debounce.test.ts`

**Interfaces:**
- Consumes: `lodash.debounce` library
- Produces: Debounced search and filter functions

**Dependencies:** None

- [ ] **Step 1: Install lodash.debounce**

```bash
npm install lodash.debounce
```

- [ ] **Step 2: Create debounce utility**

Create `src/lib/utils/debounce.ts`:

```typescript
import { debounce } from 'lodash.debounce';

export function createDebouncedCallback<T extends (...args: any[]) => any>(
	callback: T,
	delay: number
): T {
	return debounce(callback, delay) as T;
}
```

- [ ] **Step 3: Add debouncing to member page**

Update `src/routes/(dashboard)/member/+page.svelte`:

```svelte
<script lang="ts">
	import type { PageData } from './$types';
	import { Pagination } from '#lib/components/Pagination.svelte';
	import { VirtualList } from 'svelte-virtual-scroller';
	import { createDebouncedCallback } from '#lib/utils/debounce';

	let { data }: { data: PageData } = $props();

	let query = $state('');
	let statusFilter = $state<'semua' | MemberStatus>('semua');
	let rentang = $state<'semua' | 7 | 30 | 90>('semua');
	let page = $state(1);
	let sortKey = $state<SortKey>('bergabung');
	let sortDir = $state<SortDir>('desc');

	// Debounced search
	const handleSearch = createDebouncedCallback((value: string) => {
		query = value;
		page = 1;
	}, 300);

	// Debounced filter change
	const handleFilterChange = createDebouncedCallback((value: string) => {
		const newStatus = value as 'semua' | MemberStatus;
		if (newStatus !== statusFilter) {
			statusFilter = newStatus;
			page = 1;
		}
	}, 300);

	const PER_HALAMAN = 20;

	const terfilter = $derived(
		filterMembers(data.members, { query, status: statusFilter, joinedWithin: rentang }, sekarang)
	);
	const terurut = $derived(sortMembers(terfilter, sortKey, sortDir));
	const halaman = $derived(paginate(terurut, page, PER_HALAMAN));

	const totalItems = $derived(terurut.length);
	const totalPages = $derived(Math.ceil(totalItems / PER_HALAMAN));

	function handlePageChange(newPage: number) {
		page = newPage;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<!-- ... rest of the component ... -->

<input
	id="search"
	bind:value={query}
	oninput={(e) => handleSearch(e.target.value)}
	placeholder="Search by name, email, or phone"
	class="w-full rounded-md border border-line-strong bg-white px-3 py-2 text-sm text-ink focus:outline-2 focus:outline-primary"
/>

<!-- ... rest of the component ... -->
```

- [ ] **Step 4: Add test for debouncing**

```typescript
import { describe, expect, it } from 'vitest';
import { createDebouncedCallback } from './debounce';

describe('debounce', () => {
	it('debounces function calls', async () => {
		let callCount = 0;
		const callback = () => {
			callCount++;
		};

		const debounced = createDebouncedCallback(callback, 100);

		debounced();
		debounced();
		debounced();

		expect(callCount).toBe(0);

		await new Promise((resolve) => setTimeout(resolve, 150));

		expect(callCount).toBe(1);
	});

	it('calls function after delay', async () => {
		let lastCall: number | null = null;
		const callback = () => {
			lastCall = Date.now();
		};

		const debounced = createDebouncedCallback(callback, 100);

		debounced();

		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(lastCall).toBeNull();

		await new Promise((resolve) => setTimeout(resolve, 60));

		expect(lastCall).not.toBeNull();
	});
});
```

- [ ] **Step 5: Run tests**

Run: `npm test -- src/lib/utils/debounce.test.ts`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/lib/utils/debounce.ts src/routes/\(dashboard\)/member/+page.svelte src/lib/utils/debounce.test.ts
git commit -m "feat: add debouncing to search and filter inputs"
```

---

## Task 3: Add caching to API endpoints

**Files:**
- Modify: `src/routes/api/members/+server.ts`
- Modify: `src/routes/api/members/[id]/+server.ts`
- Modify: `src/routes/api/members/[id]/orders/+server.ts`

**Interfaces:**
- Consumes: Cache-Control headers
- Produces: Cached API responses

**Dependencies:** None

- [ ] **Step 1: Add caching headers to API endpoints**

Update all `+server.ts` files to add caching headers:

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listMembers, createMember, type MemberInput } from '#lib/server/memberStore';
import { validateMemberInput } from '#lib/utils/memberValidation';
import { checkRateLimit } from '#lib/server/rateLimit';
import { logApiRequest, logApiError, logMemberAction, logAuthEvent, logger } from '#lib/server/logger';

export const GET: RequestHandler = async ({ url, request }) => {
	const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
	const startTime = Date.now();

	const { success } = await checkRateLimit(clientIp);

	if (!success) {
		return json({ error: 'Rate limit exceeded' }, { status: 429 });
	}

	const page = parseInt(url.searchParams.get('page') || '1');
	const perPage = parseInt(url.searchParams.get('perPage') || '20');
	const limit = Math.min(Math.max(perPage, 1), 100);
	const offset = (page - 1) * limit;

	const members = listMembers().slice(offset, offset + limit);
	const total = listMembers().length;
	const totalPages = Math.ceil(total / limit);

	const duration = Date.now() - startTime;
	logApiRequest('GET', '/api/members', 200, duration);

	const cacheControl = 'public, max-age=60, stale-while-revalidate=300';

	return json(
		{
			members,
			pagination: {
				page,
				perPage: limit,
				total,
				totalPages
			}
		},
		{
			headers: {
				'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'http://localhost:5173',
				'Cache-Control': cacheControl
			}
		}
	);
};

export const POST: RequestHandler = async ({ request }) => {
	const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
	const startTime = Date.now();

	const { success } = await checkRateLimit(clientIp);

	if (!success) {
		return json({ error: 'Rate limit exceeded' }, { status: 429 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		const duration = Date.now() - startTime;
		logApiError('POST', '/api/members', 'Invalid JSON');
		return json({ errors: { body: 'Invalid JSON' } }, { status: 400 });
	}

	const input = (body && typeof body === 'object' ? body : {}) as Partial<
		Record<keyof MemberInput, unknown>
	>;
	const errors = validateMemberInput(input);
	if (Object.keys(errors).length > 0) {
		const duration = Date.now() - startTime;
		logApiRequest('POST', '/api/members', 400, duration);
		return json({ errors }, { status: 400 });
	}

	const member = createMember(input as MemberInput);
	logMemberAction('CREATE', member.id, 'unknown');
	logApiRequest('POST', '/api/members', 201, Date.now() - startTime);

	return json(member, {
		status: 201,
		headers: {
			'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'http://localhost:5173'
		}
	});
};
```

- [ ] **Step 2: Run tests**

Run: `npm test -- src/routes/api/members/+server.test.ts`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add src/routes/api/members/+server.ts src/routes/api/members/\[id\]/+server.ts src/routes/api/members/\[id\]/orders/+server.ts
git commit -m "feat: add caching headers to API endpoints"
```

---

## Phase 6 Completion Checklist

- [ ] All tasks completed
- [ ] All tests pass (`npm test`)
- [ ] svelte-check passes (`npm run check`)
- [ ] Virtualization is implemented for large lists
- [ ] Debouncing is added to search and filter
- [ ] Caching headers are present on API endpoints
- [ ] All tests pass and code follows project conventions

---

## Success Criteria for Phase 6

- Large lists (1000+ items) render efficiently with virtualization
- Search and filter don't re-render on every keystroke
- Cached API responses are served faster
- Search/filter is responsive with large datasets
- No memory leaks from virtualization

---

## Next Phase

Proceed to **Phase 7: Final Review** (`docs/superpowers/plans/2026-10-28-phase7-final.md`)
