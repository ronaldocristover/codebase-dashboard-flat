import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Slider from './Slider.svelte';

describe('Slider', () => {
	it('shows the current value with its suffix', async () => {
		render(Slider, { props: { label: 'Storage used', value: 40, min: 0, max: 100, suffix: '%' } });
		const input = screen.getByRole('slider', { name: 'Storage used' }) as HTMLInputElement;

		expect(screen.getByText('40%')).toBeTruthy();

		await fireEvent.input(input, { target: { value: '75' } });

		expect(screen.getByText('75%')).toBeTruthy();
	});
});
