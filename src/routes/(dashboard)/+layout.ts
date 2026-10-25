import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { auth } from '#lib/stores/auth';

export const ssr = false;

export function load() {
	if (!get(auth)) {
		redirect(303, '/login');
	}
}
