import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ordersForMember } from '#lib/mock/orders';
import { findMember } from '#lib/server/memberStore';
import { isRateLimited } from '#lib/server/rateLimit';

export const GET: RequestHandler = ({ params, getClientAddress }) => {
	if (isRateLimited({ getClientAddress })) {
		return json({ error: 'Too many requests' }, { status: 429 });
	}

	if (!findMember(params.id)) error(404, 'Member not found');
	return json(ordersForMember(params.id));
};
