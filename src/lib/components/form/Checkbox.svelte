<script lang="ts">
	import Icon from './Icon.svelte';
	import { hintClass } from './formStyles';

	let {
		label,
		checked = $bindable(false),
		hint,
		disabled = false
	}: {
		label: string;
		checked?: boolean;
		hint?: string;
		disabled?: boolean;
	} = $props();
</script>

<div>
	<label
		class="flex cursor-pointer items-start gap-2 text-sm text-ink {disabled
			? 'cursor-not-allowed opacity-60'
			: ''}"
	>
		<input type="checkbox" bind:checked {disabled} class="peer sr-only" />
		<span
			class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-line-strong bg-white peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
			aria-hidden="true"
		>
			{#if checked}<Icon name="check" class="h-3 w-3 text-white" />{/if}
		</span>
		<span>{label}</span>
	</label>
	{#if hint}<p class="{hintClass} ml-6">{hint}</p>{/if}
</div>
