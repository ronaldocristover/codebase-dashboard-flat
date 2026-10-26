import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { formatTanggal, isoDariTanggal } from '#lib/utils/format';
import MultiDateInput from './MultiDateInput.svelte';

describe('MultiDateInput', () => {
	it('selects a date and removes it from the chip list', async () => {
		const now = new Date();
		const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
		const label = formatTanggal(isoDariTanggal(nextMonth));

		render(MultiDateInput, { props: { label: 'Dates' } });

		await fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
		await fireEvent.click(screen.getByRole('button', { name: label }));

		expect(screen.getByRole('button', { name: label }).getAttribute('aria-pressed')).toBe('true');
		expect(screen.getByRole('button', { name: `Remove ${label}` })).toBeTruthy();

		await fireEvent.click(screen.getByRole('button', { name: `Remove ${label}` }));
		expect(screen.queryByRole('button', { name: `Remove ${label}` })).toBeNull();
	});
});
