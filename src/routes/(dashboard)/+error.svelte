<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Halaman tidak ditemukan — TokoKu</title>
</svelte:head>

<div class="rounded-lg border border-line bg-white p-8 text-center">
	<p class="text-[10px] uppercase tracking-[0.12em] text-muted">Error {page.status}</p>
	<h1 class="mt-1 text-lg font-semibold text-primary">Halaman tidak ditemukan</h1>
	<p class="mt-1 text-xs text-muted">
		Menu ini masih contoh tampilan dan belum punya halaman sendiri.
	</p>
	<a
		href="/"
		class="mt-4 inline-block rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white"
	>
		Kembali ke Dashboard
	</a>
</div>
