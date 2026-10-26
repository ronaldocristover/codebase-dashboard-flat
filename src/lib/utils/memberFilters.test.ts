import { describe, expect, it } from 'vitest';
import type { Member, MemberStatus, SortDir, SortKey } from '../types';
import { filterMembers, paginate, sortMembers } from './memberFilters';

function member(partial: Partial<Member> & { id: string }): Member {
	return {
		nama: 'Nama Umum',
		email: 'umum@mail.com',
		hp: '0812-0000-0000',
		bergabung: '2026-10-01',
		totalBelanja: 100000,
		status: 'aktif' as MemberStatus,
		...partial
	};
}

const contoh: Member[] = [
	member({
		id: '1',
		nama: 'Siti Aminah',
		email: 'siti@mail.com',
		hp: '0812-1111-2233',
		bergabung: '2026-10-22',
		totalBelanja: 2450000
	}),
	member({
		id: '2',
		nama: 'Budi Santoso',
		email: 'budi@mail.com',
		hp: '0813-2222-4455',
		bergabung: '2026-10-01',
		totalBelanja: 940000,
		status: 'nonaktif'
	}),
	member({
		id: '3',
		nama: 'Andi Wijaya',
		email: 'andi@mail.com',
		hp: '0857-3333-6677',
		bergabung: '2026-07-30',
		totalBelanja: 1875000,
		status: 'nonaktif'
	})
];

const SEMUA = { query: '', status: 'semua' as const, joinedWithin: 'semua' as const };
const NOW = new Date('2026-10-24T12:00:00');

describe('filterMembers', () => {
	it('finds a name ignoring case', () => {
		expect(filterMembers(contoh, { ...SEMUA, query: 'SITI' }, NOW)).toHaveLength(1);
		expect(filterMembers(contoh, { ...SEMUA, query: 'siti' }, NOW)[0].id).toBe('1');
	});

	it('finds by email and phone number', () => {
		expect(filterMembers(contoh, { ...SEMUA, query: 'budi@mail' }, NOW)[0].id).toBe('2');
		expect(filterMembers(contoh, { ...SEMUA, query: '3333-6677' }, NOW)[0].id).toBe('3');
	});

	it('filters by status', () => {
		const hasil = filterMembers(contoh, { ...SEMUA, status: 'nonaktif' }, NOW);
		expect(hasil.map((m) => m.id)).toEqual(['2', '3']);
	});

	it('filters the joined range relative to now', () => {
		expect(filterMembers(contoh, { ...SEMUA, joinedWithin: 7 }, NOW).map((m) => m.id)).toEqual([
			'1'
		]);
		expect(filterMembers(contoh, { ...SEMUA, joinedWithin: 30 }, NOW).map((m) => m.id)).toEqual([
			'1',
			'2'
		]);
		expect(filterMembers(contoh, { ...SEMUA, joinedWithin: 90 }, NOW)).toHaveLength(3);
	});

	it('combines query, status, and range with AND', () => {
		expect(
			filterMembers(contoh, { query: 'andi', status: 'nonaktif', joinedWithin: 90 }, NOW)
		).toHaveLength(1);
		expect(
			filterMembers(contoh, { query: 'siti', status: 'nonaktif', joinedWithin: 90 }, NOW)
		).toHaveLength(0);
		expect(
			filterMembers(contoh, { query: 'zzzz', status: 'semua', joinedWithin: 'semua' }, NOW)
		).toHaveLength(0);
	});
});

describe('sortMembers', () => {
	const urutkan = (key: SortKey, dir: SortDir) => sortMembers(contoh, key, dir).map((m) => m.id);

	it('sorts totalBelanja numerically', () => {
		expect(urutkan('totalBelanja', 'asc')).toEqual(['2', '3', '1']);
		expect(urutkan('totalBelanja', 'desc')).toEqual(['1', '3', '2']);
	});

	it('sorts by name and joined date', () => {
		expect(urutkan('nama', 'asc')).toEqual(['3', '2', '1']);
		expect(urutkan('bergabung', 'desc')).toEqual(['1', '2', '3']);
	});

	it('does not mutate the original array', () => {
		const asli = [...contoh];
		sortMembers(contoh, 'totalBelanja', 'desc');
		expect(contoh).toEqual(asli);
	});
});

describe('paginate', () => {
	const daftar = Array.from({ length: 25 }, (_, i) => i + 1);

	it('slices 10 rows per page', () => {
		const halaman2 = paginate(daftar, 2, 10);
		expect(halaman2.items).toHaveLength(10);
		expect(halaman2.from).toBe(11);
		expect(halaman2.to).toBe(20);
		expect(halaman2.totalPages).toBe(3);
		expect(halaman2.total).toBe(25);
	});

	it('handles an empty list', () => {
		expect(paginate([], 1, 10)).toEqual({ items: [], total: 0, totalPages: 0, from: 0, to: 0 });
	});

	it('clamps the page to the available range', () => {
		expect(paginate(daftar, 99, 10).items).toHaveLength(5);
		expect(paginate(daftar, 0, 10).from).toBe(1);
	});
});
