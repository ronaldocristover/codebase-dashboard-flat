import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import OtpInput from './OtpInput.svelte';

function boxes(): HTMLInputElement[] {
	return Array.from({ length: 6 }, (_, index) => screen.getByLabelText(`Digit ${index + 1}`));
}

describe('OtpInput', () => {
	it('advances after a digit and clears backwards with Backspace', async () => {
		render(OtpInput, { props: { label: 'Verification code' } });
		const [first, second] = boxes();

		await fireEvent.input(first, { target: { value: '4' } });

		expect(first.value).toBe('4');
		expect(document.activeElement).toBe(second);

		await fireEvent.keyDown(second, { key: 'Backspace' });

		expect(first.value).toBe('');
		expect(document.activeElement).toBe(first);
	});

	it('fills every cell from a pasted code', async () => {
		render(OtpInput, { props: { label: 'Verification code' } });

		await fireEvent.paste(boxes()[0], {
			clipboardData: { getData: () => '123456' }
		});

		expect(boxes().map((box) => box.value)).toEqual(['1', '2', '3', '4', '5', '6']);
	});
});
