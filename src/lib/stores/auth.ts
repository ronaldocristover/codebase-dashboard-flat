import { writable } from 'svelte/store';

const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// shortcut: login in-memory, hilang saat refresh; upgrade ke localStorage bila perlu.
export const auth = writable(false);

export function login(email: string, password: string): boolean {
	if (!POLA_EMAIL.test(email.trim()) || password.trim() === '') {
		return false;
	}

	auth.set(true);
	return true;
}

export function logout(): void {
	auth.set(false);
}
