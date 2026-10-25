import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';

const { goto } = vi.hoisted(() => ({ goto: vi.fn() }));
vi.mock('$app/navigation', () => ({ goto }));

import { auth, login, logout } from '#lib/stores/auth';
import LoginPage from './+page.svelte';

describe('halaman login', () => {
	beforeEach(() => {
		goto.mockClear();
		logout();
	});

	it('menampilkan logo dan form', () => {
		render(LoginPage);
		expect(screen.getByText('TokoKu')).toBeTruthy();
		expect(screen.getByLabelText('Email')).toBeTruthy();
		expect(screen.getByLabelText('Kata sandi')).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Masuk ke Dashboard' })).toBeTruthy();
	});

	it('menolak submit kosong dengan pesan error', async () => {
		render(LoginPage);
		await fireEvent.click(screen.getByRole('button', { name: 'Masuk ke Dashboard' }));

		expect(screen.getByText('Email wajib diisi')).toBeTruthy();
		expect(screen.getByText('Kata sandi wajib diisi')).toBeTruthy();
		expect(goto).not.toHaveBeenCalled();
	});

	it('menolak format email salah', async () => {
		render(LoginPage);

		await fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'bukan-email' } });
		await fireEvent.input(screen.getByLabelText('Kata sandi'), { target: { value: 'rahasia' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Masuk ke Dashboard' }));

		expect(screen.getByText('Format email tidak valid')).toBeTruthy();
		expect(goto).not.toHaveBeenCalled();
	});

	it('login valid masuk ke dashboard', async () => {
		render(LoginPage);

		await fireEvent.input(screen.getByLabelText('Email'), {
			target: { value: 'rina@tokoku.id' }
		});
		await fireEvent.input(screen.getByLabelText('Kata sandi'), { target: { value: 'rahasia' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Masuk ke Dashboard' }));

		expect(get(auth)).toBe(true);
		expect(goto).toHaveBeenCalledWith('/');
	});

	it('pengguna yang sudah login langsung diarahkan ke dashboard', async () => {
		login('rina@tokoku.id', 'rahasia');
		render(LoginPage);

		await waitFor(() => expect(goto).toHaveBeenCalledWith('/'));
	});
});
