import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import SegmentedControl from './SegmentedControl.svelte';

const options = [
	{ value: 'day', label: 'Day' },
	{ value: 'week', label: 'Week' },
	{ value: 'month', label: 'Month' }
];

describe('SegmentedControl', () => {
	it('checks the clicked option', async () => {
		render(SegmentedControl, { props: { label: 'View', options, value: 'day' } });
		const week = screen.getByRole('radio', { name: 'Week' }) as HTMLInputElement;

		expect((screen.getByRole('radio', { name: 'Day' }) as HTMLInputElement).checked).toBe(true);

		await fireEvent.click(week);

		expect(week.checked).toBe(true);
	});
});
