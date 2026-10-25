import { describe, expect, it } from 'vitest';
import { formatAngka, formatRupiah, formatTanggal } from './format';

describe('formatRupiah', () => {
	it('memformat ribuan dengan titik', () => {
		expect(formatRupiah(245000)).toBe('Rp 245.000');
		expect(formatRupiah(1875000)).toBe('Rp 1.875.000');
	});

	it('memformat nol', () => {
		expect(formatRupiah(0)).toBe('Rp 0');
	});
});

describe('formatTanggal', () => {
	it('memformat ISO date ke tanggal Indonesia', () => {
		expect(formatTanggal('2026-10-12')).toBe('12 Okt 2026');
	});
});

describe('formatAngka', () => {
	it('memberi pemisah ribuan', () => {
		expect(formatAngka(1204)).toBe('1.204');
	});
});
