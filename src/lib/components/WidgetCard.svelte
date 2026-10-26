<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		hint,
		bodyClass = 'p-4',
		children
	}: {
		title: string;
		hint?: string;
		bodyClass?: string;
		children: Snippet;
	} = $props();
</script>

<section class="flex h-full flex-col rounded-lg border border-line bg-white">
	<header class="border-b border-line px-4 py-3">
		<h2 class="text-sm font-semibold text-ink">{title}</h2>
		{#if hint}
			<p class="mt-0.5 text-[11px] text-muted">{hint}</p>
		{/if}
	</header>
	<div class="flex-1 {bodyClass}">
		{@render children()}
	</div>
</section>
