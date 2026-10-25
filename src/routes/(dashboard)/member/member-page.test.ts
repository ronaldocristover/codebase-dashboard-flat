import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { members } from '#lib/mock/members';
import { formatRupiah } from '#lib/utils/format';
import MemberPage from './+page.svelte';

function baris(container: HTMLElement): string[][] {
	return Array.from(container.querySelectorAll('tbody tr')).map((tr) =>
		Array.from(tr.querySelectorAll('td')).map((td) => td.textContent?.trim() ?? '')
	);
}

function totalMaksimum(): string {
	return formatRupiah(Math.max(...members.map((m) => m.totalBelanja)));
}

describe('halaman member', () => {
	it('menampilkan breadcrumb, judul, dan 10 baris pertama', () => {
		const { container } = render(MemberPage);

		expect(screen.getByText('Home')).toBeTruthy();
		expect(screen.getByText('Member', { selector: 'span' })).toBeTruthy();
		expect(container.querySelectorAll('tbody tr')).toHaveLength(10);
		expect(screen.getByText(/Menampilkan 1–10 dari 50 member/)).toBeTruthy();
	});

	it('mencari member lewat kolom search', async () => {
		const { container } = render(MemberPage);
		await fireEvent.input(screen.getByLabelText('Cari member'), {
			target: { value: 'Siti Aminah' }
		});

		const rows = baris(container);
		expect(rows).toHaveLength(1);
		expect(rows[0][0]).toContain('Siti Aminah');
	});

	it('menampilkan empty state saat tidak ada yang cocok', async () => {
		render(MemberPage);
		await fireEvent.input(screen.getByLabelText('Cari member'), { target: { value: 'zzzz' } });

		expect(screen.getByText('Tidak ada member yang cocok')).toBeTruthy();
	});

	it('memfilter berdasarkan status', async () => {
		const { container } = render(MemberPage);
		await fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'nonaktif' } });

		const rows = baris(container);
		expect(rows.length).toBeGreaterThan(0);
		for (const row of rows) {
			expect(row[row.length - 1]).toContain('Nonaktif');
		}
	});

	it('mengurutkan kolom total belanja naik lalu turun', async () => {
		const { container } = render(MemberPage);
		const header = screen.getByRole('button', { name: /Total Belanja/ });

		await fireEvent.click(header);
		expect(baris(container)[0][4]).toBe('Rp 89.000');

		await fireEvent.click(header);
		expect(baris(container)[0][4]).toBe(totalMaksimum());
	});

	it('kembali ke halaman 1 saat filter berubah', async () => {
		render(MemberPage);
		await fireEvent.click(screen.getByRole('button', { name: 'Halaman 3' }));
		expect(screen.getByText(/Menampilkan 21–30/)).toBeTruthy();

		await fireEvent.input(screen.getByLabelText('Cari member'), {
			target: { value: 'Siti Aminah' }
		});
		expect(screen.getByText(/Menampilkan 1–1/)).toBeTruthy();
	});

	it('tombol reset mengembalikan seluruh data', async () => {
		const { container } = render(MemberPage);
		await fireEvent.input(screen.getByLabelText('Cari member'), { target: { value: 'zzzz' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

		expect(container.querySelectorAll('tbody tr')).toHaveLength(10);
	});
});
