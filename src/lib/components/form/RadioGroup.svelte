<script lang="ts">
	import { errorClass, hintClass } from './formStyles';

	let {
		label,
		options,
		value = $bindable(''),
		name,
		hint,
		error,
		disabled = false
	}: {
		label: string;
		options: { value: string; label: string }[];
		value?: string;
		name?: string;
		hint?: string;
		error?: string;
		disabled?: boolean;
	} = $props();

	const id = $props.id();
</script>

<fieldset aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}>
	<legend class="mb-1.5 text-xs font-medium text-ink">{label}</legend>
	<div class="flex flex-wrap gap-x-4 gap-y-2">
		{#each options as option (option.value)}
			<label class="flex items-center gap-1.5 text-sm text-ink">
				<input
					type="radio"
					{name}
					value={option.value}
					checked={value === option.value}
					{disabled}
					onchange={() => (value = option.value)}
					class="h-4 w-4 accent-primary"
				/>
				{option.label}
			</label>
		{/each}
	</div>
	{#if error}
		<p id={`${id}-error`} role="alert" class={errorClass}>{error}</p>
	{:else if hint}
		<p id={`${id}-hint`} class={hintClass}>{hint}</p>
	{/if}
</fieldset>
