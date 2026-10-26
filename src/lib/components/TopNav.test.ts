import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

import TopNav from './TopNav.svelte';

describe('TopNav', () => {
	it('menampilkan logo dan judul halaman', () => {
		render(TopNav, { props: { judul: 'Dashboard', onToggleMenu: () => {} } });

		expect(screen.getByText('TokoKu')).toBeTruthy();
		expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeTruthy();
	});

	it('tombol menu memanggil onToggleMenu sekali', async () => {
		const onToggleMenu = vi.fn();
		render(TopNav, { props: { judul: 'Dashboard', onToggleMenu } });

		await fireEvent.click(screen.getByRole('button', { name: 'Buka menu' }));

		expect(onToggleMenu).toHaveBeenCalledTimes(1);
	});

	it('judul halaman hanya tampil di desktop', () => {
		render(TopNav, { props: { judul: 'Dashboard', onToggleMenu: () => {} } });

		const judul = screen.getByRole('heading', { level: 1 });
		expect(judul.className).toContain('hidden');
		expect(judul.className).toContain('md:block');
	});
});
