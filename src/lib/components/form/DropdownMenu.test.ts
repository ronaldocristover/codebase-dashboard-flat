import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import DropdownMenu from './DropdownMenu.svelte';

const items = [
	{ label: 'Edit member', value: 'edit' },
	{ label: 'Delete member', value: 'delete', danger: true }
];

describe('DropdownMenu', () => {
	it('opens, selects an item, and closes', async () => {
		const onSelect = vi.fn();
		render(DropdownMenu, { props: { label: 'Actions', items, onSelect } });

		await fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
		expect(screen.getByRole('menu')).toBeTruthy();

		await fireEvent.click(screen.getByRole('menuitem', { name: 'Edit member' }));
		expect(onSelect).toHaveBeenCalledWith('edit');
		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('closes on Escape and outside click', async () => {
		render(DropdownMenu, { props: { label: 'Actions', items } });

		await fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
		await fireEvent.keyDown(document, { key: 'Escape' });
		expect(screen.queryByRole('menu')).toBeNull();

		await fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
		await fireEvent.click(document.body);
		expect(screen.queryByRole('menu')).toBeNull();
	});
});
