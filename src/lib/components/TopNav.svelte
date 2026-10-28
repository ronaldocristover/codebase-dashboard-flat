<script lang="ts">
	import Logo from './Logo.svelte';
	import UserMenu from './UserMenu.svelte';

	let {
		judul,
		onToggleMenu,
		user
	}: { judul: string; onToggleMenu: () => void; user: { id: string; email: string } } = $props();
</script>

<header class="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-cream px-4 py-3 md:px-6">
	<button
		type="button"
		class="flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-md border border-line-strong bg-white md:hidden"
		aria-label="Open menu"
		onclick={onToggleMenu}
	>
		<span class="h-0.5 w-4 rounded bg-primary"></span>
		<span class="h-0.5 w-4 rounded bg-primary"></span>
		<span class="h-0.5 w-4 rounded bg-primary"></span>
	</button>

	<div class="flex-1 md:hidden">
		<Logo size="sm" />
	</div>

	<h1 class="hidden flex-1 text-xl font-semibold text-primary md:block md:text-2xl">{judul}</h1>

	<UserMenu {user} />
</header>
