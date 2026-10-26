import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Combobox from './Combobox.svelte';

const options = [
	{ value: 'jkt', label: 'Jakarta' },
	{ value: 'bdg', label: 'Bandung' },
	{ value: 'sby', label: 'Surabaya' }
];

describe('Combobox', () => {
	it('filters options and selects with the mouse', async () => {
		render(Combobox, { props: { label: 'City', options, value: '' } });
		const input = screen.getByRole('combobox', { name: 'City' }) as HTMLInputElement;

		await fireEvent.focus(input);
		await fireEvent.input(input, { target: { value: 'ban' } });

		expect(screen.queryByRole('option', { name: 'Jakarta' })).toBeNull();
		await fireEvent.click(screen.getByRole('option', { name: 'Bandung' }));

		expect(input.value).toBe('Bandung');
		expect(input.getAttribute('aria-expanded')).toBe('false');
	});

	it('selects with the keyboard and closes on Escape', async () => {
		render(Combobox, { props: { label: 'City', options, value: '' } });
		const input = screen.getByRole('combobox', { name: 'City' }) as HTMLInputElement;

		await fireEvent.focus(input);
		await fireEvent.keyDown(input, { key: 'ArrowDown' });
		await fireEvent.keyDown(input, { key: 'Enter' });

		expect(input.value).toBe('Bandung');

		await fireEvent.focus(input);
		expect(input.getAttribute('aria-expanded')).toBe('true');
		await fireEvent.keyDown(input, { key: 'Escape' });
		expect(input.getAttribute('aria-expanded')).toBe('false');
	});
});
