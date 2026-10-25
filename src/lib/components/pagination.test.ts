import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import Pagination from './Pagination.svelte';

function siapkan(page = 1) {
	const onPageChange = vi.fn();
	render(Pagination, {
		props: { page, totalPages: 5, total: 50, from: (page - 1) * 10 + 1, to: page * 10, onPageChange }
	});
	return onPageChange;
}

describe('Pagination', () => {
	it('menampilkan ringkasan jumlah data', () => {
		siapkan(1);
		expect(screen.getByText('Menampilkan 1–10 dari 50 member')).toBeTruthy();
	});

	it('menonaktifkan tombol sebelumnya di halaman pertama', () => {
		siapkan(1);
		expect(
			(screen.getByRole('button', { name: 'Halaman sebelumnya' }) as HTMLButtonElement).disabled
		).toBe(true);
	});

	it('memanggil onPageChange saat nomor halaman diklik', async () => {
		const onPageChange = siapkan(1);
		await fireEvent.click(screen.getByRole('button', { name: 'Halaman 2' }));
		expect(onPageChange).toHaveBeenCalledWith(2);
	});

	it('menampilkan maksimal 5 nomor halaman', () => {
		render(Pagination, {
			props: { page: 10, totalPages: 20, total: 200, from: 91, to: 100, onPageChange: () => {} }
		});
		const nomor = screen.getAllByRole('button', { name: /^Halaman \d+$/ });
		expect(nomor.length).toBeLessThanOrEqual(5);
	});
});
