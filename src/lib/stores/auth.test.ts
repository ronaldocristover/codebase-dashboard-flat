import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { auth, login, logout } from './auth';

describe('auth store', () => {
	it('menolak email kosong atau format salah', () => {
		expect(login('', '')).toBe(false);
		expect(login('bukan-email', 'rahasia')).toBe(false);
		expect(get(auth)).toBe(false);
	});

	it('menolak kata sandi kosong', () => {
		expect(login('rina@tokoku.id', '')).toBe(false);
		expect(get(auth)).toBe(false);
	});

	it('menerima email dan kata sandi valid', () => {
		expect(login('rina@tokoku.id', 'rahasia')).toBe(true);
		expect(get(auth)).toBe(true);
	});

	it('logout mengembalikan status belum login', () => {
		login('rina@tokoku.id', 'rahasia');
		logout();
		expect(get(auth)).toBe(false);
	});
});

describe('guard layout dashboard', () => {
	it('melempar redirect ke /login saat belum login', async () => {
		logout();
		const { load } = await import('../../routes/(dashboard)/+layout');

		try {
			load();
			throw new Error('seharusnya redirect');
		} catch (error) {
			const redirect = error as { status: number; location: string };
			expect(redirect.status).toBe(303);
			expect(redirect.location).toBe('/login');
		}
	});

	it('lolos saat sudah login', async () => {
		login('rina@tokoku.id', 'rahasia');
		const { load } = await import('../../routes/(dashboard)/+layout');
		expect(() => load()).not.toThrow();
	});
});
