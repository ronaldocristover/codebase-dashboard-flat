import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import DashboardPage from './+page.svelte';

describe('halaman dashboard', () => {
	it('menampilkan empat kartu statistik', () => {
		render(DashboardPage);

		expect(screen.getByText('Penjualan hari ini')).toBeTruthy();
		expect(screen.getByText('Pesanan baru')).toBeTruthy();
		expect(screen.getByText('Produk aktif')).toBeTruthy();
		expect(screen.getByText('Total member')).toBeTruthy();
	});

	it('menampilkan kedua chart dan tabel pesanan terbaru', () => {
		const { container } = render(DashboardPage);

		expect(screen.getByText('Tren penjualan 30 hari')).toBeTruthy();
		expect(screen.getByText('Pesanan 7 hari')).toBeTruthy();
		expect(container.querySelectorAll('tbody tr')).toHaveLength(5);
		expect(screen.getByText('#INV-2041')).toBeTruthy();
	});
});
