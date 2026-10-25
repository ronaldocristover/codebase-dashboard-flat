import type { Member, MemberStatus, SortDir, SortKey } from '../types';

export interface MemberFilter {
	query: string;
	status: 'semua' | MemberStatus;
	joinedWithin: 'semua' | 7 | 30 | 90;
}

const HARI = 24 * 60 * 60 * 1000;

function hariSejak(iso: string, now: Date): number {
	const tanggal = new Date(`${iso}T12:00:00`).getTime();
	const acuan = new Date(now);
	acuan.setHours(12, 0, 0, 0);
	return Math.floor((acuan.getTime() - tanggal) / HARI);
}

export function filterMembers(list: Member[], filter: MemberFilter, now = new Date()): Member[] {
	const query = filter.query.trim().toLowerCase();

	return list.filter((m) => {
		const cocokQuery =
			query === '' ||
			m.nama.toLowerCase().includes(query) ||
			m.email.toLowerCase().includes(query) ||
			m.hp.includes(query);

		const cocokStatus = filter.status === 'semua' || m.status === filter.status;

		const cocokTanggal =
			filter.joinedWithin === 'semua' ||
			(() => {
				const selisih = hariSejak(m.bergabung, now);
				return selisih >= 0 && selisih <= filter.joinedWithin;
			})();

		return cocokQuery && cocokStatus && cocokTanggal;
	});
}

export function sortMembers(list: Member[], key: SortKey, dir: SortDir): Member[] {
	const faktor = dir === 'asc' ? 1 : -1;

	return [...list].sort((a, b) => {
		switch (key) {
			case 'nama':
				return a.nama.localeCompare(b.nama, 'id') * faktor;
			case 'bergabung':
				return a.bergabung.localeCompare(b.bergabung) * faktor;
			case 'totalBelanja':
				return (a.totalBelanja - b.totalBelanja) * faktor;
		}
	});
}

export function paginate<T>(
	list: T[],
	page: number,
	perPage: number
): { items: T[]; total: number; totalPages: number; from: number; to: number } {
	const total = list.length;
	const totalPages = Math.ceil(total / perPage);

	if (total === 0) {
		return { items: [], total: 0, totalPages: 0, from: 0, to: 0 };
	}

	const halaman = Math.min(Math.max(page, 1), totalPages);
	const mulai = (halaman - 1) * perPage;
	const items = list.slice(mulai, mulai + perPage);

	return {
		items,
		total,
		totalPages,
		from: mulai + 1,
		to: mulai + items.length
	};
}
