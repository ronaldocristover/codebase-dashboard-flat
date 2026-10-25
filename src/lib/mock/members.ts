import type { Member } from '../types';
import { isoDaysAgo } from '../utils/format';

const DEPAN = [
	'Siti',
	'Budi',
	'Andi',
	'Rina',
	'Dewi',
	'Agus',
	'Fitri',
	'Joko',
	'Maya',
	'Rudi',
	'Lestari',
	'Bayu',
	'Indra',
	'Nia',
	'Yusuf',
	'Wulan',
	'Reza',
	'Tari',
	'Fajar',
	'Anisa'
];

const BELAKANG = [
	'Aminah',
	'Santoso',
	'Wijaya',
	'Marlina',
	'Kartika',
	'Pratama',
	'Handayani',
	'Saputra',
	'Anggraini',
	'Nugroho',
	'Ramadhan',
	'Susanti',
	'Firmansyah',
	'Puspita',
	'Hidayat',
	'Rahmawati',
	'Wibowo',
	'Syahputra',
	'Maharani',
	'Suryana'
];

const NONAKTIF = new Set([2, 7, 13, 19, 26, 31, 38, 44, 47]);

export const members: Member[] = Array.from({ length: 50 }, (_, i) => {
	const depan = DEPAN[i % DEPAN.length];
	const belakang = BELAKANG[(i * 7) % BELAKANG.length];
	const nama = `${depan} ${belakang}`;
	const email = `${depan.toLowerCase()}.${belakang.toLowerCase()}${i}@mail.com`;
	const hp = `08${String(11 + (i % 80)).slice(0, 2)}-${String(1000 + i * 37).slice(0, 4)}-${String(
		2000 + i * 53
	).slice(0, 4)}`;
	const bergabung = isoDaysAgo(Math.round((i * 89) / 49));

	return {
		id: `MBR-${String(i + 1).padStart(4, '0')}`,
		nama,
		email,
		hp,
		bergabung,
		totalBelanja: 89000 + ((i * 431000) % 4200000),
		status: NONAKTIF.has(i) ? 'nonaktif' : 'aktif'
	};
});
