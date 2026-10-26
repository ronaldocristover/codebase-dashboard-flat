import type { Member } from '#lib/types';
import { members as seed } from '#lib/mock/members';
import { isoDariTanggal } from '#lib/utils/format';
import type { MemberInput } from '#lib/utils/memberValidation';

export type { MemberInput };

// shortcut: in-memory store, resets on restart; replace with a database when persistence is needed.
let members: Member[] = copyMembers(seed);

function copyMembers(list: Member[]): Member[] {
	return list.map((member) => ({ ...member }));
}

function nextMemberId(): string {
	const highest = members.reduce((max, member) => {
		const value = Number(member.id.replace(/\D/g, ''));
		return Number.isFinite(value) ? Math.max(max, value) : max;
	}, 0);
	return `MBR-${String(highest + 1).padStart(4, '0')}`;
}

export function listMembers(): Member[] {
	return copyMembers(members);
}

export function findMember(id: string): Member | undefined {
	const member = members.find((item) => item.id === id);
	return member ? { ...member } : undefined;
}

export function createMember(input: MemberInput): Member {
	const member: Member = {
		id: nextMemberId(),
		nama: input.nama.trim(),
		email: input.email.trim(),
		hp: input.hp.trim(),
		bergabung: isoDariTanggal(new Date()),
		totalBelanja: 0,
		status: input.status
	};
	members.push(member);
	return { ...member };
}

export function updateMember(id: string, input: Partial<MemberInput>): Member | undefined {
	const index = members.findIndex((item) => item.id === id);
	if (index === -1) return undefined;

	const current = members[index];
	const updated: Member = {
		...current,
		nama: input.nama ?? current.nama,
		email: input.email ?? current.email,
		hp: input.hp ?? current.hp,
		status: input.status ?? current.status
	};
	members[index] = updated;
	return { ...updated };
}

export function resetMembers(): void {
	members = copyMembers(seed);
}
