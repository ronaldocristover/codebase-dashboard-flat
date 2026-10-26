import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { ordersWeek, salesTrend } from '#lib/mock/dashboard';
import BarChart from './BarChart.svelte';
import LineChart from './LineChart.svelte';
import StatCard from './StatCard.svelte';
import StatusPill from './StatusPill.svelte';

describe('StatCard', () => {
	it('shows the label, value, and rising delta', () => {
		render(StatCard, {
			props: { label: 'Sales today', nilai: 'Rp 4.8M', delta: '▲ 12%', arah: 'naik' }
		});

		expect(screen.getByText('Sales today')).toBeTruthy();
		expect(screen.getByText('Rp 4.8M')).toBeTruthy();
		expect(screen.getByText('▲ 12%').className).toContain('text-success');
	});

	it('marks a falling delta with the danger color', () => {
		render(StatCard, {
			props: { label: 'Active products', nilai: '248', delta: '▼ 3 out of stock', arah: 'turun' }
		});

		expect(screen.getByText('▼ 3 out of stock').className).toContain('text-danger');
	});
});

describe('LineChart', () => {
	it('draws one point per data item plus x-axis labels', () => {
		const { container } = render(LineChart, { props: { points: salesTrend } });

		const garis = container.querySelector('polyline');
		expect(garis?.getAttribute('points')?.trim().split(/\s+/)).toHaveLength(salesTrend.length);
		expect(container.querySelectorAll('[data-titik]')).toHaveLength(salesTrend.length);
		expect(container.querySelector('svg circle')).toBeNull();
		expect(screen.getByText(salesTrend[0].label)).toBeTruthy();
	});

	it('shows at most 5 evenly spaced x-axis labels', () => {
		render(LineChart, { props: { points: salesTrend } });
		const labelUnik = new Set(salesTrend.map((p) => p.label));
		expect(labelUnik.size).toBeGreaterThan(0);
		expect(screen.getAllByText(/^\d+ [A-Z][a-z]{2}$/).length).toBeLessThanOrEqual(5);
	});
});

describe('BarChart', () => {
	it('draws one bar per day', () => {
		const { container } = render(BarChart, { props: { data: ordersWeek } });

		expect(container.querySelectorAll('rect')).toHaveLength(ordersWeek.length);
		expect(screen.getByText('Mon')).toBeTruthy();
		expect(screen.getByText('Sun')).toBeTruthy();
	});
});

describe('StatusPill', () => {
	it('shows a readable status label', () => {
		const { rerender } = render(StatusPill, { props: { status: 'menunggu' } });
		expect(screen.getByText('Pending')).toBeTruthy();

		rerender({ status: 'lunas' });
		expect(screen.getByText('Paid')).toBeTruthy();

		rerender({ status: 'nonaktif' });
		expect(screen.getByText('Inactive')).toBeTruthy();
	});
});
