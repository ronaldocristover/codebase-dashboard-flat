// @vitest-environment node
// Lives in utils/ because vite.config.ts excludes src/lib/server/** from Vitest.
import { describe, expect, it } from 'vitest';
import { jsonPrivate } from '#lib/server/http';

describe('jsonPrivate', () => {
	it('adds the private cache header and keeps the headers the caller passed', async () => {
		const response = jsonPrivate(
			{ ok: true },
			{ status: 201, headers: { 'x-request-id': 'req-1' } }
		);

		expect(response.status).toBe(201);
		expect(response.headers.get('cache-control')).toBe('private, no-store');
		expect(response.headers.get('x-request-id')).toBe('req-1');
		expect(await response.json()).toEqual({ ok: true });
	});

	it('overrides a cache-control the caller passed', () => {
		const response = jsonPrivate({ ok: true }, { headers: { 'cache-control': 'public, max-age=60' } });

		expect(response.headers.get('cache-control')).toBe('private, no-store');
	});
});
