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
	it('menampilkan logo dan menu utama', () => {
		render(Sidebar);
		expect(screen.getByText('TokoKu')).toBeTruthy();
		expect(screen.getByText('Dashboard')).toBeTruthy();
		expect(screen.getByText('Member')).toBeTruthy();
		expect(screen.queryByText('Keluar')).toBeNull();
	});

	it('menu aktif berwarna royal blue di atas latar cream', () => {
		render(Sidebar);
		const dashboard = screen.getByRole('link', { name: 'Dashboard' });

		expect(dashboard.className).toContain('bg-cream');
		expect(dashboard.className).toContain('text-primary');
		expect(dashboard.className).not.toContain('text-white/85');
	});

	it('menu tanpa halaman tidak menjadi tautan mati', () => {
		render(Sidebar);

		expect(screen.queryByRole('link', { name: /Pesanan/ })).toBeNull();
		expect(screen.getByRole('button', { name: /Pesanan/ })).toBeTruthy();
		expect(screen.queryByRole('link', { name: /Laporan/ })).toBeNull();
		expect(screen.getByRole('button', { name: /Laporan/ })).toBeTruthy();
		expect(document.querySelector('a[href="/pesanan"]')).toBeNull();
		expect(document.querySelector('a[href="/produk"]')).toBeNull();
		expect(document.querySelector('a[href="/laporan"]')).toBeNull();
	});

	it('membuka submenu Produk dan menutupnya saat Laporan diklik', async () => {
		render(Sidebar);

		expect(screen.queryByText('Semua Produk')).toBeNull();
		await fireEvent.click(screen.getByRole('button', { name: /Produk/ }));
		expect(screen.getByText('Semua Produk')).toBeTruthy();

		await fireEvent.click(screen.getByRole('button', { name: /Laporan/ }));
		expect(screen.queryByText('Semua Produk')).toBeNull();
		expect(screen.queryByText('Penjualan')).toBeNull();
		expect(screen.queryByText('Stok')).toBeNull();
	});

	it('submenu Produk menutup saat tombolnya diklik lagi', async () => {
		render(Sidebar);
		const tombol = () => screen.getByRole('button', { name: /^Produk/ });

		await fireEvent.click(tombol());
		expect(screen.getByText('Semua Produk')).toBeTruthy();

		await fireEvent.click(tombol());
		expect(screen.queryByText('Semua Produk')).toBeNull();
	});

	it('menyembunyikan label dan submenu saat sidebar diciutkan', async () => {
		render(Sidebar);
		await fireEvent.click(screen.getByRole('button', { name: /Produk/ }));
		expect(screen.getByText('Semua Produk')).toBeTruthy();

		await fireEvent.click(screen.getByRole('button', { name: 'Ciutkan menu' }));

		expect(screen.queryByText('Member')).toBeNull();
		expect(screen.queryByText('Semua Produk')).toBeNull();
	});

	it('status ciut bertahan saat komponen dipasang ulang', async () => {
		render(Sidebar);
		await fireEvent.click(screen.getByRole('button', { name: 'Ciutkan menu' }));
		cleanup();

		render(Sidebar);
		expect(screen.queryByText('Member')).toBeNull();
	});

	it('drawer tertutup tidak bisa difokus dan tertutup dengan Escape', async () => {
		render(Sidebar);
		const drawer = screen.getByRole('complementary');
		expect(drawer.className).toContain('max-md:invisible');

		setMobileNav(true);
		await tick();
		await fireEvent.keyDown(document, { key: 'Escape' });
		expect(get(mobileNavOpen)).toBe(false);
	});

	it('tombol ciutkan hanya untuk desktop', () => {
		render(Sidebar);
		expect(screen.getByRole('button', { name: 'Ciutkan menu' }).className).toContain('hidden');
	});
});
