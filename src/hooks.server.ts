import type { Handle } from '@sveltejs/kit/hooks';
import { jsonPrivate } from '#lib/server/http';
import { logRequest } from '#lib/server/logger';
import { readSession, SESSION_COOKIE } from '#lib/server/session';

// shortcut: demo accounts are a hardcoded list, not a users table; replace when accounts must persist.
const users = [{ id: 'user-1', email: 'rina@tokoku.id' }];

export const handle: Handle = ({ event, resolve }) => {
	const session = readSession(event.cookies.get(SESSION_COOKIE));
	event.locals.user = session ? (users.find((user) => user.id === session.userId) ?? null) : null;

	// SvelteKit matches routes on the decoded path, so the guard reads the matched route id.
	// A raw pathname check lets /%61pi/members through.
	if (!event.locals.user && event.route.id?.startsWith('/api')) {
		logRequest(event.request.method, event.url.pathname, 401, 0);
		return jsonPrivate({ error: 'Unauthorized' }, { status: 401 });
	}

	return resolve(event);
};
