import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Member, MemberOrder } from '#lib/types';

export const load: PageLoad = async ({ fetch, params }) => {
	const [memberRes, ordersRes] = await Promise.all([
		fetch(`/api/members/${params.id}`),
		fetch(`/api/members/${params.id}/orders`)
	]);

	if (memberRes.status === 404) error(404, 'Member not found');
	if (!memberRes.ok) error(memberRes.status, 'Could not load member');
	if (!ordersRes.ok) error(ordersRes.status, 'Could not load orders');

	const member = (await memberRes.json()) as Member;
	const orders = (await ordersRes.json()) as MemberOrder[];

	return { member, orders };
};
