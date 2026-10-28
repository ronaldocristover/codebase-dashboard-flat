import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Member } from '#lib/types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/members?perPage=100');
	if (!res.ok) error(res.status, 'Could not load members');

	// shortcut: the page filters and paginates client-side, so it needs the whole list; move it to API paging past 100 members.
	const { members } = (await res.json()) as { members: Member[] };

	return { members };
};
