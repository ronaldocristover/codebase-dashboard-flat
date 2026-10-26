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
	it('shows the row count summary', () => {
		siapkan(1);
		expect(screen.getByText('Showing 1–10 of 50 members')).toBeTruthy();
	});

	it('disables the previous button on the first page', () => {
		siapkan(1);
		expect(
			(screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement).disabled
		).toBe(true);
	});

	it('calls onPageChange when a page number is clicked', async () => {
		const onPageChange = siapkan(1);
		await fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
		expect(onPageChange).toHaveBeenCalledWith(2);
	});

	it('shows at most 5 page numbers', () => {
		render(Pagination, {
			props: { page: 10, totalPages: 20, total: 200, from: 91, to: 100, onPageChange: () => {} }
		});
		const nomor = screen.getAllByRole('button', { name: /^Page \d+$/ });
		expect(nomor.length).toBeLessThanOrEqual(5);
	});
});
