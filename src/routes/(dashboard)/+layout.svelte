<script lang="ts">
	import { page } from '$app/state';
	import Sidebar from '#lib/components/Sidebar.svelte';
	import TopNav from '#lib/components/TopNav.svelte';
	import { setMobileNav, sidebarCollapsed } from '#lib/stores/ui';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const judul = $derived(
		page.url.pathname.startsWith('/member')
			? 'Members'
			: page.url.pathname.startsWith('/form-element')
				? 'Form Element'
				: 'Dashboard'
	);
</script>

<div class="min-h-screen bg-cream">
	<Sidebar />

	<div class="flex min-h-screen flex-col {$sidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-64'}">
		<TopNav
			{judul}
			onToggleMenu={() => {
				sidebarCollapsed.set(false);
				setMobileNav(true);
			}}
		/>
		<main class="flex-1 p-4 md:p-6">
			{@render children()}
		</main>
	</div>
</div>
