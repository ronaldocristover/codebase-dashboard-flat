<script lang="ts">
	let { lines = 3, class: className = '' }: { lines?: number; class?: string } = $props();
</script>

<div class="space-y-2 {className}" aria-hidden="true">
	{#each Array.from({ length: lines }, (_, index) => index) as line (line)}
		<div class="h-3 animate-pulse rounded bg-line {line === lines - 1 ? 'w-2/3' : 'w-full'}"></div>
	{/each}
</div>
