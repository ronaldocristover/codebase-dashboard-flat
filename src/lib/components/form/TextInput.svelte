<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { errorClass, hintClass, inputClass, labelClass } from './formStyles';

	type Props = {
		label: string;
		value?: string;
		type?: 'text' | 'email' | 'tel' | 'url' | 'search';
		placeholder?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		name?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
	};

	let {
		value = $bindable(''),
		label,
		type = 'text',
		placeholder,
		hint,
		error,
		required = false,
		disabled = false,
		name,
		autocomplete
	}: Props = $props();

	const id = $props.id();
</script>

<div>
	<label for={id} class={labelClass}>
		{label}{#if required}<span class="text-danger"> *</span>{/if}
	</label>
	<input
		{id}
		{type}
		{name}
		{placeholder}
		{autocomplete}
		{required}
		{disabled}
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
