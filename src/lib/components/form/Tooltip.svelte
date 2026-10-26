<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		text,
		side = 'top',
		children
	}: {
		text: string;
		side?: 'top' | 'bottom';
		children: Snippet;
	} = $props();
</script>

<span class="group relative inline-flex">
	{@render children()}
	<span
		role="tooltip"
		class="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 {side ===
		'top'
			? 'bottom-full mb-2'
			: 'top-full mt-2'}"
	>
		{text}
	</span>
</span>
