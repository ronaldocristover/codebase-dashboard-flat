<script lang="ts">
	import { hintClass, inputClass, labelClass } from './formStyles';

	let {
		label,
		value = $bindable('#014baa'),
		hint,
		disabled = false
	}: {
		label: string;
		value?: string;
		hint?: string;
		disabled?: boolean;
	} = $props();

	const id = $props.id();
</script>

<div>
	<label for={id} class={labelClass}>{label}</label>
	<div class="flex items-center gap-2">
		<input
			{id}
			type="color"
			bind:value
			{disabled}
			class="h-10 w-14 cursor-pointer rounded-md border border-line-strong bg-white p-1 disabled:cursor-not-allowed"
		/>
		<input
			type="text"
			bind:value
			{disabled}
			class="{inputClass} max-w-36 font-mono uppercase"
			aria-label={`${label} hex value`}
		/>
	</div>
	{#if hint}<p class={hintClass}>{hint}</p>{/if}
</div>
