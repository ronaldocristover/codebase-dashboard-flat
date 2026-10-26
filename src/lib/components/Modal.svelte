<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open,
		title,
		onClose,
		children
	}: {
		open: boolean;
		title: string;
		onClose: () => void;
		children: Snippet;
	} = $props();

	const titleId = $derived(`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-title`);

	let dialog = $state<HTMLDivElement | null>(null);

	function attachDialog(node: HTMLDivElement) {
		dialog = node;
		return () => {
			if (dialog === node) dialog = null;
		};
	}

	$effect(() => {
		if (!open) return;

		const previous = document.activeElement as HTMLElement | null;
		const overflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		dialog?.focus();

		function onKeydown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				event.preventDefault();
				onClose();
				return;
			}
			if (event.key !== 'Tab' || !dialog) return;

			const focusable = Array.from(
				dialog.querySelectorAll<HTMLElement>(
					'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
				)
			);
			if (focusable.length === 0) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (document.activeElement === dialog) {
				event.preventDefault();
				(event.shiftKey ? last : first).focus();
			} else if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}

		document.addEventListener('keydown', onKeydown);
		return () => {
			document.removeEventListener('keydown', onKeydown);
			document.body.style.overflow = overflow;
			previous?.focus();
		};
	});
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
		<button
			type="button"
			class="absolute inset-0 bg-ink/40"
			aria-label="Close dialog"
			onclick={onClose}
		></button>

		<div
			{@attach attachDialog}
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			tabindex="-1"
			class="relative w-full max-w-md rounded-lg border border-line bg-white"
		>
			<div class="flex items-center justify-between border-b border-line px-5 py-3">
				<h2 id={titleId} class="text-sm font-semibold text-ink">{title}</h2>
				<button
					type="button"
					class="rounded-md px-2 py-1 text-xs text-muted hover:bg-cream hover:text-ink"
					aria-label="Close dialog"
					onclick={onClose}
				>
					✕
				</button>
			</div>

			<div class="p-5">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
