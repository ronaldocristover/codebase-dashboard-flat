import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { mobileNavOpen, setMobileNav, sidebarCollapsed, toggleSidebar } from './ui';

describe('ui store', () => {
	it('toggleSidebar membalik status ciut', () => {
		const awal = get(sidebarCollapsed);
		toggleSidebar();
		expect(get(sidebarCollapsed)).toBe(!awal);
		toggleSidebar();
		expect(get(sidebarCollapsed)).toBe(awal);
	});

	it('setMobileNav mengatur drawer mobile', () => {
		setMobileNav(true);
		expect(get(mobileNavOpen)).toBe(true);
		setMobileNav(false);
		expect(get(mobileNavOpen)).toBe(false);
	});
});
