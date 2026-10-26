<script lang="ts">
	import DateInput from './DateInput.svelte';
	import { hintClass } from './formStyles';
	import { isDateRangeValid } from '#lib/utils/dateSelection';

	let {
		start = $bindable(''),
		end = $bindable(''),
		hint,
		disabled = false
	}: { start?: string; end?: string; hint?: string; disabled?: boolean } = $props();

	const error = $derived(
		isDateRangeValid(start, end) ? '' : 'End date must be on or after start date'
	);
</script>

<div class="grid gap-3 sm:grid-cols-2">
	<DateInput label="Start date" bind:value={start} {disabled} />
	<DateInput
		label="End date"
		bind:value={end}
		min={start || undefined}
		{disabled}
		error={error || undefined}
	/>
</div>
{#if hint}<p class={hintClass}>{hint}</p>{/if}
