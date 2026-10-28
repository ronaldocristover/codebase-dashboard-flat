import { json } from '@sveltejs/kit';

// Member responses are per-user and change on POST/PATCH, so no shared cache may store them.
export function jsonPrivate(body: unknown, init: ResponseInit = {}): Response {
	return json(body, {
		...init,
		headers: { ...init.headers, 'cache-control': 'private, no-store' }
	});
}
