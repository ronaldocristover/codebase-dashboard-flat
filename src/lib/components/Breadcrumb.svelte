<script lang="ts">
	let { items }: { items: { label: string; href?: string }[] } = $props();
</script>

<nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-[11px] text-muted">
	{#each items as item, i (item.label)}
		{#if i > 0}
			<span aria-hidden="true" class="text-line-strong">/</span>
		{/if}
		{#if item.href}
			<a href={item.href} class="hover:text-primary">{item.label}</a>
		{:else}
			<span class="font-medium text-primary">{item.label}</span>
		{/if}
	{/each}
</nav>
