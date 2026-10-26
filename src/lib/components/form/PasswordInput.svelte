<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Icon from './Icon.svelte';
	import { errorClass, hintClass, inputClass, labelClass } from './formStyles';

	let {
		label,
		value = $bindable(''),
		placeholder,
		hint,
		error,
		required = false,
		disabled = false,
		name,
		autocomplete = 'current-password'
	}: {
		label: string;
		value?: string;
		placeholder?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		name?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
	} = $props();

	const id = $props.id();
	let visible = $state(false);
</script>

<div>
	<label for={id} class={labelClass}>
		{label}{#if required}<span class="text-danger"> *</span>{/if}
	</label>
	<div class="relative">
		<input
			{id}
			{name}
			{placeholder}
			{autocomplete}
			{required}
			{disabled}
			type={visible ? 'text' : 'password'}
			bind:value
			class="{inputClass} pr-11"
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
		/>
		<button
			type="button"
			class="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-cream hover:text-ink focus:outline-2 focus:outline-primary disabled:cursor-not-allowed"
			aria-label={visible ? 'Hide password' : 'Show password'}
			aria-pressed={visible}
			{disabled}
			onclick={() => (visible = !visible)}
		>
			<Icon name={visible ? 'eye-off' : 'eye'} />
		</button>
	</div>
	{#if error}
		<p id={`${id}-error`} role="alert" class={errorClass}>{error}</p>
	{:else if hint}
		<p id={`${id}-hint`} class={hintClass}>{hint}</p>
	{/if}
</div>
