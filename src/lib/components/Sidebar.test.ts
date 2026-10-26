import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { get } from 'svelte/store';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/') } }));

import { mobileNavOpen, setMobileNav, sidebarCollapsed } from '#lib/stores/ui';
import Sidebar from './Sidebar.svelte';

afterEach(() => {
	sidebarCollapsed.set(false);
	setMobileNav(false);
});

describe('Sidebar', () => {
	it('shows the logo and main menu', () => {
		render(Sidebar);
		expect(screen.getByText('TokoKu')).toBeTruthy();
		expect(screen.getByText('Dashboard')).toBeTruthy();
		expect(screen.getByText('Members')).toBeTruthy();
		expect(screen.queryByText('Sign out')).toBeNull();
	});

	it('the active item is primary on a cream background', () => {
		render(Sidebar);
		const dashboard = screen.getByRole('link', { name: 'Dashboard' });

		expect(dashboard.className).toContain('bg-cream');
		expect(dashboard.className).toContain('text-primary');
		expect(dashboard.className).not.toContain('text-white/85');
	});

	it('items without a page are not dead links', () => {
		render(Sidebar);

		expect(screen.queryByRole('link', { name: /Orders/ })).toBeNull();
		expect(screen.getByRole('button', { name: /Orders/ })).toBeTruthy();
		expect(screen.queryByRole('link', { name: /Reports/ })).toBeNull();
		expect(screen.getByRole('button', { name: /Reports/ })).toBeTruthy();
		expect(document.querySelector('a[href="/pesanan"]')).toBeNull();
		expect(document.querySelector('a[href="/produk"]')).toBeNull();
		expect(document.querySelector('a[href="/laporan"]')).toBeNull();
	});

	it('opens the Products submenu and closes it when Reports is clicked', async () => {
		render(Sidebar);

		expect(screen.queryByText('All Products')).toBeNull();
		await fireEvent.click(screen.getByRole('button', { name: /Products/ }));
		expect(screen.getByText('All Products')).toBeTruthy();

		await fireEvent.click(screen.getByRole('button', { name: /Reports/ }));
		expect(screen.queryByText('All Products')).toBeNull();
		expect(screen.queryByText('Sales')).toBeNull();
		expect(screen.queryByText('Stock')).toBeNull();
	});

	it('the Products submenu closes when its button is clicked again', async () => {
		render(Sidebar);
		const tombol = () => screen.getByRole('button', { name: /^Products/ });

		await fireEvent.click(tombol());
		expect(screen.getByText('All Products')).toBeTruthy();

		await fireEvent.click(tombol());
		expect(screen.queryByText('All Products')).toBeNull();
	});

	it('hides labels and submenus when the sidebar is collapsed', async () => {
		render(Sidebar);
		await fireEvent.click(screen.getByRole('button', { name: /Products/ }));
		expect(screen.getByText('All Products')).toBeTruthy();

		await fireEvent.click(screen.getByRole('button', { name: 'Collapse menu' }));

		expect(screen.queryByText('Members')).toBeNull();
		expect(screen.queryByText('All Products')).toBeNull();
	});

	it('the collapsed state persists across remounts', async () => {
		render(Sidebar);
		await fireEvent.click(screen.getByRole('button', { name: 'Collapse menu' }));
		cleanup();

		render(Sidebar);
		expect(screen.queryByText('Members')).toBeNull();
	});

	it('the closed drawer cannot be focused and closes with Escape', async () => {
		render(Sidebar);
		const drawer = screen.getByRole('complementary');
		expect(drawer.className).toContain('max-md:invisible');

		setMobileNav(true);
		await tick();
		await fireEvent.keyDown(document, { key: 'Escape' });
		expect(get(mobileNavOpen)).toBe(false);
	});

	it('the collapse button is desktop only', () => {
		render(Sidebar);
		expect(screen.getByRole('button', { name: 'Collapse menu' }).className).toContain('hidden');
	});
});
