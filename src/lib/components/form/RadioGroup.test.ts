import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import RadioGroup from './RadioGroup.svelte';

const options = [
	{ value: 'aktif', label: 'Active' },
	{ value: 'nonaktif', label: 'Inactive' }
];

describe('RadioGroup', () => {
	it('gives each radio its own value and checks the selected one', async () => {
		render(RadioGroup, { props: { label: 'Status', options, value: 'aktif' } });
		const active = screen.getByRole('radio', { name: 'Active' }) as HTMLInputElement;
		const inactive = screen.getByRole('radio', { name: 'Inactive' }) as HTMLInputElement;

		expect(active.value).toBe('aktif');
		expect(inactive.value).toBe('nonaktif');
		expect(active.checked).toBe(true);

		await fireEvent.click(inactive);

		expect(inactive.checked).toBe(true);
		expect(active.checked).toBe(false);
	});
});
