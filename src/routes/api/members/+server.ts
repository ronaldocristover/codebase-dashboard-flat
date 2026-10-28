import type { RequestHandler } from './$types';
import { jsonPrivate } from '#lib/server/http';
import { createMember, listMembers, type MemberInput } from '#lib/server/memberStore';
import { logged } from '#lib/server/logger';
import { isRateLimited } from '#lib/server/rateLimit';
import { validateMemberInput } from '#lib/utils/memberValidation';

const DEFAULT_PER_PAGE = 20;
const MAX_PER_PAGE = 100;

function parseIntOr(raw: string | null, fallback: number): number {
	const value = Number.parseInt(raw ?? '', 10);
	return Number.isFinite(value) ? value : fallback;
}

export const GET: RequestHandler = ({ url, getClientAddress }) =>
	logged('GET', url.pathname, () => {
		if (isRateLimited({ getClientAddress })) {
			return jsonPrivate({ error: 'Too many requests' }, { status: 429 });
		}

		const page = Math.max(1, parseIntOr(url.searchParams.get('page'), 1));
		const perPage = Math.min(
			MAX_PER_PAGE,
			Math.max(1, parseIntOr(url.searchParams.get('perPage'), DEFAULT_PER_PAGE))
		);

		const all = listMembers();
		const total = all.length;
		const start = (page - 1) * perPage;

		return jsonPrivate({
			members: all.slice(start, start + perPage),
			pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) }
		});
	});

export const POST: RequestHandler = ({ url, request, getClientAddress }) =>
	logged('POST', url.pathname, async () => {
		if (isRateLimited({ getClientAddress })) {
			return jsonPrivate({ error: 'Too many requests' }, { status: 429 });
		}

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return jsonPrivate({ errors: { body: 'Invalid JSON' } }, { status: 400 });
		}

		const input = (body && typeof body === 'object' ? body : {}) as Partial<
			Record<keyof MemberInput, unknown>
		>;
		const errors = validateMemberInput(input);
		if (Object.keys(errors).length > 0) return jsonPrivate({ errors }, { status: 400 });

		return jsonPrivate(createMember(input as MemberInput), { status: 201 });
	});
