import { isoDariTanggal } from './format';

const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

export function buildMonthGrid(tahun: number, bulan: number): (string | null)[][] {
	const pertama = new Date(tahun, bulan, 1);
	const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();
	const sel: (string | null)[] = Array(pertama.getDay()).fill(null);

	for (let hari = 1; hari <= jumlahHari; hari += 1) {
		sel.push(isoDariTanggal(new Date(tahun, bulan, hari)));
	}
	while (sel.length % 7 !== 0) sel.push(null);

	const minggu: (string | null)[][] = [];
	for (let i = 0; i < sel.length; i += 7) {
		minggu.push(sel.slice(i, i + 7));
	}
	return minggu;
}

export function monthLabel(tahun: number, bulan: number): string {
	return `${MONTHS[bulan]} ${tahun}`;
}

export function toggleDate(dates: string[], iso: string): string[] {
	if (dates.includes(iso)) return dates.filter((date) => date !== iso);
	return [...dates, iso].sort();
}

export function isDateRangeValid(start: string, end: string): boolean {
	if (!start || !end) return true;
	return start <= end;
}
