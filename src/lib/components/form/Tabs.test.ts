import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Tabs from './Tabs.svelte';

const tabs = [
	{ value: 'overview', label: 'Overview' },
	{ value: 'pricing', label: 'Pricing' }
];

describe('Tabs', () => {
	it('selects a tab on click and with the arrow keys', async () => {
		render(Tabs, { props: { tabs, value: 'overview', label: 'Sections' } });

		expect(screen.getByRole('tab', { name: 'Overview' }).getAttribute('aria-selected')).toBe('true');

		await fireEvent.click(screen.getByRole('tab', { name: 'Pricing' }));
		expect(screen.getByRole('tab', { name: 'Pricing' }).getAttribute('aria-selected')).toBe('true');

		await fireEvent.keyDown(screen.getByRole('tablist', { name: 'Sections' }), { key: 'ArrowLeft' });
		expect(screen.getByRole('tab', { name: 'Overview' }).getAttribute('aria-selected')).toBe('true');
	});
});
