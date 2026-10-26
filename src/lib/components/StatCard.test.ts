import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import StatCard from './StatCard.svelte';

describe('StatCard', () => {
	it('menampilkan nilai dengan ukuran judul 28px', () => {
		render(StatCard, {
			label: 'Penjualan hari ini',
			nilai: 'Rp 4,8 jt',
			delta: '▲ 12%',
			arah: 'naik'
		});

		const nilai = screen.getByText('Rp 4,8 jt');
		expect(nilai.className).toContain('text-[28px]');
	});
});
