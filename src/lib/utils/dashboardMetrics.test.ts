import { describe, expect, it } from 'vitest';
import { buildFunnel, sharePercentages } from './dashboardMetrics';

describe('buildFunnel', () => {
	it('sizes each bar against the first step and rates each step against the previous one', () => {
		const { rows, overall } = buildFunnel([
			{ label: 'Sessions', visitors: 1000 },
			{ label: 'Cart', visitors: 500 },
			{ label: 'Paid', visitors: 100 }
		]);

		expect(rows.map((row) => row.width)).toEqual([100, 50, 10]);
		expect(rows.map((row) => row.rate)).toEqual([null, 50, 20]);
		expect(overall).toBe(10);
	});

	it('returns zeroes instead of NaN when the funnel is empty or starts at zero', () => {
		expect(buildFunnel([])).toEqual({ rows: [], overall: 0 });

		const { rows, overall } = buildFunnel([
			{ label: 'Sessions', visitors: 0 },
			{ label: 'Paid', visitors: 0 }
		]);
		expect(rows.map((row) => row.width)).toEqual([0, 0]);
		expect(rows.map((row) => row.rate)).toEqual([null, 0]);
		expect(overall).toBe(0);
	});
});

describe('sharePercentages', () => {
	it('turns counts into a one-decimal share of the total', () => {
		expect(sharePercentages([1284, 964])).toEqual([57.1, 42.9]);
		expect(sharePercentages([1, 1, 2])).toEqual([25, 25, 50]);
	});

	it('returns zeroes when there is nothing to divide', () => {
		expect(sharePercentages([0, 0])).toEqual([0, 0]);
	});
});
