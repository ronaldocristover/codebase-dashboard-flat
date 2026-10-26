<script lang="ts">
	let {
		items,
		allowMultiple = false
	}: {
		items: { title: string; content: string }[];
		allowMultiple?: boolean;
	} = $props();

	const id = $props.id();
	let open = $state<number[]>([]);

	function toggle(index: number) {
		const isOpen = open.includes(index);
		if (allowMultiple) {
			open = isOpen ? open.filter((item) => item !== index) : [...open, index];
		} else {
			open = isOpen ? [] : [index];
		}
	}
</script>

<div class="divide-y divide-line rounded-md border border-line bg-white">
	{#each items as item, index (item.title)}
		<div>
			<h3>
				<button
					type="button"
					aria-expanded={open.includes(index)}
					aria-controls={`${id}-panel-${index}`}
					onclick={() => toggle(index)}
					class="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-sm font-medium text-ink hover:bg-cream"
				>
					{item.title}
					<span class="text-muted" aria-hidden="true">{open.includes(index) ? '−' : '+'}</span>
				</button>
			</h3>
			{#if open.includes(index)}
				<div id={`${id}-panel-${index}`} class="px-4 pb-3 text-xs text-muted">
					{item.content}
				</div>
			{/if}
		</div>
	{/each}
</div>
