import { writable } from 'svelte/store';

export const sidebarCollapsed = writable(false);
export const mobileNavOpen = writable(false);

export function toggleSidebar(): void {
	sidebarCollapsed.update((ciut) => !ciut);
}

export function setMobileNav(open: boolean): void {
	mobileNavOpen.set(open);
}
