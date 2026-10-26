<script lang="ts">
	let {
		page,
		totalPages,
		total,
		from,
		to,
		onPageChange
	}: {
		page: number;
		totalPages: number;
		total: number;
		from: number;
		to: number;
		onPageChange: (page: number) => void;
	} = $props();

	const nomor = $derived.by(() => {
		if (totalPages === 0) return [];
		const jumlah = Math.min(5, totalPages);
		const mulai = Math.max(1, Math.min(page - 2, totalPages - jumlah + 1));
		return Array.from({ length: jumlah }, (_, i) => mulai + i);
	});

	const tombol = 'rounded-md border border-line-strong px-2.5 py-1 text-[11px] disabled:opacity-40';
</script>

<div class="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
	<p class="text-[11px] text-muted">Showing {from}–{to} of {total} members</p>

	<div class="flex items-center gap-1">
		<button
			type="button"
			class={tombol}
			aria-label="Previous page"
			disabled={page <= 1}
			onclick={() => onPageChange(page - 1)}
		>
			‹
		</button>

		{#each nomor as nomorHalaman (nomorHalaman)}
			<button
				type="button"
				class="{tombol} {nomorHalaman === page ? 'border-primary bg-primary text-white' : 'bg-white'}"
				aria-label="Page {nomorHalaman}"
				aria-current={nomorHalaman === page ? 'page' : undefined}
				onclick={() => onPageChange(nomorHalaman)}
			>
				{nomorHalaman}
			</button>
		{/each}

		<button
			type="button"
			class={tombol}
			aria-label="Next page"
			disabled={page >= totalPages}
			onclick={() => onPageChange(page + 1)}
		>
			›
		</button>
	</div>
</div>
