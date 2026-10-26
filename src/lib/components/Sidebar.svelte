<script lang="ts">
	import { page } from '$app/state';
	import { mobileNavOpen, setMobileNav, sidebarCollapsed, toggleSidebar } from '#lib/stores/ui';
	import Logo from './Logo.svelte';

	type SubItem = { label: string; href?: string };
	type Item = { label: string; href?: string; badge?: string; anak?: SubItem[] };

	const menu: Item[] = [
		{ label: 'Dashboard', href: '/' },
		{ label: 'Members', href: '/member' },
		{ label: 'Form Element', href: '/form-element' },
		{
			label: 'Products',
			anak: [{ label: 'All Products' }, { label: 'Categories' }, { label: 'Stocktake' }]
		},
		{ label: 'Orders', badge: '12' },
		{ label: 'Reports' }
	];

	const ciut = $derived($sidebarCollapsed);
	const path = $derived(page.url.pathname);

	let submenu = $state<string | null>(null);

	$effect(() => {
		if (!$mobileNavOpen) return;

		const tutupEsc = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setMobileNav(false);
		};
		const overflowAwal = document.body.style.overflow;

		document.addEventListener('keydown', tutupEsc);
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', tutupEsc);
			document.body.style.overflow = overflowAwal;
		};
	});

	function aktif(href?: string): boolean {
		if (!href) return false;
		return href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);
	}

	function aktifAnak(item: Item): boolean {
		return item.anak?.some((anak) => aktif(anak.href)) ?? false;
	}

	function buka(item: Item) {
		if (item.anak) {
			submenu = submenu === item.label ? null : item.label;
		} else {
			submenu = null;
			setMobileNav(false);
		}
	}

	const dasar = 'flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium';
	const aktifKelas = 'bg-cream text-primary hover:bg-cream';
	const biasaKelas = 'text-white/85 hover:bg-white/10';
</script>

{#snippet ikon(nama: string)}
	<svg
		viewBox="0 0 24 24"
		class="h-4 w-4 shrink-0"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		{#if nama === 'Dashboard'}
			<rect x="3" y="3" width="7" height="7" rx="1" />
			<rect x="14" y="3" width="7" height="7" rx="1" />
			<rect x="3" y="14" width="7" height="7" rx="1" />
			<rect x="14" y="14" width="7" height="7" rx="1" />
		{:else if nama === 'Members'}
			<circle cx="12" cy="8" r="3.5" />
			<path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
		{:else if nama === 'Form Element'}
			<rect x="3" y="4" width="18" height="16" rx="2" />
			<path d="M7 9h10M7 13h6" />
		{:else if nama === 'Products'}
			<path d="M3 8l9-5 9 5-9 5-9-5z" />
			<path d="M3 8v9l9 5 9-5V8" />
		{:else if nama === 'Orders'}
			<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
			<path d="M9 8h6M9 12h6" />
		{:else}
			<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
		{/if}
	</svg>
{/snippet}

{#if $mobileNavOpen}
	<button
		type="button"
		class="fixed inset-0 z-30 bg-ink/40 md:hidden"
		aria-label="Close menu"
		onclick={() => setMobileNav(false)}
	></button>
{/if}

<aside
	class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto bg-primary px-3 py-4 text-white transition-transform duration-200 {$mobileNavOpen
		? 'translate-x-0'
		: '-translate-x-full max-md:invisible'} md:visible md:translate-x-0 {ciut
		? 'md:w-[72px]'
		: 'md:w-64'}"
>
	<div class="mb-6 flex items-center gap-2 {ciut ? 'md:flex-col' : 'justify-between'}">
		{#if ciut}
			<span class="hidden h-9 w-9 items-center justify-center rounded-lg bg-cream md:flex" aria-hidden="true">
				<svg viewBox="0 0 24 24" width="18" height="18">
					<path fill="#014BAA" d="M6.5 7.5h11l1.2 12.5H5.3L6.5 7.5z" />
					<path
						fill="none"
						stroke="#014BAA"
						stroke-width="2"
						stroke-linecap="round"
						d="M9 9.5V6.2a3 3 0 0 1 6 0v3.3"
					/>
				</svg>
			</span>
		{/if}

		{#if !ciut}
			<a href="/" onclick={() => setMobileNav(false)} aria-label="TokoKu — Dashboard">
				<Logo onDark />
			</a>
		{/if}

		<button
			type="button"
			class="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/35 text-xs leading-none md:flex"
			aria-label={ciut ? 'Expand menu' : 'Collapse menu'}
			onclick={toggleSidebar}
		>
			{ciut ? '»' : '«'}
		</button>
	</div>

	<nav class="flex flex-1 flex-col gap-1">
		{#each menu as item (item.label)}
			{#if item.anak}
				<button
					type="button"
					class="{dasar} {aktifAnak(item) ? aktifKelas : biasaKelas}"
					aria-expanded={submenu === item.label}
					onclick={() => buka(item)}
				>
					{@render ikon(item.label)}
					{#if !ciut}
						<span class="flex-1 text-left">{item.label}</span>
						<span class="text-[10px]">{submenu === item.label ? '▾' : '▸'}</span>
					{/if}
				</button>

				{#if !ciut && submenu === item.label}
					<div class="ml-7 flex flex-col gap-0.5 border-l border-white/25 pl-2">
						{#each item.anak as anak (anak.label)}
							{#if anak.href}
								<a
									href={anak.href}
									class="rounded-md px-2 py-1.5 text-xs text-white/80 hover:bg-white/10"
									onclick={() => setMobileNav(false)}
								>
									{anak.label}
								</a>
							{:else}
								<button
									type="button"
									aria-disabled="true"
									class="rounded-md px-2 py-1.5 text-left text-xs text-white/60"
								>
									{anak.label}
								</button>
							{/if}
						{/each}
					</div>
				{/if}
			{:else if item.href}
				<a
					href={item.href}
					class="{dasar} {aktif(item.href) ? aktifKelas : biasaKelas}"
					aria-current={aktif(item.href) ? 'page' : undefined}
					onclick={() => setMobileNav(false)}
				>
					{@render ikon(item.label)}
					{#if !ciut}
						<span class="flex-1">{item.label}</span>
					{/if}
					{#if item.badge && !ciut}
						<span class="rounded-full bg-cream px-1.5 py-0.5 text-[10px] font-semibold text-primary">
							{item.badge}
						</span>
					{/if}
				</a>
			{:else}
				<button
					type="button"
					aria-disabled="true"
					class="{dasar} {biasaKelas}"
					onclick={() => buka(item)}
				>
					{@render ikon(item.label)}
					{#if !ciut}
						<span class="flex-1 text-left">{item.label}</span>
					{/if}
					{#if item.badge && !ciut}
						<span class="rounded-full bg-cream px-1.5 py-0.5 text-[10px] font-semibold text-primary">
							{item.badge}
						</span>
					{/if}
				</button>
			{/if}
		{/each}
	</nav>
</aside>
