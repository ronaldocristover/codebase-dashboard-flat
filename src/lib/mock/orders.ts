import type { MemberOrder, OrderStatus } from '#lib/types';
import { isoDaysAgo } from '#lib/utils/format';
import { members } from '#lib/mock/members';

const STATUS: OrderStatus[] = ['lunas', 'dikirim', 'menunggu'];

// Index 0 has no orders; every index i has i % 7 orders (0-6).
const byMember = new Map<string, MemberOrder[]>(
	members.map((member, i) => [
		member.id,
		Array.from({ length: i % 7 }, (_, j) => ({
			invoice: `INV-${String(i * 10 + j + 1).padStart(4, '0')}`,
			memberId: member.id,
			amount: 89000 + ((i * 137 + j * 211) % 50) * 10000,
			status: STATUS[(i + j) % STATUS.length],
			date: isoDaysAgo(((i * 5 + j * 11) % 75) + j)
		}))
	])
);

export function ordersForMember(memberId: string): MemberOrder[] {
	return (byMember.get(memberId) ?? []).map((order) => ({ ...order }));
}
