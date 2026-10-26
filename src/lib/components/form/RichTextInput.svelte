<script lang="ts">
	import { errorClass, hintClass, labelClass } from './formStyles';
	import { editorShellClass, toolbarButtonClass, toolbarClass } from './editorStyles';

	let {
		label,
		value = $bindable(''),
		placeholder = 'Write something…',
		hint,
		error,
		disabled = false,
		name
	}: {
		label: string;
		value?: string;
		placeholder?: string;
		hint?: string;
		error?: string;
		disabled?: boolean;
		name?: string;
	} = $props();

	const id = $props.id();
	const labelId = `${id}-label`;
	let editor: HTMLDivElement;

	// shortcut: trusts authored HTML; sanitize on the server before rendering untrusted content.
	function normalize(html: string): string {
		const probe = document.createElement('div');
		probe.innerHTML = html;
		return probe.textContent?.trim() ? html : '';
	}

	function run(command: string, argument?: string) {
		if (disabled) return;
		editor.focus();
		document.execCommand(command, false, argument);
		value = normalize(editor.innerHTML);
	}

	function addLink() {
		const url = window.prompt('Link URL', 'https://');
		if (url) run('createLink', url);
	}
</script>

<div>
	<span id={labelId} class={labelClass}>{label}</span>
	<div class="{editorShellClass} {error ? 'border-danger' : 'border-line-strong'}">
		<div class="{toolbarClass} border-b border-line" role="toolbar" aria-label="Text formatting">
			<button
				type="button"
				class={toolbarButtonClass}
				aria-label="Bold"
				title="Bold"
				disabled={disabled}
				onmousedown={(event) => event.preventDefault()}
				onclick={() => run('bold')}
			>
				<strong>B</strong>
			</button>
			<button
				type="button"
				class={toolbarButtonClass}
				aria-label="Italic"
				title="Italic"
				disabled={disabled}
				onmousedown={(event) => event.preventDefault()}
				onclick={() => run('italic')}
			>
				<em>I</em>
			</button>
			<button
				type="button"
				class={toolbarButtonClass}
				aria-label="Underline"
				title="Underline"
				disabled={disabled}
				onmousedown={(event) => event.preventDefault()}
				onclick={() => run('underline')}
			>
				<span class="underline">U</span>
			</button>
			<button
				type="button"
				class={toolbarButtonClass}
				aria-label="Bullet list"
				title="Bullet list"
				disabled={disabled}
				onmousedown={(event) => event.preventDefault()}
				onclick={() => run('insertUnorderedList')}
			>
				• List
			</button>
			<button
				type="button"
				class={toolbarButtonClass}
				aria-label="Numbered list"
				title="Numbered list"
				disabled={disabled}
				onmousedown={(event) => event.preventDefault()}
				onclick={() => run('insertOrderedList')}
			>
				1. List
			</button>
			<button
				type="button"
				class={toolbarButtonClass}
				aria-label="Link"
				title="Link"
				disabled={disabled}
				onmousedown={(event) => event.preventDefault()}
				onclick={addLink}
			>
				Link
			</button>
		</div>

		<div class="relative">
			{#if !value}
				<span class="pointer-events-none absolute left-3 top-2.5 text-sm text-muted">
					{placeholder}
				</span>
			{/if}
			<div
				bind:this={editor}
				role="textbox"
				aria-multiline="true"
				aria-labelledby={labelId}
				aria-invalid={error ? 'true' : undefined}
				aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
				aria-disabled={disabled}
				contenteditable="true"
				inert={disabled}
				bind:innerHTML={
					() => value,
					(html) => (value = normalize(html))
				}
				class="editor min-h-32 px-3 py-2.5 text-sm leading-relaxed text-ink focus:outline-none {disabled
					? 'cursor-not-allowed opacity-60'
					: ''}"
			></div>
		</div>
	</div>

	{#if name}<input type="hidden" {name} {value} />{/if}

	{#if error}
		<p id={`${id}-error`} role="alert" class={errorClass}>{error}</p>
	{:else if hint}
		<p id={`${id}-hint`} class={hintClass}>{hint}</p>
	{/if}
</div>

<style>
	.editor :global(p) {
		margin: 0 0 0.5rem;
	}

	.editor :global(ul) {
		margin: 0 0 0.5rem;
		padding-left: 1.25rem;
		list-style: disc;
	}

	.editor :global(ol) {
		margin: 0 0 0.5rem;
		padding-left: 1.25rem;
		list-style: decimal;
	}

	.editor :global(a) {
		color: var(--color-primary);
		text-decoration: underline;
	}

	.editor :global(blockquote) {
		margin: 0 0 0.5rem;
		border-left: 3px solid var(--color-line-strong);
		padding-left: 0.75rem;
		color: var(--color-muted);
	}
</style>
