<script lang="ts">
	import type { CustomerSegment } from '#lib/types';
	import { sharePercentages } from '#lib/utils/dashboardMetrics';
	import { formatAngka } from '#lib/utils/format';

	let {
		segments,
		label,
		unit = 'customers'
	}: { segments: CustomerSegment[]; label: string; unit?: string } = $props();

	const shares = $derived(sharePercentages(segments.map((segment) => segment.count)));
	const total = $derived(segments.reduce((sum, segment) => sum + segment.count, 0));

	const arcs = $derived.by(() => {
		let offset = 0;
		return segments.map((segment, index) => {
			const arc = { ...segment, share: shares[index], offset };
			offset += shares[index];
			return arc;
		});
	});

	const colors = ['stroke-primary', 'stroke-primary/30', 'stroke-line-strong'];
	const dots = ['bg-primary', 'bg-primary/30', 'bg-line-strong'];
</script>

<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
	<div class="relative mx-auto h-32 w-32 shrink-0 sm:mx-0">
		<svg viewBox="0 0 40 40" class="h-full w-full -rotate-90" role="img" aria-label={label}>
			<circle cx="20" cy="20" r="14" fill="none" stroke-width="6" class="stroke-cream" />
			{#each arcs as arc, index (arc.label)}
				<circle
					cx="20"
					cy="20"
					r="14"
					fill="none"
					stroke-width="6"
					pathLength="100"
					class={colors[index % colors.length]}
					stroke-dasharray="{arc.share} {100 - arc.share}"
					stroke-dashoffset={-arc.offset}
				/>
			{/each}
		</svg>
		<div class="pointer-events-none absolute inset-0 grid place-content-center text-center" aria-hidden="true">
			<span class="text-base font-semibold text-ink tabular-nums">{formatAngka(total)}</span>
			<span class="text-[10px] uppercase tracking-[0.08em] text-muted">{unit}</span>
		</div>
	</div>

	<ul class="min-w-0 flex-1 space-y-2 text-xs">
		{#each arcs as arc, index (arc.label)}
			<li class="flex items-start gap-2">
				<span
					class="mt-1 h-2 w-2 shrink-0 rounded-full {dots[index % dots.length]}"
					aria-hidden="true"
				></span>
				<span class="min-w-0 flex-1 text-ink">{arc.label}</span>
				<span class="shrink-0 text-right tabular-nums">
					<span class="block font-medium text-ink">{formatAngka(arc.count)}</span>
					<span class="block text-[11px] text-muted">{arc.share}%</span>
				</span>
			</li>
		{/each}
	</ul>
</div>
