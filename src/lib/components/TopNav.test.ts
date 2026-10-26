import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

import TopNav from './TopNav.svelte';

describe('TopNav', () => {
	it('shows the logo and page title', () => {
		render(TopNav, { props: { judul: 'Dashboard', onToggleMenu: () => {} } });

		expect(screen.getByText('TokoKu')).toBeTruthy();
		expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeTruthy();
	});

	it('the menu button calls onToggleMenu once', async () => {
		const onToggleMenu = vi.fn();
		render(TopNav, { props: { judul: 'Dashboard', onToggleMenu } });

		await fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));

		expect(onToggleMenu).toHaveBeenCalledTimes(1);
	});

	it('the page title is desktop only', () => {
		render(TopNav, { props: { judul: 'Dashboard', onToggleMenu: () => {} } });

		const judul = screen.getByRole('heading', { level: 1 });
		expect(judul.className).toContain('hidden');
		expect(judul.className).toContain('md:block');
	});
});
