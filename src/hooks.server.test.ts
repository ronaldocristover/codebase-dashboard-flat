// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { handle } from './hooks.server';
import { createSession, SESSION_COOKIE } from '#lib/server/session';

function event(pathname: string, token?: string) {
	return {
		url: new URL(`http://localhost${pathname}`),
		cookies: { get: (name: string) => (name === SESSION_COOKIE ? token : undefined) },
		locals: {} as App.Locals
	} as unknown as Parameters<typeof handle>[0]['event'];
}

const resolve = (async () => new Response('ok')) as unknown as Parameters<typeof handle>[0]['resolve'];

describe('api guard', () => {
	it('rejects an unauthenticated request to /api/members', async () => {
		const response = (await handle({ event: event('/api/members'), resolve })) as Response;

		expect(response.status).toBe(401);
		expect(response.headers.get('content-type')).toContain('application/json');
		expect(await response.json()).toEqual({ error: 'Unauthorized' });
	});

	it('lets a signed-in request reach the route', async () => {
		const response = (await handle({
			event: event('/api/members', createSession('user-1')),
			resolve
		})) as Response;

		expect(response.status).toBe(200);
		expect(await response.text()).toBe('ok');
	});
});
