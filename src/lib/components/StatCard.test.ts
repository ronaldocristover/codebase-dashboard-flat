import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import StatCard from './StatCard.svelte';

describe('StatCard', () => {
	it('shows the value at a 28px heading size', () => {
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
