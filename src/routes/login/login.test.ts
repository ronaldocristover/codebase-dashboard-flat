import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

vi.mock('$app/forms', () => ({ enhance: () => {} }));
vi.mock('$app/env', () => ({ dev: true }));

import { dev } from '$app/env';
import { SESSION_COOKIE, SESSION_MAX_AGE } from '#lib/server/session';
import LoginPage from './+page.svelte';
import { actions, load } from './+page.server';

type ActionEvent = Parameters<NonNullable<typeof actions.default>>[0];

// The real action only reads request.formData() and cookies.set().
function event(fields: Record<string, string> = {}) {
	const formData = new FormData();
	for (const [name, value] of Object.entries(fields)) formData.append(name, value);

	const set = vi.fn();
	const request = new Request('http://localhost/login', { method: 'POST', body: formData });

	return { event: { request, cookies: { set } } as unknown as ActionEvent, set };
}

async function thrown(panggil: () => unknown): Promise<{ status: number; location?: string }> {
	try {
		await panggil();
	} catch (err) {
		return err as { status: number; location?: string };
	}
	throw new Error('expected a redirect to be thrown');
}

describe('login action', () => {
	it('rejects an empty form', async () => {
		const { event: ev, set } = event();
		const result = (await actions.default!(ev)) as { status: number; data: any };

		expect(result.status).toBe(400);
		expect(result.data.errors.email).toBe('Email is required');
		expect(result.data.errors.password).toBe('Password is required');
		expect(set).not.toHaveBeenCalled();
	});

	it('rejects an invalid email format', async () => {
		const { event: ev } = event({ email: 'bukan-email', password: 'rahasia' });
		const result = (await actions.default!(ev)) as { status: number; data: any };

		expect(result.status).toBe(400);
		expect(result.data.errors.email).toBe('Enter a valid email');
		expect(result.data.errors.password).toBeUndefined();
	});

	it('rejects a wrong password without setting a cookie', async () => {
		const { event: ev, set } = event({ email: 'rina@tokoku.id', password: 'salah' });
		const result = (await actions.default!(ev)) as { status: number; data: any };

		expect(result.status).toBe(400);
		expect(result.data.errors.password).toBe('Incorrect email or password');
		expect(set).not.toHaveBeenCalled();
	});

	it('sets the session cookie and redirects on correct credentials', async () => {
		const { event: ev, set } = event({ email: ' rina@tokoku.id ', password: 'rahasia' });
		const result = await thrown(() => actions.default!(ev));

		expect(result.status).toBe(303);
		expect(result.location).toBe('/');
		expect(set).toHaveBeenCalledTimes(1);
		expect(set.mock.calls[0][0]).toBe(SESSION_COOKIE);
		expect(typeof set.mock.calls[0][1]).toBe('string');
		expect(set.mock.calls[0][2]).toMatchObject({
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: SESSION_MAX_AGE
		});
		expect(dev).toBe(true);
		expect(set.mock.calls[0][2].secure).toBe(false);
	});

	it('redirects a signed-in visitor away from the page', async () => {
		const result = await thrown(() =>
			load({ locals: { user: { id: 'user-1', email: 'rina@tokoku.id' } } } as never)
		);

		expect(result.status).toBe(303);
		expect(result.location).toBe('/');
	});

	it('lets a signed-out visitor see the page', () => {
		expect(load({ locals: { user: null } } as never)).toBeUndefined();
	});
});

describe('login page', () => {
	it('links error messages to their inputs', () => {
		render(LoginPage, {
			props: { form: { errors: { email: 'Email is required', password: 'Password is required' } } }
		});

		const errorEmail = screen.getByText('Email is required');
		const errorPassword = screen.getByText('Password is required');
		expect(errorEmail.getAttribute('role')).toBe('alert');
		expect(errorPassword.getAttribute('role')).toBe('alert');
		expect(errorEmail.id).toBe('email-error');
		expect(errorPassword.id).toBe('password-error');

		const email = screen.getByLabelText('Email');
		const password = screen.getByLabelText('Password');
		expect(email.getAttribute('aria-describedby')).toBe('email-error');
		expect(password.getAttribute('aria-describedby')).toBe('password-error');
		expect(email.getAttribute('aria-invalid')).toBe('true');
		expect(password.getAttribute('aria-invalid')).toBe('true');
	});

	it('the forgot password and sign up placeholders are buttons, not links', () => {
		render(LoginPage, { props: { form: null } });

		expect(screen.getByRole('button', { name: 'Forgot password?' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Sign up' })).toBeTruthy();
		expect(screen.queryByRole('link', { name: 'Forgot password?' })).toBeNull();
		expect(screen.queryByRole('link', { name: 'Sign up' })).toBeNull();
	});
});
