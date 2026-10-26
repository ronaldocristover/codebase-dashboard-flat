import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ColorInput from './ColorInput.svelte';

describe('ColorInput', () => {
	it('keeps the swatch and the hex field in sync', async () => {
		render(ColorInput, { props: { label: 'Brand color', value: '#014baa' } });
		const picker = screen.getByLabelText('Brand color') as HTMLInputElement;
		const hex = screen.getByLabelText('Brand color hex value') as HTMLInputElement;

		expect(hex.value).toBe('#014baa');

		await fireEvent.input(picker, { target: { value: '#ff0000' } });

		expect(hex.value).toBe('#ff0000');
	});
});
