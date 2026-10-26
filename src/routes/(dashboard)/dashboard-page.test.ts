import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import DashboardPage from './+page.svelte';

describe('dashboard page', () => {
	it('shows four stat cards', () => {
		render(DashboardPage);

		expect(screen.getByText('Sales today')).toBeTruthy();
		expect(screen.getByText('New orders')).toBeTruthy();
		expect(screen.getByText('Active products')).toBeTruthy();
		expect(screen.getByText('Total members')).toBeTruthy();
	});

	it('shows both charts and the recent orders table', () => {
		const { container } = render(DashboardPage);

		expect(screen.getByText('Sales trend (30 days)')).toBeTruthy();
		expect(screen.getByText('Orders (7 days)')).toBeTruthy();
		expect(container.querySelectorAll('tbody tr')).toHaveLength(5);
		expect(screen.getByText('#INV-2041')).toBeTruthy();
	});
});
