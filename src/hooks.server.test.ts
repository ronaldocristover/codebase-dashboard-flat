// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { handle } from './hooks.server';
import { createSession, SESSION_COOKIE } from '#lib/server/session';

function event(pathname: string, routeId: string | null, token?: string) {
	return {
		url: new URL(`http://localhost${pathname}`),
		route: { id: routeId },
		request: new Request(`http://localhost${pathname}`),
		cookies: { get: (name: string) => (name === SESSION_COOKIE ? token : undefined) },
		locals: {} as App.Locals
	} as unknown as Parameters<typeof handle>[0]['event'];
}

const resolve = (async () => new Response('ok')) as unknown as Parameters<typeof handle>[0]['resolve'];

afterEach(() => {
	vi.restoreAllMocks();
});

describe('api guard', () => {
	it('rejects an unauthenticated request to /api/members', async () => {
		const response = (await handle({
			event: event('/api/members', '/api/members'),
			resolve
		})) as Response;

		expect(response.status).toBe(401);
		expect(response.headers.get('content-type')).toContain('application/json');
		expect(response.headers.get('cache-control')).toBe('private, no-store');
		expect(await response.json()).toEqual({ error: 'Unauthorized' });
	});

	it('logs the rejected request', async () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});

		await handle({ event: event('/api/members', '/api/members'), resolve });

		expect(JSON.parse(info.mock.calls[0][0] as string)).toMatchObject({
			method: 'GET',
			path: '/api/members',
			status: 401
		});
	});

	it('rejects a percent-encoded path that SvelteKit routes to the api', async () => {
		const response = (await handle({
			event: event('/ap%69/members', '/api/members'),
			resolve
		})) as Response;

		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({ error: 'Unauthorized' });
	});

	it('clears locals.user and rejects an unknown session token', async () => {
		const fake = event('/api/members', '/api/members', 'not-a-real-token');

		const response = (await handle({ event: fake, resolve })) as Response;

		expect(fake.locals.user).toBeNull();
		expect(response.status).toBe(401);
	});

	it('lets a signed-in request reach the route', async () => {
		const response = (await handle({
			event: event('/api/members', '/api/members', createSession('user-1')),
			resolve
		})) as Response;

		expect(response.status).toBe(200);
		expect(await response.text()).toBe('ok');
	});

	it('lets an unauthenticated page request through to the route', async () => {
		const fake = event('/login', '/login');

		const response = (await handle({ event: fake, resolve })) as Response;

		expect(fake.locals.user).toBeNull();
		expect(response.status).toBe(200);
	});
});
