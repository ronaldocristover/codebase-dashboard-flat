const BULAN = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'Mei',
	'Jun',
	'Jul',
	'Agu',
	'Sep',
	'Okt',
	'Nov',
	'Des'
];

export function formatAngka(n: number): string {
	return n.toLocaleString('id-ID');
}

export function formatRupiah(n: number): string {
	return `Rp ${formatAngka(n)}`;
}

export function formatTanggal(iso: string): string {
	const [tahun, bulan, hari] = iso.split('-').map(Number);
	return `${hari} ${BULAN[bulan - 1]} ${tahun}`;
}

export function formatTanggalSingkat(iso: string): string {
	const [, bulan, hari] = iso.split('-').map(Number);
	return `${hari} ${BULAN[bulan - 1]}`;
}

export function isoDariTanggal(date: Date): string {
	const tahun = date.getFullYear();
	const bulan = String(date.getMonth() + 1).padStart(2, '0');
	const hari = String(date.getDate()).padStart(2, '0');
	return `${tahun}-${bulan}-${hari}`;
}

export function isoDaysAgo(days: number, now = new Date()): string {
	const date = new Date(now);
	date.setHours(12, 0, 0, 0);
	date.setDate(date.getDate() - days);
	return isoDariTanggal(date);
}
