import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { page } = vi.hoisted(() => ({ page: { status: 404, error: null as null | { message: string } } }));

vi.mock('$app/state', () => ({ page }));

import ErrorPage from './+error.svelte';

afterEach(() => {
	page.error = null;
	cleanup();
});

describe('dashboard error page', () => {
	it('renders the fallback title at text-xl', () => {
		page.error = null;
		render(ErrorPage);

		const judul = screen.getByRole('heading', { name: 'Page not found' });
		expect(judul.className).toContain('text-xl');
	});

	it('prefers the error message when present', () => {
		page.error = { message: 'Member not found' };
		render(ErrorPage);

		expect(screen.getByRole('heading', { name: 'Member not found' })).toBeTruthy();
	});
});
