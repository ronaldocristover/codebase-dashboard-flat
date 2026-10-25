import { fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/') } }));

import { sidebarCollapsed } from '#lib/stores/ui';
import Sidebar from './Sidebar.svelte';

afterEach(() => sidebarCollapsed.set(false));

describe('Sidebar', () => {
	it('menampilkan logo dan menu utama', () => {
		render(Sidebar);
		expect(screen.getByText('TokoKu')).toBeTruthy();
		expect(screen.getByText('Dashboard')).toBeTruthy();
		expect(screen.getByText('Member')).toBeTruthy();
		expect(screen.queryByText('Keluar')).toBeNull();
	});

	it('membuka submenu Produk dan hanya satu submenu terbuka', async () => {
		render(Sidebar);

		expect(screen.queryByText('Semua Produk')).toBeNull();
		await fireEvent.click(screen.getByRole('button', { name: /Produk/ }));
		expect(screen.getByText('Semua Produk')).toBeTruthy();

		await fireEvent.click(screen.getByRole('button', { name: /Laporan/ }));
		expect(screen.queryByText('Semua Produk')).toBeNull();
	});

	it('menyembunyikan label dan submenu saat sidebar diciutkan', async () => {
		render(Sidebar);
		await fireEvent.click(screen.getByRole('button', { name: /Produk/ }));
		expect(screen.getByText('Semua Produk')).toBeTruthy();

		sidebarCollapsed.set(true);

		expect(screen.queryByText('Member')).toBeNull();
		expect(screen.queryByText('Semua Produk')).toBeNull();
	});
});
