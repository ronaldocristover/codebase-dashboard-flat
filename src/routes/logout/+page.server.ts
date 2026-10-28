import { redirect } from '@sveltejs/kit';
import { destroySession, SESSION_COOKIE } from '#lib/server/session';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	redirect(303, '/login');
};

export const actions: Actions = {
	default: ({ cookies }) => {
		const token = cookies.get(SESSION_COOKIE);
		if (token) destroySession(token);

		cookies.delete(SESSION_COOKIE, { path: '/' });

		redirect(303, '/login');
	}
};
