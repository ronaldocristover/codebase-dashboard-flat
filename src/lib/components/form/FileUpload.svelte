<script lang="ts">
	import Icon from './Icon.svelte';
	import { errorClass, hintClass, labelClass } from './formStyles';
	import { fileSizeError, fileTypeError, formatFileSize } from '#lib/utils/fileUpload';

	let {
		label = 'File',
		file = $bindable<File | null>(null),
		accept,
		maxSizeMb = 5,
		hint,
		disabled = false
	}: {
		label?: string;
		file?: File | null;
		accept?: string;
		maxSizeMb?: number;
		hint?: string;
		disabled?: boolean;
	} = $props();

	const id = $props.id();
	let error = $state('');

	function pick(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const picked = input.files?.[0];
		if (!picked) return;

		const message = fileSizeError(picked, maxSizeMb) ?? fileTypeError(picked);
		if (message) {
			error = message;
			input.value = '';
			return;
		}
		error = '';
		file = picked;
	}

	function clear() {
		file = null;
		error = '';
	}
</script>

<div>
	<span class={labelClass}>{label}</span>
	<label
		for={id}
		class="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line-strong bg-white px-4 py-5 text-center hover:bg-cream focus-within:outline-2 focus-within:outline-primary {disabled
			? 'cursor-not-allowed opacity-60'
			: ''}"
	>
		<input
			{id}
			type="file"
			{accept}
			{disabled}
			class="sr-only"
			onchange={pick}
		/>
		<Icon name="upload" class="h-5 w-5 text-primary" />
		<span class="text-sm font-medium text-ink">
			{file ? file.name : 'Click to choose a file'}
		</span>
		<span class="text-xs text-muted">
			{file ? formatFileSize(file.size) : `${accept ?? 'Any file'} up to ${maxSizeMb} MB`}
		</span>
	</label>

	{#if file}
		<button
			type="button"
			class="mt-2 inline-flex items-center gap-1 text-xs font-medium text-danger hover:underline"
			onclick={clear}
			{disabled}
		>
			<Icon name="x" class="h-3 w-3" /> Remove file
		</button>
	{/if}

	{#if error}
		<p role="alert" class={errorClass}>{error}</p>
	{:else if hint}
		<p class={hintClass}>{hint}</p>
	{/if}
</div>
