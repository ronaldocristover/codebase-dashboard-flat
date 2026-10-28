import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import UserMenu from './UserMenu.svelte';

const user = { id: 'user-1', email: 'rina@tokoku.id' };

describe('UserMenu', () => {
	it('the menu is hidden before the avatar is clicked', () => {
		render(UserMenu, { props: { user } });
		expect(screen.queryByText('Sign out')).toBeNull();
		expect(screen.queryByText('Rina')).toBeNull();
	});

	it('shows the menu when the avatar is clicked', async () => {
		render(UserMenu, { props: { user } });
		await fireEvent.click(screen.getByRole('button', { name: 'R' }));

		expect(screen.getByText('Rina')).toBeTruthy();
		expect(screen.getByText('rina@tokoku.id')).toBeTruthy();
		expect(screen.getByText('My Profile')).toBeTruthy();
		expect(screen.getByText('Store Settings')).toBeTruthy();
		expect(screen.getByText('Sign out')).toBeTruthy();
	});

	it('shows the signed-in user instead of a hardcoded identity', async () => {
		render(UserMenu, { props: { user: { id: 'user-2', email: 'budi@tokoku.id' } } });

		await fireEvent.click(screen.getByRole('button', { name: 'B' }));

		expect(screen.getByText('Budi')).toBeTruthy();
		expect(screen.getByText('budi@tokoku.id')).toBeTruthy();
		expect(screen.queryByText('Rina')).toBeNull();
	});

	it('derives two initials from a two-part email', () => {
		render(UserMenu, { props: { user: { id: 'user-1', email: 'rina.setiawan@tokoku.id' } } });

		expect(screen.getByRole('button', { name: 'RS' })).toBeTruthy();
	});

	it('closes the menu on an outside click', async () => {
		render(UserMenu, { props: { user } });
		await fireEvent.click(screen.getByRole('button', { name: 'R' }));
		expect(screen.getByText('Sign out')).toBeTruthy();

		await fireEvent.click(document.body);
		expect(screen.queryByText('Sign out')).toBeNull();
	});

	it('closes the menu on Escape', async () => {
		render(UserMenu, { props: { user } });
		await fireEvent.click(screen.getByRole('button', { name: 'R' }));
		expect(screen.getByText('Sign out')).toBeTruthy();

		await fireEvent.keyDown(document, { key: 'Escape' });
		expect(screen.queryByText('Sign out')).toBeNull();
	});

	it('sign out is a submit button in a form that posts to /logout', async () => {
		render(UserMenu, { props: { user } });
		await fireEvent.click(screen.getByRole('button', { name: 'R' }));

		const signOut = screen.getByRole('menuitem', { name: /Sign out/i });
		expect(signOut.getAttribute('type')).toBe('submit');

		const form = signOut.closest('form');
		expect(form?.getAttribute('method')).toBe('POST');
		expect(form?.getAttribute('action')).toBe('/logout');
		expect(form?.getAttribute('role')).toBe('none');
	});
});
