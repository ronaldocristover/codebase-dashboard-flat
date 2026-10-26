import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';

const { goto } = vi.hoisted(() => ({ goto: vi.fn() }));
vi.mock('$app/navigation', () => ({ goto }));

import { auth, login, logout } from '#lib/stores/auth';
import LoginPage from './+page.svelte';

describe('login page', () => {
	beforeEach(() => {
		goto.mockClear();
		logout();
	});

	it('shows the logo and form', () => {
		render(LoginPage);
		expect(screen.getByText('TokoKu')).toBeTruthy();
		expect(screen.getByLabelText('Email')).toBeTruthy();
		expect(screen.getByLabelText('Password')).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Sign in to Dashboard' })).toBeTruthy();
	});

	it('rejects an empty submit with error messages', async () => {
		render(LoginPage);
		await fireEvent.click(screen.getByRole('button', { name: 'Sign in to Dashboard' }));

		expect(screen.getByText('Email is required')).toBeTruthy();
		expect(screen.getByText('Password is required')).toBeTruthy();
		expect(goto).not.toHaveBeenCalled();
	});

	it('links error messages to their inputs', async () => {
		render(LoginPage);
		await fireEvent.click(screen.getByRole('button', { name: 'Sign in to Dashboard' }));

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
		render(LoginPage);

		expect(screen.getByRole('button', { name: 'Forgot password?' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Sign up' })).toBeTruthy();
		expect(screen.queryByRole('link', { name: 'Forgot password?' })).toBeNull();
		expect(screen.queryByRole('link', { name: 'Sign up' })).toBeNull();
	});

	it('rejects an invalid email format', async () => {
		render(LoginPage);

		await fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'bukan-email' } });
		await fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'rahasia' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Sign in to Dashboard' }));

		expect(screen.getByText('Enter a valid email')).toBeTruthy();
		expect(goto).not.toHaveBeenCalled();
	});

	it('a valid login enters the dashboard', async () => {
		render(LoginPage);

		await fireEvent.input(screen.getByLabelText('Email'), {
			target: { value: 'rina@tokoku.id' }
		});
		await fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'rahasia' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Sign in to Dashboard' }));

		expect(get(auth)).toBe(true);
		expect(goto).toHaveBeenCalledWith('/');
	});

	it('an already signed-in user is redirected to the dashboard', async () => {
		login('rina@tokoku.id', 'rahasia');
		render(LoginPage);

		await waitFor(() => expect(goto).toHaveBeenCalledWith('/'));
	});
});
