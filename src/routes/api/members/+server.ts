import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createMember, listMembers, type MemberInput } from '#lib/server/memberStore';
import { validateMemberInput } from '#lib/utils/memberValidation';

export const GET: RequestHandler = () => json(listMembers());

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ errors: { body: 'Invalid JSON' } }, { status: 400 });
	}

	const input = (body && typeof body === 'object' ? body : {}) as Partial<
		Record<keyof MemberInput, unknown>
	>;
	const errors = validateMemberInput(input);
	if (Object.keys(errors).length > 0) return json({ errors }, { status: 400 });

	return json(createMember(input as MemberInput), { status: 201 });
};
