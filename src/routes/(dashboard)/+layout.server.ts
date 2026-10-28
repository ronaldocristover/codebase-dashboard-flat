import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, setHeaders }) => {
	if (!locals.user) redirect(303, '/login');

	// The server-rendered HTML carries member PII, so no shared cache may store it.
	setHeaders({ 'cache-control': 'private, no-store' });

	return { user: locals.user };
};
