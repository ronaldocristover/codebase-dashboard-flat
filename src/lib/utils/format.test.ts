import { describe, expect, it } from 'vitest';
import { formatAngka, formatRupiah, formatTanggal } from './format';

describe('formatRupiah', () => {
	it('formats thousands with dots', () => {
		expect(formatRupiah(245000)).toBe('Rp 245.000');
		expect(formatRupiah(1875000)).toBe('Rp 1.875.000');
	});

	it('formats zero', () => {
		expect(formatRupiah(0)).toBe('Rp 0');
	});
});

describe('formatTanggal', () => {
	it('formats an ISO date into a readable date label', () => {
		expect(formatTanggal('2026-10-12')).toBe('12 Oct 2026');
	});
});

describe('formatAngka', () => {
	it('adds thousands separators', () => {
		expect(formatAngka(1204)).toBe('1.204');
	});
});
