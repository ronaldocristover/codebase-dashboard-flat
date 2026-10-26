import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Member } from '#lib/types';

export const load: PageLoad = async ({ fetch, params }) => {
	const res = await fetch(`/api/members/${params.id}`);

	if (res.status === 404) error(404, 'Member not found');
	if (!res.ok) error(res.status, 'Could not load member');

	const member = (await res.json()) as Member;

	return { member };
};
