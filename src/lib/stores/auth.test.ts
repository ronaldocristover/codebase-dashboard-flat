import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { auth, login, logout } from './auth';

describe('auth store', () => {
	it('rejects an empty or malformed email', () => {
		expect(login('', '')).toBe(false);
		expect(login('bukan-email', 'rahasia')).toBe(false);
		expect(get(auth)).toBe(false);
	});

	it('rejects an empty password', () => {
		expect(login('rina@tokoku.id', '')).toBe(false);
		expect(get(auth)).toBe(false);
	});

	it('accepts a valid email and password', () => {
		expect(login('rina@tokoku.id', 'rahasia')).toBe(true);
		expect(get(auth)).toBe(true);
	});

	it('logout restores the signed-out state', () => {
		login('rina@tokoku.id', 'rahasia');
		logout();
		expect(get(auth)).toBe(false);
	});
});

describe('dashboard layout guard', () => {
	it('throws a redirect to /login when signed out', async () => {
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

	it('passes when signed in', async () => {
		login('rina@tokoku.id', 'rahasia');
		const { load } = await import('../../routes/(dashboard)/+layout');
		expect(() => load()).not.toThrow();
	});
});
