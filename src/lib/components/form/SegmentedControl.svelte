<script lang="ts">
	import { labelClass } from './formStyles';

	let {
		label,
		options,
		value = $bindable(''),
		name,
		disabled = false
	}: {
		label?: string;
		options: { value: string; label: string }[];
		value?: string;
		name?: string;
		disabled?: boolean;
	} = $props();

	const id = $props.id();
</script>

<div>
	{#if label}
		<span id={`${id}-label`} class={labelClass}>{label}</span>
	{/if}
	<div
		role="radiogroup"
		aria-labelledby={label ? `${id}-label` : undefined}
		class="inline-flex rounded-md border border-line-strong bg-white p-1"
	>
		{#each options as option (option.value)}
			<label class="cursor-pointer">
				<input
					type="radio"
					{name}
					value={option.value}
					checked={value === option.value}
					{disabled}
					onchange={() => (value = option.value)}
					class="peer sr-only"
				/>
				<span
					class="block rounded px-3 py-1 text-xs font-medium text-ink peer-checked:bg-primary peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
				>
					{option.label}
				</span>
			</label>
		{/each}
	</div>
</div>
