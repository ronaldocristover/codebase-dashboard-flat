import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import RichTextInput from './RichTextInput.svelte';

describe('RichTextInput', () => {
	it('loads the bound HTML into the editable area', async () => {
		render(RichTextInput, {
			props: { label: 'Content', value: '<p>Hello <strong>world</strong></p>' }
		});
		await tick();

		const editor = screen.getByRole('textbox', { name: 'Content' });

		expect(editor.innerHTML).toContain('<strong>world</strong>');
	});
});
