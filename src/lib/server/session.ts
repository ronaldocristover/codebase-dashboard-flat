import { randomUUID } from 'node:crypto';

export const SESSION_COOKIE = 'tokoku_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

// shortcut: sessions live in process memory, so a restart logs everyone out; move to a database table when sessions must survive deploys.
const sessions = new Map<string, { userId: string; expires: number }>();

export function createSession(userId: string): string {
	const token = randomUUID();
	sessions.set(token, { userId, expires: Date.now() + SESSION_MAX_AGE * 1000 });
	return token;
}

export function readSession(token: string | undefined): { userId: string } | null {
	if (!token) return null;

	const session = sessions.get(token);
	if (!session) return null;

	if (Date.now() > session.expires) {
		sessions.delete(token);
		return null;
	}

	return { userId: session.userId };
}

export function destroySession(token: string): void {
	sessions.delete(token);
}
