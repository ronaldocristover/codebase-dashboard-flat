<script lang="ts">
	import Icon from './Icon.svelte';
	import { hintClass, labelClass } from './formStyles';

	let {
		label,
		value = $bindable(0),
		min = 0,
		max = 99,
		step = 1,
		disabled = false,
		hint
	}: {
		label?: string;
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
		hint?: string;
	} = $props();

	const id = $props.id();

	function clamp(next: number): number {
		return Math.min(max, Math.max(min, next));
	}

	function set(next: number) {
		value = clamp(next);
	}
</script>

<div>
	{#if label}
		<label for={id} class={labelClass}>{label}</label>
	{/if}
	<div class="inline-flex items-stretch overflow-hidden rounded-md border border-line-strong bg-white">
		<button
			type="button"
			class="flex w-9 items-center justify-center text-ink hover:bg-cream disabled:cursor-not-allowed disabled:text-muted"
			aria-label="Decrease value"
			onclick={() => set(value - step)}
			disabled={disabled || value <= min}
		>
			<Icon name="minus" />
		</button>
		<input
			{id}
			type="number"
			bind:value
			{min}
			{max}
			{step}
			{disabled}
			onchange={() => set(Number(value))}
			class="w-20 border-x border-line-strong bg-white px-2 py-2.5 text-center text-sm text-ink focus:outline-none"
		/>
		<button
			type="button"
			class="flex w-9 items-center justify-center text-ink hover:bg-cream disabled:cursor-not-allowed disabled:text-muted"
			aria-label="Increase value"
			onclick={() => set(value + step)}
			disabled={disabled || value >= max}
		>
			<Icon name="plus" />
		</button>
	</div>
	{#if hint}<p class={hintClass}>{hint}</p>{/if}
</div>
