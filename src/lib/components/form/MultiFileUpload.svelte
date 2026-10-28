<script lang="ts">
	import Icon from './Icon.svelte';
	import { errorClass, hintClass, labelClass } from './formStyles';
	import { fileSizeError, fileTypeError, formatFileSize, isImageFile } from '#lib/utils/fileUpload';

	let {
		label = 'Files',
		files = $bindable<File[]>([]),
		accept = 'image/*',
		maxSizeMb = 5,
		maxFiles = 6,
		hint,
		disabled = false
	}: {
		label?: string;
		files?: File[];
		accept?: string;
		maxSizeMb?: number;
		maxFiles?: number;
		hint?: string;
		disabled?: boolean;
	} = $props();

	const id = $props.id();
	let error = $state('');
	let previews = $state<{ file: File; url: string }[]>([]);

	$effect(() => {
		const current = files;
		const urls = current.map((file) => URL.createObjectURL(file));
		previews = current.map((file, index) => ({ file, url: urls[index] }));

		return () => urls.forEach((url) => URL.revokeObjectURL(url));
	});

	function pick(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		if (!input.files?.length) return;

		const incoming = Array.from(input.files);
		const room = maxFiles - files.length;
		if (room <= 0) {
			error = `You can upload up to ${maxFiles} files`;
			input.value = '';
			return;
		}

		const accepted: File[] = [];
		const rejected: string[] = [];
		const imagesOnly = accept.split(',').every((type) => type.trim().startsWith('image/'));
		for (const item of incoming.slice(0, room)) {
			const typeMessage =
				imagesOnly && !isImageFile(item) ? 'only images are allowed' : fileTypeError(item);
			const message = typeMessage ?? fileSizeError(item, maxSizeMb);
			if (message) {
				rejected.push(`${item.name.slice(0, 40)}: ${message}`);
				continue;
			}
			accepted.push(item);
		}
		error = [
			rejected.join('; '),
			incoming.length > room ? `Only ${maxFiles} files allowed` : ''
		]
			.filter(Boolean)
			.join('; ');

		if (accepted.length) files = [...files, ...accepted];
		input.value = '';
	}

	function remove(target: File) {
		files = files.filter((file) => file !== target);
		if (files.length < maxFiles) error = '';
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
		<input {id} type="file" multiple {accept} {disabled} class="sr-only" onchange={pick} />
		<Icon name="upload" class="h-5 w-5 text-primary" />
		<span class="text-sm font-medium text-ink">Click to choose files</span>
		<span class="text-xs text-muted">
			{files.length}/{maxFiles} selected · {accept} up to {maxSizeMb} MB each
		</span>
	</label>

	{#if previews.length}
		<ul class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
			{#each previews as preview (preview.url)}
				<li class="overflow-hidden rounded-md border border-line bg-white">
					<img src={preview.url} alt={preview.file.name} class="h-24 w-full object-cover" />
					<div class="flex items-center gap-1 px-2 py-1.5">
						<span class="min-w-0 flex-1 truncate text-[11px] text-ink" title={preview.file.name}>
							{preview.file.name}
						</span>
						<button
							type="button"
							class="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-muted hover:bg-cream hover:text-danger"
							aria-label={`Remove ${preview.file.name}`}
							{disabled}
							onclick={() => remove(preview.file)}
						>
							<Icon name="x" class="h-3 w-3" />
						</button>
					</div>
					<span class="block px-2 pb-1.5 text-[10px] text-muted">
						{formatFileSize(preview.file.size)}
					</span>
				</li>
			{/each}
		</ul>
	{/if}

	{#if error}
		<p role="alert" class={errorClass}>{error}</p>
	{:else if hint}
		<p class={hintClass}>{hint}</p>
	{/if}
</div>
