import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import PasswordInput from './PasswordInput.svelte';

describe('PasswordInput', () => {
	it('toggles between masked and visible text', async () => {
		render(PasswordInput, { props: { label: 'Password', value: 'secret' } });
		const input = screen.getByLabelText('Password');

		expect(input.getAttribute('type')).toBe('password');

		await fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
		expect(input.getAttribute('type')).toBe('text');
		expect(screen.getByRole('button', { name: 'Hide password' })).toBeTruthy();

		await fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
		expect(input.getAttribute('type')).toBe('password');
	});
});
