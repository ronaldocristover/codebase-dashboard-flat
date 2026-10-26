<script lang="ts">
	import type { SalesPoint } from '#lib/types';

	let { points }: { points: SalesPoint[] } = $props();

	const LEBAR = 320;
	const TINGGI = 100;
	const ATAS = 10;
	const BAWAH = 86;

	const min = $derived(Math.min(...points.map((p) => p.nilai)));
	const max = $derived(Math.max(...points.map((p) => p.nilai)));

	const koordinat = $derived(
		points.map((point, i) => ({
			x: points.length > 1 ? (i * LEBAR) / (points.length - 1) : LEBAR / 2,
			y: BAWAH - ((point.nilai - min) / Math.max(max - min, 1)) * (BAWAH - ATAS)
		}))
	);

	const garis = $derived(koordinat.map((k) => `${k.x.toFixed(1)},${k.y.toFixed(1)}`).join(' '));
	const area = $derived(`0,${BAWAH} ${garis} ${LEBAR},${BAWAH}`);
	const labelSumbu = $derived(
		Array.from({ length: Math.min(5, points.length) }, (_, i) =>
			points[Math.round((i * (points.length - 1)) / Math.max(Math.min(5, points.length) - 1, 1))]
		)
	);
</script>

<div class="relative h-24">
	<svg
		viewBox="0 0 {LEBAR} {TINGGI}"
		class="h-full w-full"
		preserveAspectRatio="none"
		role="img"
		aria-label="Tren penjualan"
	>
		{#each [14, 38, 62, 86] as y (y)}
			<line x1="0" y1={y} x2={LEBAR} y2={y} class="stroke-line" stroke-width="1" />
		{/each}

		<polygon points={area} class="fill-primary-soft" />
		<polyline
			points={garis}
			fill="none"
			class="stroke-primary"
			stroke-width="2"
			stroke-linejoin="round"
			stroke-linecap="round"
		/>
	</svg>

	<div aria-hidden="true">
		{#each koordinat as titik, i (i)}
			<span
				data-titik
				class="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary bg-white"
				style="left: {(titik.x / LEBAR) * 100}%; top: {(titik.y / TINGGI) * 100}%"
			></span>
		{/each}
	</div>
</div>

<div class="mt-1 flex justify-between gap-1 text-[9px] text-muted">
	{#each labelSumbu as titik, i (i)}
		<span>{titik.label}</span>
	{/each}
</div>
