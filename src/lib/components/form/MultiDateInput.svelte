<script lang="ts">
	import Icon from './Icon.svelte';
	import { hintClass, labelClass } from './formStyles';
	import { buildMonthGrid, monthLabel, toggleDate } from '#lib/utils/dateSelection';
	import { formatTanggal, isoDariTanggal } from '#lib/utils/format';

	let {
		label = 'Dates',
		dates = $bindable<string[]>([]),
		hint,
		max,
		disabled = false
	}: { label?: string; dates?: string[]; hint?: string; max?: number; disabled?: boolean } = $props();

	const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
	const today = isoDariTanggal(new Date());

	let view = $state({ year: new Date().getFullYear(), month: new Date().getMonth() });
	const cells = $derived(buildMonthGrid(view.year, view.month));
	const title = $derived(monthLabel(view.year, view.month));

	function shiftMonth(delta: number) {
		const next = new Date(view.year, view.month + delta, 1);
		view = { year: next.getFullYear(), month: next.getMonth() };
	}

	function toggle(iso: string) {
		if (disabled) return;
		if (max && !dates.includes(iso) && dates.length >= max) return;
		dates = toggleDate(dates, iso);
	}

	function remove(iso: string) {
		dates = dates.filter((date) => date !== iso);
	}
</script>

<div>
	<span class={labelClass}>{label}</span>
	<div class="w-full max-w-xs rounded-lg border border-line-strong bg-white p-3">
		<div class="mb-2 flex items-center justify-between">
			<button
				type="button"
				class="flex h-8 w-8 items-center justify-center rounded-md text-ink hover:bg-cream disabled:opacity-40"
				aria-label="Previous month"
				onclick={() => shiftMonth(-1)}
				{disabled}
			>
				<Icon name="chevron-left" />
			</button>
			<span class="text-sm font-semibold text-ink">{title}</span>
			<button
				type="button"
				class="flex h-8 w-8 items-center justify-center rounded-md text-ink hover:bg-cream disabled:opacity-40"
				aria-label="Next month"
				onclick={() => shiftMonth(1)}
				{disabled}
			>
				<Icon name="chevron-right" />
			</button>
		</div>

		<div class="grid grid-cols-7 gap-0.5 text-center">
			{#each WEEKDAYS as day (day)}
				<span class="py-1 text-[10px] font-medium uppercase text-muted">{day}</span>
			{/each}
			{#each cells as week, w (w)}
				{#each week as cell, i (i)}
					{#if cell}
						{@const selected = dates.includes(cell)}
						{@const full = Boolean(max && !selected && dates.length >= max)}
						<button
							type="button"
							class="h-8 rounded-md text-xs transition-colors {selected
								? 'bg-primary font-semibold text-white'
								: full
									? 'cursor-not-allowed text-muted/60'
									: 'text-ink hover:bg-cream'} {cell === today && !selected
								? 'outline outline-1 outline-primary'
								: ''}"
							aria-label={formatTanggal(cell)}
							aria-pressed={selected}
							disabled={disabled || full}
							onclick={() => toggle(cell)}
						>
							{Number(cell.slice(-2))}
						</button>
					{:else}
						<span></span>
					{/if}
				{/each}
			{/each}
		</div>
	</div>

	{#if dates.length}
		<ul class="mt-2 flex flex-wrap gap-1.5">
			{#each dates as iso (iso)}
				<li
					class="inline-flex items-center gap-1 rounded-md border border-line-strong bg-white py-1 pl-2 pr-1 text-xs text-ink"
				>
					{formatTanggal(iso)}
					<button
						type="button"
						class="flex h-5 w-5 items-center justify-center rounded-sm text-muted hover:bg-cream hover:text-danger"
						aria-label={`Remove ${formatTanggal(iso)}`}
						{disabled}
						onclick={() => remove(iso)}
					>
						<Icon name="x" class="h-3 w-3" />
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="mt-2 text-xs text-muted">No dates selected.</p>
	{/if}

	{#if hint}<p class={hintClass}>{hint}</p>{/if}
</div>
