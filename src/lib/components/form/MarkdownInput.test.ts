import { fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import MarkdownInput from './MarkdownInput.svelte';

describe('MarkdownInput', () => {
	it('wraps the selected text with the Bold toolbar button', async () => {
		render(MarkdownInput, { props: { label: 'Notes', value: 'hello' } });
		const textarea = screen.getByLabelText('Notes') as HTMLTextAreaElement;
		textarea.setSelectionRange(0, 5);

		await fireEvent.click(screen.getByRole('button', { name: 'Bold' }));
		await tick();

		expect(textarea.value).toBe('**hello**');
	});

	it('renders the Markdown preview safely', async () => {
		render(MarkdownInput, {
			props: { label: 'Notes', value: '## Title\n\n**Bold** and <script>alert(1)</script>' }
		});

		await fireEvent.click(screen.getByRole('tab', { name: 'Preview' }));

		expect(screen.getByRole('heading', { name: 'Title' })).toBeTruthy();
		expect(screen.getByText('Bold')).toBeTruthy();
		expect(document.querySelector('script')).toBeNull();
	});
});
