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

	it('menghubungkan pesan error ke input', async () => {
		render(LoginPage);
		await fireEvent.click(screen.getByRole('button', { name: 'Masuk ke Dashboard' }));

		const errorEmail = screen.getByText('Email wajib diisi');
		const errorPassword = screen.getByText('Kata sandi wajib diisi');
		expect(errorEmail.getAttribute('role')).toBe('alert');
		expect(errorPassword.getAttribute('role')).toBe('alert');
		expect(errorEmail.id).toBe('email-error');
		expect(errorPassword.id).toBe('password-error');

		const email = screen.getByLabelText('Email');
		const password = screen.getByLabelText('Kata sandi');
		expect(email.getAttribute('aria-describedby')).toBe('email-error');
		expect(password.getAttribute('aria-describedby')).toBe('password-error');
		expect(email.getAttribute('aria-invalid')).toBe('true');
		expect(password.getAttribute('aria-invalid')).toBe('true');
	});

	it('placeholder lupa sandi dan daftar adalah tombol, bukan tautan', () => {
		render(LoginPage);

		expect(screen.getByRole('button', { name: 'Lupa sandi?' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Daftar' })).toBeTruthy();
		expect(screen.queryByRole('link', { name: 'Lupa sandi?' })).toBeNull();
		expect(screen.queryByRole('link', { name: 'Daftar' })).toBeNull();
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
