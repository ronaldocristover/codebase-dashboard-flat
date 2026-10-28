// @vitest-environment node
// Lives in utils/ because vite.config.ts excludes src/lib/server/** from Vitest.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSession, destroySession, readSession, SESSION_MAX_AGE } from '#lib/server/session';

describe('session', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('reads back a session it created', () => {
		const token = createSession('user-1');
		expect(readSession(token)).toEqual({ userId: 'user-1' });
	});

	it('rejects an unknown token', () => {
		expect(readSession('nope')).toBeNull();
		expect(readSession(undefined)).toBeNull();
	});

	it('rejects a destroyed token', () => {
		const token = createSession('user-2');
		destroySession(token);
		expect(readSession(token)).toBeNull();
	});

	it('issues a distinct token per login', () => {
		expect(createSession('user-3')).not.toBe(createSession('user-3'));
	});

	it('expires a session once SESSION_MAX_AGE has passed', () => {
		const token = createSession('user-4');

		vi.useFakeTimers();
		vi.setSystemTime(Date.now() + (SESSION_MAX_AGE + 1) * 1000);

		expect(readSession(token)).toBeNull();
	});
});
