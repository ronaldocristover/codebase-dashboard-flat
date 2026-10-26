import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Rating from './Rating.svelte';

describe('Rating', () => {
	it('sets the score with a click and with the arrow keys', async () => {
		render(Rating, { props: { label: 'Product rating', value: 2 } });

		expect(screen.getByRole('radio', { name: '2 stars' }).getAttribute('aria-checked')).toBe('true');

		await fireEvent.click(screen.getByRole('radio', { name: '4 stars' }));
		expect(screen.getByRole('radio', { name: '4 stars' }).getAttribute('aria-checked')).toBe('true');

		await fireEvent.keyDown(screen.getByRole('radiogroup', { name: 'Product rating' }), {
			key: 'ArrowRight'
		});
		expect(screen.getByRole('radio', { name: '5 stars' }).getAttribute('aria-checked')).toBe('true');
	});
});
