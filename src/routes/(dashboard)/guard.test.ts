// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { load } from './+layout.server';

type User = App.Locals['user'];

function event(user: User) {
	return { locals: { user } } as unknown as Parameters<typeof load>[0];
}

describe('dashboard layout guard', () => {
	it('redirects a signed-out visitor to /login', () => {
		let caught: unknown;
		try {
			load(event(null));
		} catch (error) {
			caught = error;
		}

		expect(caught).toMatchObject({ status: 303, location: '/login' });
	});

	it('returns the signed-in user', () => {
		const user = { id: 'user-1', email: 'rina@tokoku.id' };

		expect(load(event(user))).toEqual({ user });
	});
});
