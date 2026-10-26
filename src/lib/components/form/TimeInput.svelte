<script lang="ts">
	import { errorClass, hintClass, inputClass, labelClass } from './formStyles';

	let {
		label,
		value = $bindable(''),
		min,
		max,
		hint,
		error,
		required = false,
		disabled = false,
		name
	}: {
		label: string;
		value?: string;
		min?: string;
		max?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		name?: string;
	} = $props();

	const id = $props.id();
</script>

<div>
	<label for={id} class={labelClass}>
		{label}{#if required}<span class="text-danger"> *</span>{/if}
	</label>
	<input
		{id}
		{name}
		{min}
		{max}
		{required}
		{disabled}
		type="time"
		bind:value
		class={inputClass}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
	/>
	{#if error}
		<p id={`${id}-error`} role="alert" class={errorClass}>{error}</p>
	{:else if hint}
		<p id={`${id}-hint`} class={hintClass}>{hint}</p>
	{/if}
</div>
