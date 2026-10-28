import { json } from '@sveltejs/kit';

export function logRequest(method: string, path: string, status: number, ms: number): void {
	console.info(JSON.stringify({ method, path, status, ms }));
}

export function logError(method: string, path: string, error: unknown): void {
	const message = error instanceof Error ? error.message : String(error);
	console.error(JSON.stringify({ method, path, message }));
}

function isHttpError(error: unknown): boolean {
	// SvelteKit's error() throws a plain object with a status; those are deliberate and must reach the framework.
	return typeof (error as { status?: unknown } | null | undefined)?.status === 'number';
}

// shortcut: one JSON line per request on stdout, no levels, sampling or request id; swap in a real logger when the output must be shipped to a collector or traced across services.
export function logged(
	method: string,
	path: string,
	run: () => Response | Promise<Response>
): Response | Promise<Response> {
	const started = Date.now();

	const done = (response: Response): Response => {
		logRequest(method, path, response.status, Date.now() - started);
		return response;
	};

	const failed = (error: unknown): Response => {
		if (isHttpError(error)) throw error;

		// The caught message can hold member data, so the client only ever sees a generic body.
		logError(method, path, error);
		return json({ error: 'Something went wrong' }, { status: 500 });
	};

	try {
		const result = run();
		return typeof (result as Promise<Response> | null)?.then === 'function'
			? (result as Promise<Response>).then(done, failed)
			: done(result as Response);
	} catch (error) {
		return failed(error);
	}
}
