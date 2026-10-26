<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		label,
		items,
		onSelect,
		align = 'left'
	}: {
		label: string;
		items: { label: string; value: string; danger?: boolean }[];
		onSelect?: (value: string) => void;
		align?: 'left' | 'right';
	} = $props();

	let open = $state(false);
	let root: HTMLDivElement;

	$effect(() => {
		if (!open) return;

		const closeOnOutsideClick = (event: MouseEvent) => {
			if (root && !root.contains(event.target as Node)) open = false;
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') open = false;
		};

		document.addEventListener('click', closeOnOutsideClick);
		document.addEventListener('keydown', closeOnEscape);

		return () => {
			document.removeEventListener('click', closeOnOutsideClick);
			document.removeEventListener('keydown', closeOnEscape);
		};
	});

	function pick(value: string) {
		open = false;
		onSelect?.(value);
	}
</script>

<div class="relative inline-block" bind:this={root}>
	<button
		type="button"
		class="inline-flex min-h-10 items-center gap-2 rounded-md border border-line-strong bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-cream focus:outline-2 focus:outline-primary"
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		{label}
		<Icon name="chevron-down" class="h-4 w-4 text-muted" />
	</button>

	{#if open}
		<div
			class="absolute top-11 z-50 w-48 rounded-lg border border-line bg-white p-1.5 {align === 'right'
				? 'right-0'
				: 'left-0'}"
			role="menu"
		>
			{#each items as item (item.value)}
				<button
					type="button"
					role="menuitem"
					class="flex w-full items-center rounded-md px-2 py-2 text-left text-[13px] {item.danger
						? 'text-danger hover:bg-danger/10'
						: 'text-ink hover:bg-cream'}"
					onclick={() => pick(item.value)}
				>
					{item.label}
				</button>
			{/each}
		</div>
	{/if}
</div>
