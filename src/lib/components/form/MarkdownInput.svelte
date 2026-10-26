<script lang="ts">
	import { tick } from 'svelte';
	import { errorClass, hintClass, labelClass } from './formStyles';
	import { editorShellClass, toolbarButtonClass, toolbarClass } from './editorStyles';
	import {
		applyMarkdownFormat,
		renderMarkdown,
		type MarkdownFormat
	} from '#lib/utils/markdown';

	let {
		label,
		value = $bindable(''),
		placeholder = 'Write Markdown…',
		hint,
		error,
		rows = 6,
		disabled = false,
		name
	}: {
		label: string;
		value?: string;
		placeholder?: string;
		hint?: string;
		error?: string;
		rows?: number;
		disabled?: boolean;
		name?: string;
	} = $props();

	const id = $props.id();
	let textarea = $state<HTMLTextAreaElement>();
	let preview = $state(false);

	const tools: { format: MarkdownFormat; label: string; icon: string }[] = [
		{ format: 'bold', label: 'Bold', icon: 'B' },
		{ format: 'italic', label: 'Italic', icon: 'I' },
		{ format: 'code', label: 'Code', icon: '</>' },
		{ format: 'link', label: 'Link', icon: 'Link' },
		{ format: 'heading', label: 'Heading', icon: 'H2' },
		{ format: 'bullet', label: 'Bullet list', icon: '• List' },
		{ format: 'quote', label: 'Quote', icon: 'Quote' }
	];

	async function format(kind: MarkdownFormat) {
		if (disabled) return;
		preview = false;
		await tick();
		if (!textarea) return;

		const edit = applyMarkdownFormat(
			value,
			textarea.selectionStart,
			textarea.selectionEnd,
			kind
		);
		value = edit.text;
		await tick();
		textarea.focus();
		textarea.setSelectionRange(edit.selectionStart, edit.selectionEnd);
	}
</script>

<div>
	<label for={id} class={labelClass}>{label}</label>
	<div class="{editorShellClass} {error ? 'border-danger' : 'border-line-strong'}">
		<div class="flex items-center justify-between border-b border-line px-2 py-1.5">
			<div class="flex gap-1" role="tablist" aria-label="Markdown mode">
				<button
					type="button"
					role="tab"
					aria-selected={!preview}
					class="rounded-md px-2 py-1 text-xs font-semibold {preview
						? 'text-muted hover:bg-cream'
						: 'bg-primary-soft text-primary'}"
					onclick={() => (preview = false)}
				>
					Write
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={preview}
					class="rounded-md px-2 py-1 text-xs font-semibold {preview
						? 'bg-primary-soft text-primary'
						: 'text-muted hover:bg-cream'}"
					onclick={() => (preview = true)}
				>
					Preview
				</button>
			</div>
			<span class="text-[10px] font-semibold uppercase tracking-wide text-muted">Markdown</span>
		</div>

		{#if preview}
			<div
				class="preview min-h-32 px-3 py-2.5 text-sm leading-relaxed text-ink"
				aria-live="polite"
			>
				{#if value.trim()}
					{@html renderMarkdown(value)}
				{:else}
					<p class="text-sm text-muted">Nothing to preview.</p>
				{/if}
			</div>
		{:else}
			<div class="{toolbarClass} border-b border-line" role="toolbar" aria-label="Markdown formatting">
				{#each tools as tool (tool.format)}
					<button
						type="button"
						class={toolbarButtonClass}
						aria-label={tool.label}
						title={tool.label}
						disabled={disabled}
						onmousedown={(event) => event.preventDefault()}
						onclick={() => format(tool.format)}
					>
						{tool.icon}
					</button>
				{/each}
			</div>
			<textarea
				bind:this={textarea}
				{id}
				{name}
				{rows}
				{placeholder}
				{disabled}
				bind:value
				class="min-h-32 w-full resize-y border-0 bg-transparent px-3 py-2.5 font-mono text-xs leading-relaxed text-ink placeholder:text-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
				aria-invalid={error ? 'true' : undefined}
				aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
			></textarea>
		{/if}
	</div>

	{#if error}
		<p id={`${id}-error`} role="alert" class={errorClass}>{error}</p>
	{:else if hint}
		<p id={`${id}-hint`} class={hintClass}>{hint}</p>
	{/if}
</div>

<style>
	.preview :global(p) {
		margin: 0 0 0.5rem;
	}

	.preview :global(h1),
	.preview :global(h2),
	.preview :global(h3),
	.preview :global(h4),
	.preview :global(h5),
	.preview :global(h6) {
		margin: 0 0 0.5rem;
		font-weight: 600;
		color: var(--color-ink);
	}

	.preview :global(h1) {
		font-size: 1.25rem;
	}

	.preview :global(h2) {
		font-size: 1.1rem;
	}

	.preview :global(ul) {
		margin: 0 0 0.5rem;
		padding-left: 1.25rem;
		list-style: disc;
	}

	.preview :global(ol) {
		margin: 0 0 0.5rem;
		padding-left: 1.25rem;
		list-style: decimal;
	}

	.preview :global(a) {
		color: var(--color-primary);
		text-decoration: underline;
	}

	.preview :global(code) {
		border-radius: 0.25rem;
		background: var(--color-cream);
		padding: 0.1rem 0.3rem;
		font-family: ui-monospace, monospace;
		font-size: 0.8rem;
	}

	.preview :global(pre) {
		margin: 0 0 0.5rem;
		overflow-x: auto;
		border-radius: 0.375rem;
		background: var(--color-cream);
		padding: 0.5rem 0.75rem;
	}

	.preview :global(pre code) {
		background: transparent;
		padding: 0;
	}

	.preview :global(blockquote) {
		margin: 0 0 0.5rem;
		border-left: 3px solid var(--color-line-strong);
		padding-left: 0.75rem;
		color: var(--color-muted);
	}
</style>
