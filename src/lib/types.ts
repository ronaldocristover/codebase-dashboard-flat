export type MemberStatus = 'aktif' | 'nonaktif';

export interface Member {
	id: string;
	nama: string;
	email: string;
	hp: string;
	/** ISO date, yyyy-mm-dd */
	bergabung: string;
	totalBelanja: number;
	status: MemberStatus;
}

export type SortKey = 'nama' | 'bergabung' | 'totalBelanja';
export type SortDir = 'asc' | 'desc';

export interface SalesPoint {
	label: string;
	nilai: number;
}

export interface DayCount {
	hari: string;
	jumlah: number;
}

export type OrderStatus = 'lunas' | 'dikirim' | 'menunggu';

export interface MemberOrder {
	invoice: string;
	memberId: string;
	amount: number;
	status: OrderStatus;
	/** ISO date, yyyy-mm-dd */
	date: string;
}

export interface OrderSummary {
	invoice: string;
	nama: string;
	nominal: number;
	status: OrderStatus;
}

export interface DashboardStat {
	label: string;
	nilai: string;
	delta: string;
	arah: 'naik' | 'turun';
}
