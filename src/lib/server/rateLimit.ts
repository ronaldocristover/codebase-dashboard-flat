export const RATE_LIMIT = 100;
export const RATE_WINDOW_MS = 60_000;

// shortcut: fixed-window counter in process memory, per instance; move to Redis when more than one instance serves traffic.
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, now = Date.now()): { ok: boolean; remaining: number } {
	const entry = hits.get(key);

	if (!entry || now >= entry.resetAt) {
		hits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
		return { ok: true, remaining: RATE_LIMIT - 1 };
	}

	entry.count += 1;
	return { ok: entry.count <= RATE_LIMIT, remaining: Math.max(0, RATE_LIMIT - entry.count) };
}

export function isRateLimited(event: { getClientAddress?: () => string }): boolean {
	const key =
		typeof event.getClientAddress === 'function' ? event.getClientAddress() : 'unknown';
	return !checkRateLimit(key).ok;
}
