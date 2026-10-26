<script lang="ts">
	import { errorClass, hintClass, inputClass, labelClass } from './formStyles';

	let {
		value = $bindable(''),
		label,
		rows = 3,
		placeholder,
		hint,
		error,
		required = false,
		disabled = false,
		name
	}: {
		label: string;
		value?: string;
		rows?: number;
		placeholder?: string;
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
	<textarea
		{id}
		{name}
		{rows}
		{placeholder}
		{required}
		{disabled}
		bind:value
		class="{inputClass} resize-y"
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
	></textarea>
	{#if error}
		<p id={`${id}-error`} role="alert" class={errorClass}>{error}</p>
	{:else if hint}
		<p id={`${id}-hint`} class={hintClass}>{hint}</p>
	{/if}
</div>
