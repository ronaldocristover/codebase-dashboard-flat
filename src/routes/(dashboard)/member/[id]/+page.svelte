<script lang="ts">
	import Breadcrumb from '#lib/components/Breadcrumb.svelte';
	import StatusPill from '#lib/components/StatusPill.svelte';
	import type { Member, MemberOrder } from '#lib/types';
	import { formatRupiah, formatTanggal } from '#lib/utils/format';

	let { data }: { data: { member: Member; orders: MemberOrder[] } } = $props();

	const member = $derived(data.member);
	const orders = $derived(data.orders);

	const initials = $derived(
		member.nama
			.split(' ')
			.map((word) => word[0])
			.slice(0, 2)
			.join('')
	);

	const lastOrder = $derived([...orders].sort((a, b) => b.date.localeCompare(a.date))[0]);

	const card = 'rounded-lg border border-line bg-white p-4';
</script>

<svelte:head>
	<title>{member.nama} — TokoKu</title>
</svelte:head>

<div class="space-y-3">
	<Breadcrumb
		items={[{ label: 'Home', href: '/' }, { label: 'Members', href: '/member' }, { label: member.nama }]}
	/>

	<section class="rounded-lg border border-line bg-white p-4">
		<div class="flex flex-wrap items-start justify-between gap-3">
			<div class="flex items-center gap-3">
				<span
					aria-hidden="true"
					class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary"
				>
					{initials}
				</span>
				<div>
					<h2 class="text-xl font-semibold text-primary">{member.nama}</h2>
					<p class="text-xs text-muted">{member.email}</p>
					<p class="text-xs text-muted">{member.hp}</p>
					<p class="mt-1 text-[11px] text-muted">Joined {formatTanggal(member.bergabung)}</p>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<StatusPill status={member.status} />
				<a
					href="/member/{member.id}/edit"
					class="rounded-md border border-primary px-3 py-1.5 text-[11px] font-medium text-primary hover:bg-primary-soft"
				>
					Edit
				</a>
			</div>
		</div>
	</section>

	<section class="grid gap-3 sm:grid-cols-3">
		<div class={card}>
			<p class="text-[10px] uppercase tracking-[0.08em] text-muted">Total Spend</p>
			<p class="mt-1 text-lg font-semibold text-ink">{formatRupiah(member.totalBelanja)}</p>
		</div>
		<div class={card}>
			<p class="text-[10px] uppercase tracking-[0.08em] text-muted">Orders</p>
			<p class="mt-1 text-lg font-semibold text-ink">{orders.length}</p>
		</div>
		<div class={card}>
			<p class="text-[10px] uppercase tracking-[0.08em] text-muted">Last Order</p>
			<p class="mt-1 text-lg font-semibold text-ink">
				{lastOrder ? formatTanggal(lastOrder.date) : 'No orders yet'}
			</p>
		</div>
	</section>

	<section class="overflow-hidden rounded-lg border border-line bg-white">
		<div class="border-b border-line px-4 py-3">
			<h2 class="text-sm font-semibold">Order History</h2>
			<p class="mt-0.5 text-[11px] text-muted">
				{orders.length === 1 ? '1 order' : `${orders.length} orders`}
			</p>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full min-w-[520px] text-left text-[13px]">
				<thead>
					<tr class="text-[10px] uppercase tracking-[0.08em] text-muted">
						<th class="px-4 py-2 font-medium">Invoice</th>
						<th class="px-4 py-2 font-medium">Date</th>
						<th class="px-4 py-2 font-medium">Amount</th>
						<th class="px-4 py-2 font-medium">Status</th>
					</tr>
				</thead>
				<tbody>
					{#if orders.length === 0}
						<tr class="border-t border-line">
							<td colspan="4" class="px-4 py-10 text-center text-xs text-muted">
								<p class="font-medium text-ink">No orders yet</p>
								<p class="mt-1">This member has not placed an order.</p>
							</td>
						</tr>
					{:else}
						{#each orders as order (order.invoice)}
							<tr class="border-t border-line">
								<td class="px-4 py-2.5 font-medium">#{order.invoice}</td>
								<td class="px-4 py-2.5">{formatTanggal(order.date)}</td>
								<td class="px-4 py-2.5">{formatRupiah(order.amount)}</td>
								<td class="px-4 py-2.5"><StatusPill status={order.status} /></td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</section>
</div>
