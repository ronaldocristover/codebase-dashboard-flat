import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { goto } = vi.hoisted(() => ({ goto: vi.fn() }));
vi.mock('$app/navigation', () => ({ goto }));

import UserMenu from './UserMenu.svelte';

describe('UserMenu', () => {
	beforeEach(() => {
		goto.mockClear();
	});

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

	it('sign out button goes to the login page', async () => {
		render(UserMenu);
		await fireEvent.click(screen.getByRole('button', { name: /RS/i }));
		await fireEvent.click(screen.getByText('Sign out'));

		expect(goto).toHaveBeenCalledWith('/login');
		expect(screen.queryByText('Sign out')).toBeNull();
	});
});
