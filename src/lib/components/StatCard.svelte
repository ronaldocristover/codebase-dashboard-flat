<script lang="ts">
	let {
		label,
		nilai,
		delta,
		arah
	}: { label: string; nilai: string; delta: string; arah: 'naik' | 'turun' } = $props();
</script>

<div class="rounded-lg border border-line bg-white p-4">
	<div class="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">{label}</div>
	<div class="mt-1 text-2xl font-semibold text-primary">{nilai}</div>
	<div class="mt-1 text-[11px] font-medium {arah === 'naik' ? 'text-success' : 'text-danger'}">
		{delta}
	</div>
</div>
