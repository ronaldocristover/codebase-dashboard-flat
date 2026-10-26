import type { DashboardStat, DayCount, OrderSummary, SalesPoint } from '../types';
import { formatTanggalSingkat, isoDaysAgo } from '../utils/format';

export const stats: DashboardStat[] = [
	{
		label: 'Sales today',
		nilai: 'Rp 4.8M',
		delta: '▲ 12% from yesterday',
		arah: 'naik'
	},
	{ label: 'New orders', nilai: '132', delta: '▲ 8% from yesterday', arah: 'naik' },
	{ label: 'Active products', nilai: '248', delta: '▼ 3 out of stock', arah: 'turun' },
	{ label: 'Total members', nilai: '1.204', delta: '▲ 24 new members', arah: 'naik' }
];

const POLA_PENJUALAN = [
	0.42, 0.5, 0.46, 0.58, 0.54, 0.62, 0.6, 0.68, 0.64, 0.72, 0.7, 0.78, 0.74, 0.82, 0.8, 0.86, 0.83,
	0.9, 0.88, 0.94, 0.91, 0.97, 0.93, 1, 0.96, 0.9, 0.98, 0.95, 0.92, 0.99
];

export const salesTrend: SalesPoint[] = POLA_PENJUALAN.map((rasio, i) => {
	const iso = isoDaysAgo(POLA_PENJUALAN.length - 1 - i);
	return {
		label: formatTanggalSingkat(iso),
		nilai: Math.round(2800000 + rasio * 3600000)
	};
});

export const ordersWeek: DayCount[] = [
	{ hari: 'Mon', jumlah: 86 },
	{ hari: 'Tue', jumlah: 104 },
	{ hari: 'Wed', jumlah: 92 },
	{ hari: 'Thu', jumlah: 118 },
	{ hari: 'Fri', jumlah: 98 },
	{ hari: 'Sat', jumlah: 132 },
	{ hari: 'Sun', jumlah: 112 }
];

export const recentOrders: OrderSummary[] = [
	{ invoice: 'INV-2041', nama: 'Siti Aminah', nominal: 245000, status: 'lunas' },
	{ invoice: 'INV-2040', nama: 'Budi Santoso', nominal: 128000, status: 'dikirim' },
	{ invoice: 'INV-2039', nama: 'Andi Wijaya', nominal: 89000, status: 'menunggu' },
	{ invoice: 'INV-2038', nama: 'Rina Marlina', nominal: 412000, status: 'lunas' },
	{ invoice: 'INV-2037', nama: 'Dewi Kartika', nominal: 176000, status: 'dikirim' }
];
