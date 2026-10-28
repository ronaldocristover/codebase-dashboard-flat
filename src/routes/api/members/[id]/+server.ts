import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logged } from '#lib/server/logger';
import { findMember, updateMember, type MemberInput } from '#lib/server/memberStore';
import { isRateLimited } from '#lib/server/rateLimit';
import { validateMemberInput } from '#lib/utils/memberValidation';

export const GET: RequestHandler = ({ url, params, getClientAddress }) =>
	logged('GET', url.pathname, () => {
		if (isRateLimited({ getClientAddress })) {
			return json({ error: 'Too many requests' }, { status: 429 });
		}

		const member = findMember(params.id);
		if (!member) error(404, 'Member not found');
		return json(member);
	});

export const PATCH: RequestHandler = ({ url, params, request, getClientAddress }) =>
	logged('PATCH', url.pathname, async () => {
		if (isRateLimited({ getClientAddress })) {
			return json({ error: 'Too many requests' }, { status: 429 });
		}

		const existing = findMember(params.id);
		if (!existing) error(404, 'Member not found');

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return json({ errors: { body: 'Invalid JSON' } }, { status: 400 });
		}

		const patch = (body && typeof body === 'object' ? body : {}) as Partial<MemberInput>;
		const merged: MemberInput = {
			nama: patch.nama ?? existing.nama,
			email: patch.email ?? existing.email,
			hp: patch.hp ?? existing.hp,
			status: patch.status ?? existing.status
		};

		const errors = validateMemberInput(merged);
		if (Object.keys(errors).length > 0) return json({ errors }, { status: 400 });

		return json(updateMember(params.id, merged));
	});
