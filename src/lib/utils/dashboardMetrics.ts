import type { FunnelStep } from '#lib/types';

export interface FunnelRow extends FunnelStep {
	/** Bar width relative to the first step, 0-100. */
	width: number;
	/** Conversion from the previous step, null on the first step. */
	rate: number | null;
}

function persen(bagian: number, total: number): number {
	if (total <= 0) return 0;
	return Math.round((bagian / total) * 1000) / 10;
}

export function buildFunnel(steps: FunnelStep[]): { rows: FunnelRow[]; overall: number } {
	const first = steps[0]?.visitors ?? 0;
	const last = steps.at(-1)?.visitors ?? 0;

	const rows = steps.map((step, index) => ({
		...step,
		width: persen(step.visitors, first),
		rate: index === 0 ? null : persen(step.visitors, steps[index - 1].visitors)
	}));

	return { rows, overall: persen(last, first) };
}

export function sharePercentages(values: number[]): number[] {
	const total = values.reduce((sum, value) => sum + value, 0);
	return values.map((value) => persen(value, total));
}
