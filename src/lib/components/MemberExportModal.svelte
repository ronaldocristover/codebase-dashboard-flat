<script lang="ts">
	import Modal from './Modal.svelte';
	import type { Member } from '#lib/types';
	import { exportMembers } from '#lib/utils/memberExcel';

	let {
		open,
		members,
		onClose
	}: { open: boolean; members: Member[]; onClose: () => void } = $props();

	let busy = $state(false);
	let failed = $state(false);

	async function download() {
		busy = true;
		failed = false;
		try {
			await exportMembers(members);
			onClose();
		} catch {
			failed = true;
		} finally {
			busy = false;
		}
	}
</script>

<Modal {open} title="Export members" {onClose}>
	<p class="text-xs text-muted">
		Download {members.length}
		{members.length === 1 ? 'member' : 'members'} as an Excel workbook (.xlsx). The current filters and
		sort order are applied.
	</p>

	{#if failed}
		<p role="alert" class="mt-3 rounded-md border border-danger px-3 py-2 text-xs text-danger">
			Could not create the file. Please try again.
		</p>
	{/if}

	<div class="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
		<button
			type="button"
			class="rounded-md border border-line-strong px-4 py-2.5 text-sm font-medium text-ink hover:bg-cream"
			onclick={onClose}
		>
			Cancel
		</button>
		<button
			type="button"
			disabled={busy || members.length === 0}
			class="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
			onclick={download}
		>
			{busy ? 'Preparing…' : 'Download Excel'}
		</button>
	</div>
</Modal>
