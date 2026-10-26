<script lang="ts">
	import { page } from '$app/state';

	const pesan = $derived(page.error?.message ?? 'Page not found');
</script>

<svelte:head>
	<title>Page not found — TokoKu</title>
</svelte:head>

<div class="rounded-lg border border-line bg-white p-8 text-center">
	<p class="text-[10px] uppercase tracking-[0.12em] text-muted">Error {page.status}</p>
	<h1 class="mt-1 text-xl font-semibold text-primary">{pesan}</h1>
	<p class="mt-1 text-xs text-muted">
		This menu is a demo and does not have its own page yet.
	</p>
	<a
		href="/"
		class="mt-4 inline-block rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white"
	>
		Back to Dashboard
	</a>
</div>
