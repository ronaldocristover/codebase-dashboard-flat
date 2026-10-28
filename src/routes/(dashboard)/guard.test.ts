// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { load } from './+layout.server';

type User = App.Locals['user'];

function event(user: User) {
	const setHeaders = vi.fn();
	return {
		event: { locals: { user }, setHeaders } as unknown as Parameters<typeof load>[0],
		setHeaders
	};
}

describe('dashboard layout guard', () => {
	it('redirects a signed-out visitor to /login', () => {
		let caught: unknown;
		try {
			load(event(null).event);
		} catch (error) {
			caught = error;
		}

		expect(caught).toMatchObject({ status: 303, location: '/login' });
	});

	it('returns the signed-in user', () => {
		const user = { id: 'user-1', email: 'rina@tokoku.id' };

		expect(load(event(user).event)).toEqual({ user });
	});

	it('marks the rendered dashboard private and uncacheable', () => {
		const { event: fake, setHeaders } = event({ id: 'user-1', email: 'rina@tokoku.id' });

		load(fake);

		expect(setHeaders).toHaveBeenCalledWith({ 'cache-control': 'private, no-store' });
	});
});
