<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Breadcrumb from '#lib/components/Breadcrumb.svelte';
	import MemberExportModal from '#lib/components/MemberExportModal.svelte';
	import MemberImportModal from '#lib/components/MemberImportModal.svelte';
	import Pagination from '#lib/components/Pagination.svelte';
	import StatusPill from '#lib/components/StatusPill.svelte';
	import type { Member, MemberStatus, SortDir, SortKey } from '#lib/types';
	import { formatRupiah, formatTanggal } from '#lib/utils/format';
	import { filterMembers, paginate, sortMembers } from '#lib/utils/memberFilters';

	let { data }: { data: { members: Member[] } } = $props();

	const PER_PAGE = 10;
	const now = new Date();

	let query = $state('');
	let statusFilter = $state<'semua' | MemberStatus>('semua');
	let rentang = $state<'semua' | 7 | 30 | 90>('semua');
	let page = $state(1);
	let sortKey = $state<SortKey>('bergabung');
	let sortDir = $state<SortDir>('desc');
	let exportOpen = $state(false);
	let importOpen = $state(false);

	const filtered = $derived(
		filterMembers(data.members, { query, status: statusFilter, joinedWithin: rentang }, now)
	);
	const sorted = $derived(sortMembers(filtered, sortKey, sortDir));
	const rows = $derived(paginate(sorted, page, PER_PAGE));

	function resetPage() {
		page = 1;
	}

	function changeSort(key: SortKey) {
		if (sortKey === key) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDir = 'asc';
		}
		page = 1;
	}

	function resetAll() {
		query = '';
		statusFilter = 'semua';
		rentang = 'semua';
		page = 1;
		sortKey = 'bergabung';
		sortDir = 'desc';
	}

	function arrow(key: SortKey): string {
		if (sortKey !== key) return '';
		return sortDir === 'asc' ? '▲' : '▼';
	}

	const field = 'rounded-md border border-line-strong bg-white px-2.5 py-2 text-xs text-ink';
</script>

<svelte:head>
	<title>Members — TokoKu</title>
</svelte:head>

<div class="space-y-3">
	<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Members' }]} />

	<div class="flex flex-wrap items-center justify-between gap-2">
		<div>
			<h2 class="text-xl font-semibold text-primary">Members</h2>
			<p class="text-[11px] text-muted">{rows.total} members</p>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				class="rounded-md border border-line-strong bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-cream"
				onclick={() => (exportOpen = true)}
			>
				Export
			</button>
			<button
				type="button"
				class="rounded-md border border-line-strong bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-cream"
				onclick={() => (importOpen = true)}
			>
				Import
			</button>
			<a
				href="/member/new"
				class="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90"
			>
				+ Add Member
			</a>
		</div>
	</div>

	<div class="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-white p-3">
		<input
			type="search"
			aria-label="Search members"
			placeholder="Search name, email, or phone…"
			bind:value={query}
			oninput={resetPage}
			class="{field} min-w-[200px] flex-1"
		/>

		<select aria-label="Status" bind:value={statusFilter} onchange={resetPage} class={field}>
			<option value="semua">Status: All</option>
			<option value="aktif">Active</option>
			<option value="nonaktif">Inactive</option>
		</select>

		<select aria-label="Joined" bind:value={rentang} onchange={resetPage} class={field}>
			<option value="semua">Joined: All</option>
			<option value={7}>Last 7 days</option>
			<option value={30}>Last 30 days</option>
			<option value={90}>Last 90 days</option>
		</select>

		<button
			type="button"
			class="rounded-md border border-primary px-3 py-2 text-xs font-medium text-primary hover:bg-primary-soft"
			onclick={resetAll}
		>
			Reset
		</button>
	</div>

	<div class="overflow-hidden rounded-lg border border-line bg-white">
		<div class="overflow-x-auto">
			<table class="w-full min-w-[860px] text-left text-[13px]">
				<thead>
					<tr class="text-[10px] uppercase tracking-[0.08em] text-muted">
						<th class="px-4 py-2.5 font-medium">
							<button type="button" class="inline-flex items-center gap-1" onclick={() => changeSort('nama')}>
								Name <span class="text-primary">{arrow('nama')}</span>
							</button>
						</th>
						<th class="px-4 py-2.5 font-medium">Email</th>
						<th class="px-4 py-2.5 font-medium">Phone</th>
						<th class="px-4 py-2.5 font-medium">
							<button
								type="button"
								class="inline-flex items-center gap-1"
								onclick={() => changeSort('bergabung')}
							>
								Joined <span class="text-primary">{arrow('bergabung')}</span>
							</button>
						</th>
						<th class="px-4 py-2.5 font-medium">
							<button
								type="button"
								class="inline-flex items-center gap-1"
								onclick={() => changeSort('totalBelanja')}
							>
								Total Spend <span class="text-primary">{arrow('totalBelanja')}</span>
							</button>
						</th>
						<th class="px-4 py-2.5 font-medium">Status</th>
						<th class="px-4 py-2.5 font-medium">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#if rows.items.length === 0}
						<tr class="border-t border-line">
							<td colspan="7" class="px-4 py-10 text-center text-xs text-muted">
								<p class="font-medium text-ink">No matching members</p>
								<p class="mt-1">Try changing the keyword or filters.</p>
								<button
									type="button"
									class="mt-3 rounded-md border border-primary px-3 py-1.5 text-[11px] font-medium text-primary"
									onclick={resetAll}
								>
									Reset filters
								</button>
							</td>
						</tr>
					{:else}
						{#each rows.items as member (member.id)}
							<tr class="border-t border-line">
								<td class="px-4 py-2.5">
									<div class="flex items-center gap-2">
										<span
											aria-hidden="true"
											class="flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft text-[10px] font-semibold text-primary"
										>
											{member.nama
												.split(' ')
												.map((kata) => kata[0])
												.slice(0, 2)
												.join('')}
										</span>
										<a href="/member/{member.id}" class="font-medium hover:text-primary">
											{member.nama}
										</a>
									</div>
								</td>
								<td class="px-4 py-2.5 text-muted">{member.email}</td>
								<td class="px-4 py-2.5 text-muted">{member.hp}</td>
								<td class="px-4 py-2.5">{formatTanggal(member.bergabung)}</td>
								<td class="px-4 py-2.5">{formatRupiah(member.totalBelanja)}</td>
								<td class="px-4 py-2.5"><StatusPill status={member.status} /></td>
								<td class="px-4 py-2.5">
									<div class="flex items-center gap-3 text-[11px] font-medium">
										<a
											href="/member/{member.id}"
											class="text-primary hover:underline"
											aria-label="View {member.nama}"
										>
											View
										</a>
										<a
											href="/member/{member.id}/edit"
											class="text-muted hover:text-primary"
											aria-label="Edit {member.nama}"
										>
											Edit
										</a>
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		{#if rows.total > 0}
			<div class="border-t border-line">
				<Pagination
					page={page}
					totalPages={rows.totalPages}
					total={rows.total}
					from={rows.from}
					to={rows.to}
					onPageChange={(next) => (page = next)}
				/>
			</div>
		{/if}
	</div>
</div>

<MemberExportModal open={exportOpen} members={sorted} onClose={() => (exportOpen = false)} />
<MemberImportModal
	open={importOpen}
	onClose={() => (importOpen = false)}
	onImported={async () => {
		await invalidateAll();
	}}
/>
