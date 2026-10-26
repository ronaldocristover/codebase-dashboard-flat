<script lang="ts">
	import { hintClass, labelClass } from './formStyles';

	let {
		label,
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		suffix = '',
		hint,
		disabled = false
	}: {
		label: string;
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		suffix?: string;
		hint?: string;
		disabled?: boolean;
	} = $props();

	const id = $props.id();
</script>

<div>
	<div class="flex items-center justify-between gap-2">
		<label for={id} class="{labelClass} mb-1.5">{label}</label>
		<output for={id} class="text-xs font-medium text-ink">{value}{suffix}</output>
	</div>
	<input
		{id}
		type="range"
		{min}
		{max}
		{step}
		{disabled}
		bind:value
		class="w-full cursor-pointer accent-primary disabled:cursor-not-allowed"
	/>
	{#if hint}<p class={hintClass}>{hint}</p>{/if}
</div>
