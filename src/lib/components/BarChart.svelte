<script lang="ts">
	import type { DayCount } from '#lib/types';

	let { data }: { data: DayCount[] } = $props();

	const TINGGI_BATANG = 80;
	const max = $derived(Math.max(...data.map((d) => d.jumlah), 1));
</script>

<svg
	viewBox="0 0 {data.length * 32} 96"
	class="h-24 w-full"
	preserveAspectRatio="none"
	role="img"
	aria-label="Orders per day"
>
	{#each data as item, i (item.hari)}
		{@const tinggi = (item.jumlah / max) * TINGGI_BATANG}
		<rect
			x={i * 32 + 4}
			y={86 - tinggi}
			width="24"
			height={tinggi}
			rx="3"
			class={item.jumlah === max ? 'fill-primary' : 'fill-info-line'}
		/>
	{/each}
</svg>

<div class="mt-1 flex text-[9px] text-muted">
	{#each data as item (item.hari)}
		<span class="flex-1 text-center">{item.hari}</span>
	{/each}
</div>
