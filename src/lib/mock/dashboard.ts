import type {
	ChannelRevenue,
	CustomerSegment,
	DashboardStat,
	DayCount,
	FunnelStep,
	OrderSummary,
	SalesPoint,
	StockAlert,
	TopProduct
} from '../types';
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

export const funnelSteps: FunnelStep[] = [
	{ label: 'Sessions', visitors: 24800 },
	{ label: 'Product views', visitors: 9640 },
	{ label: 'Added to cart', visitors: 2410 },
	{ label: 'Checkout started', visitors: 1105 },
	{ label: 'Paid', visitors: 842 }
];

export const customerMix: CustomerSegment[] = [
	{ label: 'New customers', count: 1284 },
	{ label: 'Returning customers', count: 964 }
];

export const channelRevenue: ChannelRevenue[] = [
	{ channel: 'Online store', amount: 48600000 },
	{ channel: 'Marketplace', amount: 31200000 },
	{ channel: 'Social commerce', amount: 12400000 },
	{ channel: 'Offline store', amount: 6800000 }
];

export const topProducts: TopProduct[] = [
	{ name: 'Aurora Linen Shirt', category: 'Apparel', units: 412, revenue: 18540000 },
	{ name: 'Nusa Canvas Tote', category: 'Bags', units: 368, revenue: 11040000 },
	{ name: 'Rimba Ceramic Mug', category: 'Home', units: 296, revenue: 4440000 },
	{ name: 'Sagara Sandals', category: 'Footwear', units: 244, revenue: 7320000 },
	{ name: 'Senja Cotton Scarf', category: 'Accessories', units: 208, revenue: 3120000 }
];

export const stockAlerts: StockAlert[] = [
	{ name: 'Nusa Canvas Tote', sku: 'BAG-014', stock: 4, threshold: 10 },
	{ name: 'Rimba Ceramic Mug', sku: 'HOM-032', stock: 0, threshold: 12 },
	{ name: 'Aurora Linen Shirt', sku: 'APP-021', stock: 6, threshold: 15 },
	{ name: 'Sagara Sandals', sku: 'FTW-008', stock: 9, threshold: 10 }
];
