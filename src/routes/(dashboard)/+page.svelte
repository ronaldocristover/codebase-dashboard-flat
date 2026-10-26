<script lang="ts">
	import BarChart from '#lib/components/BarChart.svelte';
	import DonutChart from '#lib/components/DonutChart.svelte';
	import LineChart from '#lib/components/LineChart.svelte';
	import StatCard from '#lib/components/StatCard.svelte';
	import StatusPill from '#lib/components/StatusPill.svelte';
	import WidgetCard from '#lib/components/WidgetCard.svelte';
	import {
		channelRevenue,
		customerMix,
		funnelSteps,
		ordersWeek,
		recentOrders,
		salesTrend,
		stats,
		stockAlerts,
		topProducts
	} from '#lib/mock/dashboard';
	import { buildFunnel, sharePercentages } from '#lib/utils/dashboardMetrics';
	import { formatAngka, formatRupiah } from '#lib/utils/format';

	const funnel = buildFunnel(funnelSteps);

	const channelShares = sharePercentages(channelRevenue.map((item) => item.amount));
	const channels = channelRevenue.map((item, index) => ({ ...item, share: channelShares[index] }));
	const channelTotal = channelRevenue.reduce((sum, item) => sum + item.amount, 0);

	const mixShares = sharePercentages(customerMix.map((item) => item.count));
	const mixTotal = customerMix.reduce((sum, item) => sum + item.count, 0);
	const mixLabel = customerMix
		.map((item, index) => `${item.label} ${mixShares[index]}%`)
		.join(', ');
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
		<WidgetCard title="Sales trend (30 days)" hint="Total Rp 118.6M · up 14% vs last month">
			<LineChart points={salesTrend} />
		</WidgetCard>

		<WidgetCard title="Orders (7 days)" hint="742 total orders">
			<BarChart data={ordersWeek} />
		</WidgetCard>
	</section>

	<section class="grid gap-3 lg:grid-cols-[1.35fr_1fr]">
		<WidgetCard
			title="Conversion funnel"
			hint="{funnel.overall}% of sessions end in a paid order"
		>
			<ol class="space-y-3">
				{#each funnel.rows as row (row.label)}
					<li>
						<div class="flex items-baseline justify-between gap-3 text-xs">
							<span class="font-medium text-ink">{row.label}</span>
							<span class="flex items-baseline gap-2 tabular-nums">
								<span class="text-ink">{formatAngka(row.visitors)}</span>
								<span class="w-10 text-right text-[11px] text-muted">
									{row.rate === null ? '—' : `${row.rate}%`}
								</span>
							</span>
						</div>
						<div class="mt-1.5 h-2 overflow-hidden rounded-full bg-cream" aria-hidden="true">
							<div class="h-full rounded-full bg-primary" style:width="{row.width}%"></div>
						</div>
					</li>
				{/each}
			</ol>
			<p class="mt-3 text-[11px] text-muted">
				Percentages show conversion from the previous step.
			</p>
		</WidgetCard>

		<WidgetCard
			title="Customer mix"
			hint="{formatAngka(mixTotal)} buyers this month"
			bodyClass="flex items-center p-4"
		>
			<DonutChart segments={customerMix} label={mixLabel} unit="buyers" />
		</WidgetCard>
	</section>

	<section class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
		<WidgetCard title="Revenue by channel" hint="{formatRupiah(channelTotal)} total">
			<ul class="space-y-3">
				{#each channels as item (item.channel)}
					<li>
						<div class="flex items-baseline justify-between gap-3 text-xs">
							<span class="text-ink">{item.channel}</span>
							<span class="tabular-nums text-ink">{formatRupiah(item.amount)}</span>
						</div>
						<div class="mt-1 flex items-center gap-2">
							<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-cream" aria-hidden="true">
								<div class="h-full rounded-full bg-primary" style:width="{item.share}%"></div>
							</div>
							<span class="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted">
								{item.share}%
							</span>
						</div>
					</li>
				{/each}
			</ul>
		</WidgetCard>

		<WidgetCard title="Top products" hint="By units sold this month">
			<ol class="divide-y divide-line">
				{#each topProducts as product, index (product.name)}
					<li class="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
						<span
							class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-soft text-[10px] font-semibold tabular-nums text-primary"
						>
							{index + 1}
						</span>
						<div class="min-w-0 flex-1">
							<p class="truncate text-xs font-medium text-ink">{product.name}</p>
							<p class="text-[11px] text-muted">
								{product.category} · {formatAngka(product.units)} sold
							</p>
						</div>
						<span class="shrink-0 text-xs font-medium tabular-nums text-ink">
							{formatRupiah(product.revenue)}
						</span>
					</li>
				{/each}
			</ol>
		</WidgetCard>

		<WidgetCard
			title="Inventory alerts"
			hint="{stockAlerts.length} products below their reorder point"
		>
			<ul class="space-y-3">
				{#each stockAlerts as alert (alert.sku)}
					{@const habis = alert.stock === 0}
					<li class="flex items-start justify-between gap-3">
						<div class="min-w-0">
							<p class="truncate text-xs font-medium text-ink">{alert.name}</p>
							<p class="text-[11px] text-muted">
								{alert.sku} · reorder at {alert.threshold}
							</p>
						</div>
						<span
							class="shrink-0 whitespace-nowrap rounded border px-2 py-0.5 text-[10px] font-medium {habis
								? 'border-danger text-danger'
								: 'border-warning text-warning'}"
						>
							{habis ? 'Out of stock' : `${alert.stock} left`}
						</span>
					</li>
				{/each}
			</ul>
		</WidgetCard>
	</section>

	<WidgetCard title="Recent orders" hint="Updated a few minutes ago" bodyClass="">
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
							<td class="px-4 py-2.5 tabular-nums">{formatRupiah(order.nominal)}</td>
							<td class="px-4 py-2.5"><StatusPill status={order.status} /></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</WidgetCard>
</div>
