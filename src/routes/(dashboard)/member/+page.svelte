<script lang="ts">
	import Breadcrumb from '#lib/components/Breadcrumb.svelte';
	import Pagination from '#lib/components/Pagination.svelte';
	import StatusPill from '#lib/components/StatusPill.svelte';
	import { members } from '#lib/mock/members';
	import type { MemberStatus, SortDir, SortKey } from '#lib/types';
	import { formatRupiah, formatTanggal } from '#lib/utils/format';
	import { filterMembers, paginate, sortMembers } from '#lib/utils/memberFilters';

	const PER_HALAMAN = 10;
	const sekarang = new Date();

	let query = $state('');
	let statusFilter = $state<'semua' | MemberStatus>('semua');
	let rentang = $state<'semua' | 7 | 30 | 90>('semua');
	let page = $state(1);
	let sortKey = $state<SortKey>('bergabung');
	let sortDir = $state<SortDir>('desc');

	const terfilter = $derived(
		filterMembers(members, { query, status: statusFilter, joinedWithin: rentang }, sekarang)
	);
	const terurut = $derived(sortMembers(terfilter, sortKey, sortDir));
	const halaman = $derived(paginate(terurut, page, PER_HALAMAN));

	function resetHalaman() {
		page = 1;
	}

	function ubahSort(key: SortKey) {
		if (sortKey === key) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDir = 'asc';
		}
		page = 1;
	}

	function resetSemua() {
		query = '';
		statusFilter = 'semua';
		rentang = 'semua';
		page = 1;
		sortKey = 'bergabung';
		sortDir = 'desc';
	}

	function panah(key: SortKey): string {
		if (sortKey !== key) return '';
		return sortDir === 'asc' ? '▲' : '▼';
	}

	const kolom = 'rounded-md border border-line-strong bg-white px-2.5 py-2 text-xs text-ink';
</script>

<svelte:head>
	<title>Member — TokoKu</title>
</svelte:head>

<div class="space-y-3">
	<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Member' }]} />

	<div class="flex flex-wrap items-center justify-between gap-2">
		<div>
			<h2 class="text-base font-semibold text-primary">Data Member</h2>
			<p class="text-[11px] text-muted">{halaman.total} member</p>
		</div>
		<button
			type="button"
			class="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90"
		>
			+ Tambah Member
		</button>
	</div>

	<div class="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-white p-3">
		<input
			type="search"
			aria-label="Cari member"
			placeholder="Cari nama, email, atau nomor HP…"
			bind:value={query}
			oninput={resetHalaman}
			class="{kolom} min-w-[200px] flex-1"
		/>

		<select
			aria-label="Status"
			bind:value={statusFilter}
			onchange={resetHalaman}
			class={kolom}
		>
			<option value="semua">Status: Semua</option>
			<option value="aktif">Aktif</option>
			<option value="nonaktif">Nonaktif</option>
		</select>

		<select aria-label="Bergabung" bind:value={rentang} onchange={resetHalaman} class={kolom}>
			<option value="semua">Bergabung: Semua</option>
			<option value={7}>7 hari terakhir</option>
			<option value={30}>30 hari terakhir</option>
			<option value={90}>90 hari terakhir</option>
		</select>

		<button
			type="button"
			class="rounded-md border border-primary px-3 py-2 text-xs font-medium text-primary hover:bg-primary-soft"
			onclick={resetSemua}
		>
			Reset
		</button>
	</div>

	<div class="overflow-hidden rounded-lg border border-line bg-white">
		<div class="overflow-x-auto">
			<table class="w-full min-w-[720px] text-left text-[13px]">
				<thead>
					<tr class="text-[10px] uppercase tracking-[0.08em] text-muted">
						<th class="px-4 py-2.5 font-medium">
							<button type="button" class="inline-flex items-center gap-1" onclick={() => ubahSort('nama')}>
								Nama <span class="text-primary">{panah('nama')}</span>
							</button>
						</th>
						<th class="px-4 py-2.5 font-medium">Email</th>
						<th class="px-4 py-2.5 font-medium">No. HP</th>
						<th class="px-4 py-2.5 font-medium">
							<button
								type="button"
								class="inline-flex items-center gap-1"
								onclick={() => ubahSort('bergabung')}
							>
								Bergabung <span class="text-primary">{panah('bergabung')}</span>
							</button>
						</th>
						<th class="px-4 py-2.5 font-medium">
							<button
								type="button"
								class="inline-flex items-center gap-1"
								onclick={() => ubahSort('totalBelanja')}
							>
								Total Belanja <span class="text-primary">{panah('totalBelanja')}</span>
							</button>
						</th>
						<th class="px-4 py-2.5 font-medium">Status</th>
					</tr>
				</thead>
				<tbody>
					{#if halaman.items.length === 0}
						<tr class="border-t border-line">
							<td colspan="6" class="px-4 py-10 text-center text-xs text-muted">
								<p class="font-medium text-ink">Tidak ada member yang cocok</p>
								<p class="mt-1">Coba ubah kata kunci atau filter.</p>
								<button
									type="button"
									class="mt-3 rounded-md border border-primary px-3 py-1.5 text-[11px] font-medium text-primary"
									onclick={resetSemua}
								>
									Reset filter
								</button>
							</td>
						</tr>
					{:else}
						{#each halaman.items as member (member.id)}
							<tr class="border-t border-line">
								<td class="px-4 py-2.5">
									<div class="flex items-center gap-2">
										<span
											class="flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft text-[10px] font-semibold text-primary"
										>
											{member.nama
												.split(' ')
												.map((kata) => kata[0])
												.slice(0, 2)
												.join('')}
										</span>
										<span class="font-medium">{member.nama}</span>
									</div>
								</td>
								<td class="px-4 py-2.5 text-muted">{member.email}</td>
								<td class="px-4 py-2.5 text-muted">{member.hp}</td>
								<td class="px-4 py-2.5">{formatTanggal(member.bergabung)}</td>
								<td class="px-4 py-2.5">{formatRupiah(member.totalBelanja)}</td>
								<td class="px-4 py-2.5"><StatusPill status={member.status} /></td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		{#if halaman.total > 0}
			<div class="border-t border-line">
				<Pagination
					page={page}
					totalPages={halaman.totalPages}
					total={halaman.total}
					from={halaman.from}
					to={halaman.to}
					onPageChange={(halamanBaru) => (page = halamanBaru)}
				/>
			</div>
		{/if}
	</div>
</div>
