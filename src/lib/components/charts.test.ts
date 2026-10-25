import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { ordersWeek, salesTrend } from '#lib/mock/dashboard';
import BarChart from './BarChart.svelte';
import LineChart from './LineChart.svelte';
import StatCard from './StatCard.svelte';
import StatusPill from './StatusPill.svelte';

describe('StatCard', () => {
	it('menampilkan label, nilai, dan delta naik', () => {
		render(StatCard, {
			props: { label: 'Penjualan hari ini', nilai: 'Rp 4,8 jt', delta: '▲ 12%', arah: 'naik' }
		});

		expect(screen.getByText('Penjualan hari ini')).toBeTruthy();
		expect(screen.getByText('Rp 4,8 jt')).toBeTruthy();
		expect(screen.getByText('▲ 12%').className).toContain('text-success');
	});

	it('menandai delta turun dengan warna bahaya', () => {
		render(StatCard, {
			props: { label: 'Produk aktif', nilai: '248', delta: '▼ 3 stok habis', arah: 'turun' }
		});

		expect(screen.getByText('▼ 3 stok habis').className).toContain('text-danger');
	});
});

describe('LineChart', () => {
	it('menggambar satu titik per data dan label sumbu x', () => {
		const { container } = render(LineChart, { props: { points: salesTrend } });

		const garis = container.querySelector('polyline');
		expect(garis?.getAttribute('points')?.trim().split(/\s+/)).toHaveLength(salesTrend.length);
		expect(container.querySelectorAll('circle')).toHaveLength(salesTrend.length);
		expect(screen.getByText(salesTrend[0].label)).toBeTruthy();
	});

	it('menampilkan label sumbu x merata maksimal 5', () => {
		render(LineChart, { props: { points: salesTrend } });
		const labelUnik = new Set(salesTrend.map((p) => p.label));
		expect(labelUnik.size).toBeGreaterThan(0);
		expect(screen.getAllByText(/^\d+ [A-Z][a-z]{2}$/).length).toBeLessThanOrEqual(5);
	});
});

describe('BarChart', () => {
	it('menggambar satu batang per hari', () => {
		const { container } = render(BarChart, { props: { data: ordersWeek } });

		expect(container.querySelectorAll('rect')).toHaveLength(ordersWeek.length);
		expect(screen.getByText('Sen')).toBeTruthy();
		expect(screen.getByText('Min')).toBeTruthy();
	});
});

describe('StatusPill', () => {
	it('menampilkan label status yang ramah dibaca', () => {
		const { rerender } = render(StatusPill, { props: { status: 'menunggu' } });
		expect(screen.getByText('Menunggu')).toBeTruthy();

		rerender({ status: 'lunas' });
		expect(screen.getByText('Lunas')).toBeTruthy();

		rerender({ status: 'nonaktif' });
		expect(screen.getByText('Nonaktif')).toBeTruthy();
	});
});
