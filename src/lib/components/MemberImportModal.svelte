<script lang="ts">
	import Modal from './Modal.svelte';
	import {
		downloadTemplate,
		readMemberFile,
		type ImportError,
		type ParsedImport
	} from '#lib/utils/memberExcel';

	let {
		open,
		onClose,
		onImported
	}: {
		open: boolean;
		onClose: () => void;
		onImported: (count: number) => void | Promise<void>;
	} = $props();

	let phase = $state<'idle' | 'preview' | 'done'>('idle');
	let fileName = $state('');
	let parsed = $state<ParsedImport | null>(null);
	let imported = $state(0);
	let importErrors = $state<ImportError[]>([]);
	let readError = $state('');
	let templateError = $state('');
	let reading = $state(false);
	let importing = $state(false);

	function reset() {
		phase = 'idle';
		fileName = '';
		parsed = null;
		imported = 0;
		importErrors = [];
		readError = '';
		templateError = '';
		reading = false;
		importing = false;
	}

	function close() {
		reset();
		onClose();
	}

	async function onFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		input.value = '';

		phase = 'idle';
		parsed = null;
		readError = '';
		fileName = file.name;

		if (!/\.xlsx$/i.test(file.name)) {
			readError = 'Choose an Excel workbook (.xlsx).';
			return;
		}

		reading = true;
		try {
			parsed = await readMemberFile(file);
			phase = 'preview';
		} catch {
			readError = 'Could not read this file. Check that it is a valid .xlsx workbook.';
		} finally {
			reading = false;
		}
	}

	async function getTemplate() {
		templateError = '';
		try {
			await downloadTemplate();
		} catch {
			templateError = 'Could not create the template. Please try again.';
		}
	}

	async function runImport() {
		if (!parsed || parsed.rows.length === 0) return;

		importing = true;
		importErrors = [];
		let count = 0;

		// shortcut: one POST per row, add a bulk endpoint when imports grow large.
		for (const { row, input } of parsed.rows) {
			const res = await fetch('/api/members', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(input)
			});
			if (res.ok) {
				count += 1;
				continue;
			}
			const body = (await res.json().catch(() => ({}))) as { errors?: Record<string, string> };
			importErrors.push({
				row,
				message: body.errors ? Object.values(body.errors).join(' · ') : 'Could not import this row'
			});
		}

		imported = count;
		importing = false;
		phase = 'done';
		await onImported(count);
	}
</script>

{#snippet errorList(errors: ImportError[])}
	<ul class="mt-2 max-h-32 space-y-1 overflow-y-auto rounded-md border border-line bg-cream px-3 py-2">
		{#each errors as item (item.row)}
			<li class="text-[11px] text-danger">Row {item.row}: {item.message}</li>
		{/each}
	</ul>
{/snippet}

<Modal {open} title="Import members" onClose={close}>
	{#if phase === 'done'}
		<p class="text-sm text-ink">
			Imported {imported}
			{imported === 1 ? 'row' : 'rows'}{parsed && parsed.rows.length !== imported
				? ` of ${parsed.rows.length} valid rows`
				: ''}.
		</p>
		{#if importErrors.length > 0}
			<p class="mt-2 text-[11px] text-muted">These rows could not be saved:</p>
			{@render errorList(importErrors)}
		{/if}

		<div class="mt-5 flex justify-end border-t border-line pt-4">
			<button
				type="button"
				class="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
				onclick={close}
			>
				Done
			</button>
		</div>
	{:else}
		<p class="text-xs text-muted">
			Upload an Excel workbook (.xlsx) with Name, Email, Phone, and Status columns. Imported members start
			with no orders and zero spend.
		</p>

		<button
			type="button"
			class="mt-3 text-xs font-medium text-primary underline-offset-2 hover:underline"
			onclick={getTemplate}
		>
			Download import template
		</button>
		{#if templateError}
			<p role="alert" class="mt-1 text-[11px] text-danger">{templateError}</p>
		{/if}

		<label
			class="mt-4 flex cursor-pointer flex-col items-center gap-1 rounded-md border border-dashed border-line-strong px-4 py-6 text-center hover:bg-cream"
		>
			<span class="text-xs font-medium text-ink">
				{reading ? 'Reading file…' : 'Choose an Excel file'}
			</span>
			<span class="text-[11px] text-muted">.xlsx only</span>
			<input type="file" accept=".xlsx" class="sr-only" onchange={onFile} />
		</label>

		{#if fileName}
			<p class="mt-2 text-[11px] text-muted">{fileName}</p>
		{/if}

		{#if readError}
			<p role="alert" class="mt-2 rounded-md border border-danger px-3 py-2 text-xs text-danger">
				{readError}
			</p>
		{/if}

		{#if parsed}
			<p class="mt-3 text-xs font-medium text-ink">
				{parsed.rows.length}
				{parsed.rows.length === 1 ? 'row is' : 'rows are'} ready to import.
			</p>
			{#if parsed.errors.length > 0}
				<p class="mt-1 text-[11px] text-muted">
					{parsed.errors.length}
					{parsed.errors.length === 1 ? 'row will be skipped:' : 'rows will be skipped:'}
				</p>
				{@render errorList(parsed.errors)}
			{/if}
		{/if}

		<div class="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
			<button
				type="button"
				class="rounded-md border border-line-strong px-4 py-2.5 text-sm font-medium text-ink hover:bg-cream"
				onclick={close}
			>
				Cancel
			</button>
			<button
				type="button"
				disabled={importing || !parsed || parsed.rows.length === 0}
				class="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
				onclick={runImport}
			>
				{importing
					? 'Importing…'
					: `Import ${parsed?.rows.length ?? 0} ${parsed?.rows.length === 1 ? 'member' : 'members'}`}
			</button>
		</div>
	{/if}
</Modal>
