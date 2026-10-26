import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/state', () => ({ page: { status: 404 } }));

import ErrorPage from './+error.svelte';

describe('halaman error dashboard', () => {
	it('menampilkan judul dengan ukuran text-xl', () => {
		render(ErrorPage);

		const judul = screen.getByRole('heading', { name: 'Halaman tidak ditemukan' });
		expect(judul.className).toContain('text-xl');
	});
});
