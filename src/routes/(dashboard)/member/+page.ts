import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Member } from '#lib/types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/members');
	if (!res.ok) error(res.status, 'Could not load members');

	const members = (await res.json()) as Member[];

	return { members };
};
