<script lang="ts">
	let {
		label,
		checked = $bindable(false),
		disabled = false
	}: { label: string; checked?: boolean; disabled?: boolean } = $props();
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	{disabled}
	onclick={() => (checked = !checked)}
	class="flex items-center gap-2 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-60"
>
	<span
		class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors {checked
			? 'border-primary bg-primary'
			: 'border-line-strong bg-white'}"
		aria-hidden="true"
	>
		<span
			class="absolute left-0.5 h-3.5 w-3.5 rounded-full transition-transform {checked
				? 'translate-x-4 bg-white'
				: 'bg-muted'}"
		></span>
	</span>
	{label}
</button>
