<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		tabs,
		value = $bindable(''),
		label = 'Tabs',
		children
	}: {
		tabs: { value: string; label: string }[];
		value?: string;
		label?: string;
		children?: Snippet;
	} = $props();

	const id = $props.id();

	function onKeydown(event: KeyboardEvent) {
		const index = tabs.findIndex((tab) => tab.value === value);
		if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

		event.preventDefault();
		const step = event.key === 'ArrowRight' ? 1 : -1;
		value = tabs[(index + step + tabs.length) % tabs.length].value;
	}
</script>

<div>
	<div
		role="tablist"
		aria-label={label}
		tabindex="-1"
		class="flex gap-1 border-b border-line"
		onkeydown={onKeydown}
	>
		{#each tabs as tab (tab.value)}
			<button
				type="button"
				role="tab"
				id={`${id}-${tab.value}-tab`}
				aria-selected={value === tab.value}
				aria-controls={`${id}-${tab.value}-panel`}
				tabindex={value === tab.value ? 0 : -1}
				onclick={() => (value = tab.value)}
				class="-mb-px cursor-pointer border-b-2 px-3 py-2 text-xs font-medium {value === tab.value
					? 'border-primary text-primary'
					: 'border-transparent text-muted hover:text-ink'}"
			>
				{tab.label}
			</button>
		{/each}
	</div>

	{#if children}
		<div
			role="tabpanel"
			id={`${id}-${value}-panel`}
			aria-labelledby={`${id}-${value}-tab`}
			tabindex="0"
			class="pt-3 text-xs text-muted"
		>
			{@render children()}
		</div>
	{/if}
</div>
