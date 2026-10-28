import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ordersForMember } from '#lib/mock/orders';
import { jsonPrivate } from '#lib/server/http';
import { logged } from '#lib/server/logger';
import { findMember } from '#lib/server/memberStore';
import { isRateLimited } from '#lib/server/rateLimit';

export const GET: RequestHandler = ({ url, params, getClientAddress }) =>
	logged('GET', url.pathname, () => {
		if (isRateLimited({ getClientAddress })) {
			return jsonPrivate({ error: 'Too many requests' }, { status: 429 });
		}

		if (!findMember(params.id)) error(404, 'Member not found');
		return jsonPrivate(ordersForMember(params.id));
	});
