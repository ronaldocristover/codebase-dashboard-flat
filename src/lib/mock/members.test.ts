import { describe, expect, it } from 'vitest';
import { isoDaysAgo } from '../utils/format';
import { members } from './members';

describe('mock members', () => {
	it('contains 50 members with complete fields', () => {
		expect(members).toHaveLength(50);
		for (const m of members) {
			expect(m.id).toBeTruthy();
			expect(m.nama).toBeTruthy();
			expect(m.email).toMatch(/@/);
			expect(m.hp).toBeTruthy();
			expect(m.bergabung).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			expect(m.totalBelanja).toBeGreaterThan(0);
			expect(['aktif', 'nonaktif']).toContain(m.status);
		}
	});

	it('joined dates fall within the last 90 days and not in the future', () => {
		const hariIni = isoDaysAgo(0);
		const sembilanPuluhHariLalu = isoDaysAgo(90);

		for (const m of members) {
			expect(m.bergabung <= hariIni).toBe(true);
			expect(m.bergabung >= sembilanPuluhHariLalu).toBe(true);
		}
	});

	it('has at least 3 inactive members', () => {
		expect(members.filter((m) => m.status === 'nonaktif').length).toBeGreaterThanOrEqual(3);
	});
});
