<script lang="ts">
	import { errorClass, hintClass, inputClass, labelClass } from './formStyles';

	type Props = {
		label: string;
		options: { value: string; label: string }[];
		value?: string;
		placeholder?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		name?: string;
	};

	let {
		label,
		options,
		value = $bindable(''),
		placeholder,
		hint,
		error,
		required = false,
		disabled = false,
		name
	}: Props = $props();

	const id = $props.id();
</script>

<div>
	<label for={id} class={labelClass}>
		{label}{#if required}<span class="text-danger"> *</span>{/if}
	</label>
	<select
		{id}
		{name}
		{required}
		{disabled}
		bind:value
		class={inputClass}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
	>
		{#if placeholder}<option value="" disabled>{placeholder}</option>{/if}
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
	{#if error}
		<p id={`${id}-error`} role="alert" class={errorClass}>{error}</p>
	{:else if hint}
		<p id={`${id}-hint`} class={hintClass}>{hint}</p>
	{/if}
</div>
