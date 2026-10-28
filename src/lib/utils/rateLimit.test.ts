// @vitest-environment node
// Lives in utils/ because vite.config.ts excludes src/lib/server/** from Vitest.
import { describe, expect, it } from 'vitest';
import { checkRateLimit, RATE_LIMIT, RATE_WINDOW_MS } from '#lib/server/rateLimit';

describe('checkRateLimit', () => {
	it('allows RATE_LIMIT calls with the same key', () => {
		const key = 'allow-100';
		const results = Array.from({ length: RATE_LIMIT }, () => checkRateLimit(key, 0));

		expect(results.every((result) => result.ok)).toBe(true);
		expect(results[RATE_LIMIT - 1].remaining).toBe(0);
	});

	it('rejects the call after the limit', () => {
		const key = 'reject-101';
		for (let i = 0; i < RATE_LIMIT; i += 1) checkRateLimit(key, 0);

		expect(checkRateLimit(key, 0)).toEqual({ ok: false, remaining: 0 });
	});

	it('does not affect a different key', () => {
		for (let i = 0; i < RATE_LIMIT; i += 1) checkRateLimit('noisy-key', 0);

		expect(checkRateLimit('quiet-key', 0).ok).toBe(true);
	});

	it('allows the key again once the window passes', () => {
		const key = 'window';
		for (let i = 0; i < RATE_LIMIT; i += 1) checkRateLimit(key, 0);
		expect(checkRateLimit(key, 0).ok).toBe(false);

		expect(checkRateLimit(key, RATE_WINDOW_MS)).toEqual({ ok: true, remaining: RATE_LIMIT - 1 });
	});
});
