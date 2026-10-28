import type { RequestHandler } from './$types';
import { jsonPrivate } from '#lib/server/http';
import { logged } from '#lib/server/logger';
import { findMember, updateMember, type MemberInput } from '#lib/server/memberStore';
import { isRateLimited } from '#lib/server/rateLimit';
import { validateMemberInput } from '#lib/utils/memberValidation';

export const GET: RequestHandler = ({ url, params, getClientAddress }) =>
	logged('GET', url.pathname, () => {
		if (isRateLimited({ getClientAddress })) {
			return jsonPrivate({ error: 'Too many requests' }, { status: 429 });
		}

		const member = findMember(params.id);
		if (!member) return jsonPrivate({ message: 'Member not found' }, { status: 404 });
		return jsonPrivate(member);
	});

export const PATCH: RequestHandler = ({ url, params, request, getClientAddress }) =>
	logged('PATCH', url.pathname, async () => {
		if (isRateLimited({ getClientAddress })) {
			return jsonPrivate({ error: 'Too many requests' }, { status: 429 });
		}

		const existing = findMember(params.id);
		if (!existing) return jsonPrivate({ message: 'Member not found' }, { status: 404 });

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return jsonPrivate({ errors: { body: 'Invalid JSON' } }, { status: 400 });
		}

		const patch = (body && typeof body === 'object' ? body : {}) as Partial<MemberInput>;
		const merged: MemberInput = {
			nama: patch.nama ?? existing.nama,
			email: patch.email ?? existing.email,
			hp: patch.hp ?? existing.hp,
			status: patch.status ?? existing.status
		};

		const errors = validateMemberInput(merged);
		if (Object.keys(errors).length > 0) return jsonPrivate({ errors }, { status: 400 });

		return jsonPrivate(updateMember(params.id, merged));
	});
