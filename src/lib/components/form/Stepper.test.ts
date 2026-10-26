import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Stepper from './Stepper.svelte';

describe('Stepper', () => {
	it('increments and stops at the maximum', async () => {
		render(Stepper, { props: { label: 'Quantity', value: 5, min: 1, max: 6 } });
		const input = screen.getByRole('spinbutton', { name: 'Quantity' }) as HTMLInputElement;

		await fireEvent.click(screen.getByRole('button', { name: 'Increase value' }));
		expect(input.value).toBe('6');
		expect((screen.getByRole('button', { name: 'Increase value' }) as HTMLButtonElement).disabled).toBe(
			true
		);
	});

	it('decrements and stops at the minimum', async () => {
		render(Stepper, { props: { label: 'Quantity', value: 1, min: 1, max: 6 } });
		const input = screen.getByRole('spinbutton', { name: 'Quantity' }) as HTMLInputElement;

		expect(
			(screen.getByRole('button', { name: 'Decrease value' }) as HTMLButtonElement).disabled
		).toBe(true);
		await fireEvent.click(screen.getByRole('button', { name: 'Increase value' }));
		expect(input.value).toBe('2');
	});
});
