<script lang="ts">
	import { hintClass, labelClass } from './formStyles';

	let {
		label = 'Rating',
		value = $bindable(0),
		max = 5,
		hint,
		disabled = false
	}: {
		label?: string;
		value?: number;
		max?: number;
		hint?: string;
		disabled?: boolean;
	} = $props();

	const stars = $derived(Array.from({ length: max }, (_, index) => index + 1));

	function set(next: number) {
		if (!disabled) value = next;
	}

	function onKeydown(event: KeyboardEvent) {
		if (disabled) return;
		if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
			event.preventDefault();
			set(Math.min(max, value + 1));
		} else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
			event.preventDefault();
			set(Math.max(0, value - 1));
		}
	}
</script>

<div>
	<span class={labelClass}>{label}</span>
	<div role="radiogroup" aria-label={label} tabindex="-1" class="flex items-center gap-1" onkeydown={onKeydown}>
		{#each stars as star (star)}
			<button
				type="button"
				role="radio"
				aria-checked={value === star}
				aria-label="{star} {star === 1 ? 'star' : 'stars'}"
				tabindex={value === star || (value === 0 && star === 1) ? 0 : -1}
				{disabled}
				onclick={() => set(star)}
				class="cursor-pointer rounded p-0.5 text-primary disabled:cursor-not-allowed disabled:opacity-60"
			>
				<svg
					viewBox="0 0 24 24"
					class="h-5 w-5"
					fill={star <= value ? 'currentColor' : 'none'}
					stroke="currentColor"
					stroke-width="2"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z" />
				</svg>
			</button>
		{/each}
		<span class="ml-1 text-xs text-muted">{value}/{max}</span>
	</div>
	{#if hint}<p class={hintClass}>{hint}</p>{/if}
</div>
