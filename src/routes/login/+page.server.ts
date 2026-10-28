import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/env';
import { createSession, SESSION_COOKIE, SESSION_MAX_AGE } from '#lib/server/session';
import { EMAIL } from '#lib/utils/memberValidation';
import type { Actions, PageServerLoad } from './$types';

const DEMO_EMAIL = 'rina@tokoku.id';
const DEMO_PASSWORD = 'rahasia';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(303, '/');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = typeof data.get('email') === 'string' ? (data.get('email') as string).trim() : '';
		const password = typeof data.get('password') === 'string' ? (data.get('password') as string) : '';

		const errors: Record<string, string> = {};
		if (!email) errors.email = 'Email is required';
		else if (!EMAIL.test(email)) errors.email = 'Enter a valid email';
		if (!password.trim()) errors.password = 'Password is required';

		if (Object.keys(errors).length > 0) return fail(400, { email, errors });

		// shortcut: one hardcoded demo account, replace with a users table when accounts are real.
		if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
			return fail(400, { email, errors: { password: 'Incorrect email or password' } });
		}

		cookies.set(SESSION_COOKIE, createSession('user-1'), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: SESSION_MAX_AGE
		});

		redirect(303, '/');
	}
};
