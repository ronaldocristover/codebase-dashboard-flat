import { describe, expect, it } from 'vitest';
import { buildMonthGrid, isDateRangeValid, monthLabel, toggleDate } from './dateSelection';

describe('buildMonthGrid', () => {
	it('starts on the correct weekday and includes every day of a leap February', () => {
		const grid = buildMonthGrid(2024, 1);
		const days = grid.flat().filter((cell): cell is string => cell !== null);

		expect(days).toHaveLength(29);
		expect(grid[0].slice(0, 4)).toEqual([null, null, null, null]);
		expect(grid[0][4]).toBe('2024-02-01');
		expect(days.at(-1)).toBe('2024-02-29');
		expect(grid.every((week) => week.length === 7)).toBe(true);
	});
});

describe('monthLabel', () => {
	it('uses the full English month name', () => {
		expect(monthLabel(2026, 9)).toBe('October 2026');
	});
});

describe('toggleDate', () => {
	it('adds, sorts, and removes ISO dates', () => {
		expect(toggleDate([], '2026-10-26')).toEqual(['2026-10-26']);
		expect(toggleDate(['2026-10-26'], '2026-10-01')).toEqual(['2026-10-01', '2026-10-26']);
		expect(toggleDate(['2026-10-01', '2026-10-26'], '2026-10-26')).toEqual(['2026-10-01']);
	});
});

describe('isDateRangeValid', () => {
	it('rejects an end date before the start date', () => {
		expect(isDateRangeValid('2026-10-01', '2026-10-26')).toBe(true);
		expect(isDateRangeValid('2026-10-26', '2026-10-01')).toBe(false);
		expect(isDateRangeValid('', '2026-10-01')).toBe(true);
	});
});
