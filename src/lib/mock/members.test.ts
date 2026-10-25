import { describe, expect, it } from 'vitest';
import { members } from './members';

const HARI = 24 * 60 * 60 * 1000;

describe('mock members', () => {
	it('berisi 50 member dengan field lengkap', () => {
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

	it('tanggal bergabung berada dalam 90 hari terakhir dan tidak di masa depan', () => {
		const sekarang = Date.now();
		for (const m of members) {
			const waktu = new Date(`${m.bergabung}T12:00:00`).getTime();
			expect(sekarang - waktu).toBeGreaterThanOrEqual(0);
			expect(sekarang - waktu).toBeLessThanOrEqual(90 * HARI);
		}
	});

	it('punya minimal 3 member nonaktif', () => {
		expect(members.filter((m) => m.status === 'nonaktif').length).toBeGreaterThanOrEqual(3);
	});
});
