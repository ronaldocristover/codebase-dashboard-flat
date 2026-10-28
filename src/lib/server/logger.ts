import { json } from '@sveltejs/kit';

export function logRequest(method: string, path: string, status: number, ms: number): void {
	console.info(JSON.stringify({ method, path, status, ms }));
}

export function logError(method: string, path: string, error: unknown): void {
	const message = error instanceof Error ? error.message : String(error);
	console.error(JSON.stringify({ method, path, message }));
}

// SvelteKit's error() throws a plain object carrying both a 4xx status and a body; anything else that happens to have a status is a server failure.
function isHttpError(error: unknown): error is { status: number; body: unknown } {
	const { status, body } = (error ?? {}) as { status?: unknown; body?: unknown };
	return typeof status === 'number' && status >= 400 && status < 500 && body != null;
}

// shortcut: one JSON line per request on stdout, no levels, sampling or request id, and logError writes the caught message verbatim with no redaction, so a message that echoes a member's email or phone ends up in the log; add redaction, stack traces and a request id when a collector consumes this.
export function logged(
	method: string,
	path: string,
	run: () => Response | Promise<Response>
): Response | Promise<Response> {
	const started = Date.now();

	const done = (response: Response): Response => {
		if (!(response instanceof Response)) throw new TypeError('handler returned no Response');

		logRequest(method, path, response.status, Date.now() - started);
		return response;
	};

	const failed = (error: unknown): Response => {
		if (isHttpError(error)) {
			logError(method, path, error);
			logRequest(method, path, error.status, Date.now() - started);
			throw error;
		}

		// The caught message can hold member data, so the client only ever sees a generic body.
		logError(method, path, error);
		logRequest(method, path, 500, Date.now() - started);
		return json({ error: 'Something went wrong' }, { status: 500 });
	};

	try {
		const result = run();
		// The second `then` catches both a rejected handler and a `done` that throws on a missing Response.
		return typeof (result as Promise<Response> | null)?.then === 'function'
			? (result as Promise<Response>).then(done).then(undefined, failed)
			: done(result as Response);
	} catch (error) {
		return failed(error);
	}
}
