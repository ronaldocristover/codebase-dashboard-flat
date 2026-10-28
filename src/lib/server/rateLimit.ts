export const RATE_LIMIT = 100;
export const RATE_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_KEYS = 10_000;

// shortcut: fixed-window counter in process memory with no eviction of live keys, per instance, keyed on the raw client address; behind a reverse proxy without ADDRESS_HEADER every user shares the proxy IP in one bucket; move to Redis keyed on the forwarded address when a second instance serves traffic or a proxy sits in front.
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, now = Date.now()): { ok: boolean; remaining: number } {
	const entry = hits.get(key);

	if (!entry || now >= entry.resetAt) {
		if (hits.size >= RATE_LIMIT_MAX_KEYS) {
			for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
		}
		hits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
		return { ok: true, remaining: RATE_LIMIT - 1 };
	}

	entry.count += 1;
	return { ok: entry.count <= RATE_LIMIT, remaining: Math.max(0, RATE_LIMIT - entry.count) };
}

export function rateLimitSize(): number {
	return hits.size;
}

export function isRateLimited(event: { getClientAddress?: () => string }): boolean {
	try {
		return !checkRateLimit(event.getClientAddress?.() ?? 'unknown').ok;
	} catch {
		// An adapter without address support throws; failing open beats 429-ing every request.
		return false;
	}
}
