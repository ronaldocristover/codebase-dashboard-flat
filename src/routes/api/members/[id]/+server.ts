import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { findMember, updateMember, type MemberInput } from '#lib/server/memberStore';
import { validateMemberInput } from '#lib/utils/memberValidation';

export const GET: RequestHandler = ({ params }) => {
	const member = findMember(params.id);
	if (!member) error(404, 'Member not found');
	return json(member);
};

export const PATCH: RequestHandler = async ({ params, request }) => {
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
};
