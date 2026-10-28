import { json } from '@sveltejs/kit';

// Member responses are per-user and change on POST/PATCH, so no shared cache may store them.
// shortcut: a thrown error(404) bypasses this helper and keeps SvelteKit's default headers; its body carries no member data.
export function jsonPrivate(body: unknown, init: ResponseInit = {}): Response {
	const headers = new Headers(init.headers);
	headers.set('cache-control', 'private, no-store');

	return json(body, { ...init, headers });
}
