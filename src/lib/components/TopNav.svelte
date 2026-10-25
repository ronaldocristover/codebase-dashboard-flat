<script lang="ts">
	import UserMenu from './UserMenu.svelte';

	let { judul, onToggleMenu }: { judul: string; onToggleMenu: () => void } = $props();
</script>

<header class="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-cream px-4 py-3 md:px-6">
	<button
		type="button"
		class="flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-md border border-line-strong bg-white md:hidden"
		aria-label="Buka menu"
		onclick={onToggleMenu}
	>
		<span class="h-0.5 w-4 rounded bg-primary"></span>
		<span class="h-0.5 w-4 rounded bg-primary"></span>
		<span class="h-0.5 w-4 rounded bg-primary"></span>
	</button>

	<h1 class="flex-1 text-lg font-semibold text-primary">{judul}</h1>

	<UserMenu />
</header>
