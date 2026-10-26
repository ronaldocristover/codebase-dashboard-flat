import { fireEvent, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import Tooltip from './Tooltip.svelte';

const children = createRawSnippet(() => ({
	render: () => '<button type="button">Hover me</button>'
}));

describe('Tooltip', () => {
	it('shows on focus and hides when focus leaves', async () => {
		render(Tooltip, { props: { text: 'Saved to your account', children } });

		const tooltip = screen.getByRole('tooltip');
		expect(tooltip.className).toContain('opacity-0');

		const child = screen.getByRole('button', { name: 'Hover me' });

		await fireEvent.focusIn(child);
		expect(tooltip.className).toContain('opacity-100');
		expect(tooltip.style.transform).toContain('translateX');

		await fireEvent.focusOut(child);
		expect(tooltip.className).toContain('opacity-0');
	});
});
