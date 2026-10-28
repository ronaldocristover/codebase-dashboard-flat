import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import UserMenu from './UserMenu.svelte';

describe('UserMenu', () => {
	it('the menu is hidden before the avatar is clicked', () => {
		render(UserMenu);
		expect(screen.queryByText('Sign out')).toBeNull();
		expect(screen.queryByText('Rina Setiawan')).toBeNull();
	});

	it('shows the menu when the avatar is clicked', async () => {
		render(UserMenu);
		await fireEvent.click(screen.getByRole('button', { name: /RS/i }));

		expect(screen.getByText('Rina Setiawan')).toBeTruthy();
		expect(screen.getByText('rina@tokoku.id')).toBeTruthy();
		expect(screen.getByText('My Profile')).toBeTruthy();
		expect(screen.getByText('Store Settings')).toBeTruthy();
		expect(screen.getByText('Sign out')).toBeTruthy();
	});

	it('closes the menu on an outside click', async () => {
		render(UserMenu);
		await fireEvent.click(screen.getByRole('button', { name: /RS/i }));
		expect(screen.getByText('Sign out')).toBeTruthy();

		await fireEvent.click(document.body);
		expect(screen.queryByText('Sign out')).toBeNull();
	});

	it('closes the menu on Escape', async () => {
		render(UserMenu);
		await fireEvent.click(screen.getByRole('button', { name: /RS/i }));
		expect(screen.getByText('Sign out')).toBeTruthy();

		await fireEvent.keyDown(document, { key: 'Escape' });
		expect(screen.queryByText('Sign out')).toBeNull();
	});

	it('sign out is a submit button in a form that posts to /logout', async () => {
		render(UserMenu);
		await fireEvent.click(screen.getByRole('button', { name: /RS/i }));

		const signOut = screen.getByRole('menuitem', { name: /Sign out/i });
		expect(signOut.getAttribute('type')).toBe('submit');

		const form = signOut.closest('form');
		expect(form?.getAttribute('method')).toBe('POST');
		expect(form?.getAttribute('action')).toBe('/logout');
	});

	it('closes the menu when the sign out form is submitted', async () => {
		render(UserMenu);
		await fireEvent.click(screen.getByRole('button', { name: /RS/i }));

		const form = screen.getByRole('menuitem', { name: /Sign out/i }).closest('form');
		expect(form).toBeTruthy();

		await fireEvent.submit(form as HTMLFormElement);
		await waitFor(() => expect(screen.queryByText('Sign out')).toBeNull());
	});
});
