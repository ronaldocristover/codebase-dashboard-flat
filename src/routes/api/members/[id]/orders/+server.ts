import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ordersForMember } from '#lib/mock/orders';
import { findMember } from '#lib/server/memberStore';

export const GET: RequestHandler = ({ params }) => {
	if (!findMember(params.id)) error(404, 'Member not found');
	return json(ordersForMember(params.id));
};
