// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { actions } from './+page.server';
import { createSession, readSession, SESSION_COOKIE } from '#lib/server/session';

type Event = Parameters<NonNullable<typeof actions.default>>[0];

function fakeEvent(token: string | undefined) {
	const hapus = vi.fn();
	const event = {
		cookies: { get: vi.fn(() => token), delete: hapus }
	} as unknown as Event;

	return { event, hapus };
}

function run(event: Event) {
	try {
		(actions.default as (event: Event) => unknown)(event);
	} catch (error) {
		return error as { status: number; location: string };
	}

	throw new Error('expected the action to redirect');
}

describe('logout action', () => {
	it('destroys the session, clears the cookie, and redirects to /login', () => {
		const token = createSession('user-1');
		const { event, hapus } = fakeEvent(token);

		expect(run(event)).toMatchObject({ status: 303, location: '/login' });
		expect(hapus).toHaveBeenCalledWith(SESSION_COOKIE, { path: '/' });
		expect(readSession(token)).toBeNull();
	});

	it('still redirects when there is no session token', () => {
		const { event, hapus } = fakeEvent(undefined);

		expect(run(event)).toMatchObject({ status: 303, location: '/login' });
		expect(hapus).toHaveBeenCalledWith(SESSION_COOKIE, { path: '/' });
	});
});
