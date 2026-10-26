import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import TagInput from './TagInput.svelte';

describe('TagInput', () => {
	it('adds tags on Enter and ignores duplicates', async () => {
		render(TagInput, { props: { label: 'Skills', tags: ['Svelte'] } });
		const input = screen.getByLabelText('Skills');

		await fireEvent.input(input, { target: { value: 'TypeScript' } });
		await fireEvent.keyDown(input, { key: 'Enter' });

		expect(screen.getAllByRole('listitem')).toHaveLength(2);
		expect(screen.getByText('TypeScript')).toBeTruthy();

		await fireEvent.input(input, { target: { value: 'Svelte' } });
		await fireEvent.keyDown(input, { key: 'Enter' });

		expect(screen.getAllByRole('listitem')).toHaveLength(2);
	});

	it('removes a tag with its button and the last tag with Backspace', async () => {
		render(TagInput, { props: { label: 'Skills', tags: ['Svelte', 'TypeScript'] } });
		const input = screen.getByLabelText('Skills');

		await fireEvent.click(screen.getByRole('button', { name: 'Remove Svelte' }));
		expect(screen.queryByText('Svelte')).toBeNull();

		await fireEvent.keyDown(input, { key: 'Backspace' });
		expect(screen.queryByText('TypeScript')).toBeNull();
	});
});
