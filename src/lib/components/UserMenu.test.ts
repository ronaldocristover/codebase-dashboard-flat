import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { goto } = vi.hoisted(() => ({ goto: vi.fn() }));
vi.mock('$app/navigation', () => ({ goto }));

import UserMenu from './UserMenu.svelte';

describe('UserMenu', () => {
	beforeEach(() => {
		goto.mockClear();
	});

	it('menu tersembunyi sebelum avatar diklik', () => {
		render(UserMenu);
		expect(screen.queryByText('Keluar')).toBeNull();
		expect(screen.queryByText('Rina Setiawan')).toBeNull();
	});

	it('menampilkan menu saat avatar diklik', async () => {
		render(UserMenu);
		await fireEvent.click(screen.getByRole('button', { name: /RS/i }));

		expect(screen.getByText('Rina Setiawan')).toBeTruthy();
		expect(screen.getByText('rina@tokoku.id')).toBeTruthy();
		expect(screen.getByText('Profil Saya')).toBeTruthy();
		expect(screen.getByText('Pengaturan Toko')).toBeTruthy();
		expect(screen.getByText('Keluar')).toBeTruthy();
	});

	it('menutup menu saat klik di luar', async () => {
		render(UserMenu);
		await fireEvent.click(screen.getByRole('button', { name: /RS/i }));
		expect(screen.getByText('Keluar')).toBeTruthy();

		await fireEvent.click(document.body);
		expect(screen.queryByText('Keluar')).toBeNull();
	});

	it('menutup menu saat Escape', async () => {
		render(UserMenu);
		await fireEvent.click(screen.getByRole('button', { name: /RS/i }));
		expect(screen.getByText('Keluar')).toBeTruthy();

		await fireEvent.keyDown(document, { key: 'Escape' });
		expect(screen.queryByText('Keluar')).toBeNull();
	});

	it('tombol Keluar mengarah ke halaman login', async () => {
		render(UserMenu);
		await fireEvent.click(screen.getByRole('button', { name: /RS/i }));
		await fireEvent.click(screen.getByText('Keluar'));

		expect(goto).toHaveBeenCalledWith('/login');
		expect(screen.queryByText('Keluar')).toBeNull();
	});
});
