import { describe, expect, it } from 'vitest';
import { parseMemberSheet, TEMPLATE_ROWS } from './memberExcel';

const HEADER = ['Name', 'Email', 'Phone', 'Status'];

describe('parseMemberSheet', () => {
	it('maps a valid sheet to member inputs', () => {
		const result = parseMemberSheet([
			HEADER,
			['Siti Aminah', 'siti@example.com', '081234567890', 'Active'],
			['Budi', 'budi@example.com', '081298765432', 'Inactive']
		]);

		expect(result.errors).toEqual([]);
		expect(result.rows).toEqual([
			{
				row: 2,
				input: { nama: 'Siti Aminah', email: 'siti@example.com', hp: '081234567890', status: 'aktif' }
			},
			{
				row: 3,
				input: { nama: 'Budi', email: 'budi@example.com', hp: '081298765432', status: 'nonaktif' }
			}
		]);
	});

	it('accepts Indonesian headers and status values', () => {
		const result = parseMemberSheet([
			['Nama', 'Email', 'HP', 'Status'],
			['Siti', 'siti@example.com', '081234567890', 'aktif']
		]);

		expect(result.errors).toEqual([]);
		expect(result.rows[0].input.status).toBe('aktif');
	});

	it('skips blank rows and ignores extra columns', () => {
		const result = parseMemberSheet([
			[...HEADER, 'Joined'],
			['', '', '', '', ''],
			['Siti', 'siti@example.com', '081234567890', 'Active', '2026-01-01']
		]);

		expect(result.rows).toHaveLength(1);
		expect(result.errors).toEqual([]);
	});

	it('reports invalid rows with their spreadsheet row number', () => {
		const result = parseMemberSheet([
			HEADER,
			['', '', '', ''],
			['Siti', 'not-an-email', '12', 'Active']
		]);

		expect(result.rows).toEqual([]);
		expect(result.errors).toEqual([
			{
				row: 3,
				message: 'Enter a valid email · Enter a valid phone number'
			}
		]);
	});

	it('rejects a sheet without the required columns', () => {
		const result = parseMemberSheet([
			['Name', 'Email'],
			['Siti', 'siti@example.com']
		]);

		expect(result.rows).toEqual([]);
		expect(result.errors).toEqual([
			{ row: 1, message: 'Missing column: Phone' },
			{ row: 1, message: 'Missing column: Status' }
		]);
	});

	it('keeps every template dummy row importable', () => {
		const result = parseMemberSheet([HEADER, ...TEMPLATE_ROWS]);

		expect(TEMPLATE_ROWS).toHaveLength(5);
		expect(result.errors).toEqual([]);
		expect(result.rows).toHaveLength(5);
	});
});
