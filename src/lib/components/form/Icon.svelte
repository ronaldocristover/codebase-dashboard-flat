<script lang="ts">
	export type IconName =
		| 'eye'
		| 'eye-off'
		| 'calendar'
		| 'clock'
		| 'upload'
		| 'x'
		| 'check'
		| 'chevron-down'
		| 'chevron-left'
		| 'chevron-right'
		| 'plus'
		| 'minus'
		| 'file';

	let { name, class: className = 'h-4 w-4' }: { name: IconName; class?: string } = $props();
</script>

<svg
	viewBox="0 0 24 24"
	class={className}
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"
>
	{#if name === 'eye'}
		<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
		<circle cx="12" cy="12" r="3" />
	{:else if name === 'eye-off'}
		<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
		<circle cx="12" cy="12" r="3" />
		<path d="M3 3l18 18" />
	{:else if name === 'calendar'}
		<rect x="3" y="5" width="18" height="16" rx="2" />
		<path d="M8 3v4M16 3v4M3 10h18" />
	{:else if name === 'clock'}
		<circle cx="12" cy="12" r="9" />
		<path d="M12 7v5l3 2" />
	{:else if name === 'upload'}
		<path d="M12 16V4M7 9l5-5 5 5" />
		<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
	{:else if name === 'x'}
		<path d="M6 6l12 12M18 6L6 18" />
	{:else if name === 'check'}
		<path d="M4 12l5 5L20 6" />
	{:else if name === 'chevron-down'}
		<path d="M6 9l6 6 6-6" />
	{:else if name === 'chevron-left'}
		<path d="M15 6l-6 6 6 6" />
	{:else if name === 'chevron-right'}
		<path d="M9 6l6 6-6 6" />
	{:else if name === 'plus'}
		<path d="M12 5v14M5 12h14" />
	{:else if name === 'minus'}
		<path d="M5 12h14" />
	{:else}
		<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
		<path d="M14 3v6h6" />
	{/if}
</svg>
