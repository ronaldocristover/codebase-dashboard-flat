import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import type { Member, MemberOrder } from '#lib/types';
import { formatRupiah, formatTanggal } from '#lib/utils/format';
import MemberDetailPage from './[id]/+page.svelte';

const member: Member = {
	id: 'member-siti',
	nama: 'Siti Aminah',
	email: 'siti@example.com',
	hp: '081234567890',
	bergabung: '2026-09-12',
	totalBelanja: 425000,
	status: 'aktif'
};

const orders: MemberOrder[] = [
	{
		invoice: 'INV-1001',
		memberId: member.id,
		amount: 125000,
		status: 'lunas',
		date: '2026-10-20'
	},
	{
		invoice: 'INV-1002',
		memberId: member.id,
		amount: 300000,
		status: 'dikirim',
		date: '2026-10-22'
	}
];

describe('member detail page', () => {
	it('shows the profile, summary, and order rows', () => {
		const { container } = render(MemberDetailPage, { props: { data: { member, orders } } });

		expect(screen.getByRole('heading', { name: 'Siti Aminah' })).toBeTruthy();
		expect(screen.getByText('siti@example.com')).toBeTruthy();
		expect(screen.getByText('081234567890')).toBeTruthy();
		expect(screen.getByText(new RegExp(formatTanggal(member.bergabung)))).toBeTruthy();
		expect(screen.getByText('Active')).toBeTruthy();

		expect(screen.getByRole('link', { name: 'Members' }).getAttribute('href')).toBe('/member');
		expect(screen.getByRole('link', { name: 'Edit' }).getAttribute('href')).toBe(
			`/member/${member.id}/edit`
		);

		expect(screen.getByText('Total Spend').parentElement?.textContent).toContain(
			formatRupiah(member.totalBelanja)
		);
		expect(screen.getByText('Orders').parentElement?.textContent).toContain('2');
		expect(screen.getByText('Last Order').parentElement?.textContent).toContain(
			formatTanggal('2026-10-22')
		);

		expect(container.querySelectorAll('tbody tr')).toHaveLength(2);
		expect(screen.getByText('#INV-1001')).toBeTruthy();
		expect(screen.getByText('#INV-1002')).toBeTruthy();
		expect(screen.getByText(formatRupiah(125000))).toBeTruthy();
		expect(screen.getByText(formatRupiah(300000))).toBeTruthy();
		expect(screen.getByText('Paid')).toBeTruthy();
		expect(screen.getByText('Shipped')).toBeTruthy();
	});

	it('shows the empty orders state', () => {
		const { container } = render(MemberDetailPage, {
			props: { data: { member, orders: [] } }
		});

		expect(screen.getAllByText('No orders yet')).toHaveLength(2);
		expect(screen.getByText('This member has not placed an order.')).toBeTruthy();
		expect(container.querySelectorAll('tbody tr')).toHaveLength(1);
	});
});
