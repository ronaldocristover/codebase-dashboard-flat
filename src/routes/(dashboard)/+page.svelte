<script lang="ts">
	import BarChart from '#lib/components/BarChart.svelte';
	import LineChart from '#lib/components/LineChart.svelte';
	import StatCard from '#lib/components/StatCard.svelte';
	import StatusPill from '#lib/components/StatusPill.svelte';
	import { ordersWeek, recentOrders, salesTrend, stats } from '#lib/mock/dashboard';
	import { formatRupiah } from '#lib/utils/format';
</script>

<svelte:head>
	<title>Dashboard — TokoKu</title>
</svelte:head>

<div class="space-y-4">
	<section class="grid grid-cols-2 gap-3 lg:grid-cols-4">
		{#each stats as stat (stat.label)}
			<StatCard {...stat} />
		{/each}
	</section>

	<section class="grid gap-3 lg:grid-cols-[1.35fr_1fr]">
		<div class="rounded-lg border border-line bg-white p-4">
			<h2 class="text-sm font-semibold">Sales trend (30 days)</h2>
			<p class="mt-0.5 text-[11px] text-muted">
				Total Rp 118.6M · up 14% vs last month
			</p>
			<div class="mt-3">
				<LineChart points={salesTrend} />
			</div>
		</div>

		<div class="rounded-lg border border-line bg-white p-4">
			<h2 class="text-sm font-semibold">Orders (7 days)</h2>
			<p class="mt-0.5 text-[11px] text-muted">742 total orders</p>
			<div class="mt-3">
				<BarChart data={ordersWeek} />
			</div>
		</div>
	</section>

	<section class="rounded-lg border border-line bg-white">
		<div class="border-b border-line px-4 py-3">
			<h2 class="text-sm font-semibold">Recent orders</h2>
			<p class="mt-0.5 text-[11px] text-muted">Updated a few minutes ago</p>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full min-w-[420px] text-left text-[13px]">
				<thead>
					<tr class="text-[10px] uppercase tracking-[0.08em] text-muted">
						<th class="px-4 py-2 font-medium">Invoice</th>
						<th class="px-4 py-2 font-medium">Name</th>
						<th class="px-4 py-2 font-medium">Amount</th>
						<th class="px-4 py-2 font-medium">Status</th>
					</tr>
				</thead>
				<tbody>
					{#each recentOrders as order (order.invoice)}
						<tr class="border-t border-line">
							<td class="px-4 py-2.5 font-medium">#{order.invoice}</td>
							<td class="px-4 py-2.5">{order.nama}</td>
							<td class="px-4 py-2.5">{formatRupiah(order.nominal)}</td>
							<td class="px-4 py-2.5"><StatusPill status={order.status} /></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</div>
