import { json } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { readSession, SESSION_COOKIE } from '#lib/server/session';

// shortcut: demo accounts are a hardcoded list, not a users table; replace when accounts must persist.
const users = [{ id: 'user-1', email: 'rina@tokoku.id' }];

export const handle: Handle = ({ event, resolve }) => {
	const session = readSession(event.cookies.get(SESSION_COOKIE));
	event.locals.user = session ? (users.find((user) => user.id === session.userId) ?? null) : null;

	if (!event.locals.user && event.url.pathname.startsWith('/api/')) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	return resolve(event);
};
