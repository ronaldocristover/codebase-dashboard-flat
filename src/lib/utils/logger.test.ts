// @vitest-environment node
// Lives in utils/ because vite.config.ts excludes src/lib/server/** from Vitest.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { json } from '@sveltejs/kit';
import { logError, logged, logRequest } from '#lib/server/logger';

afterEach(() => {
	vi.restoreAllMocks();
});

function firstLine(spy: ReturnType<typeof vi.spyOn>): unknown {
	return JSON.parse(spy.mock.calls[0][0] as string);
}

describe('logRequest', () => {
	it('writes one line with method, path, status and duration', () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});

		logRequest('GET', '/api/members', 200, 12);

		expect(info).toHaveBeenCalledTimes(1);
		expect(firstLine(info)).toEqual({
			method: 'GET',
			path: '/api/members',
			status: 200,
			ms: 12
		});
	});
});

describe('logError', () => {
	it('writes the message of an Error', () => {
		const err = vi.spyOn(console, 'error').mockImplementation(() => {});

		logError('PATCH', '/api/members/MBR-0001', new Error('store exploded'));

		expect(err).toHaveBeenCalledTimes(1);
		expect(firstLine(err)).toEqual({
			method: 'PATCH',
			path: '/api/members/MBR-0001',
			message: 'store exploded'
		});
	});

	it('does not throw on a non-Error value and stringifies it', () => {
		const err = vi.spyOn(console, 'error').mockImplementation(() => {});

		expect(() => {
			logError('GET', '/a', null);
			logError('GET', '/a', undefined);
			logError('GET', '/a', 'boom');
			logError('GET', '/a', { code: 7 });
		}).not.toThrow();

		expect(err.mock.calls.map(([line]) => JSON.parse(line as string).message)).toEqual([
			'null',
			'undefined',
			'boom',
			'[object Object]'
		]);
	});
});

describe('logged', () => {
	it('logs the response status and returns the response untouched', async () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});

		const response = await logged('GET', '/api/members', () => json({ ok: true }));

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ ok: true });
		expect(info.mock.calls[0][0]).toContain('"path":"/api/members"');
	});

	it('turns an unexpected throw into a generic 500 without leaking the message', async () => {
		vi.spyOn(console, 'info').mockImplementation(() => {});
		const err = vi.spyOn(console, 'error').mockImplementation(() => {});

		const response = await logged('GET', '/api/members', () => {
			throw new Error('secret: member MBR-0001 email a@b.c');
		});

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({ error: 'Something went wrong' });
		expect(err.mock.calls[0][0]).toContain('secret: member MBR-0001');
	});

	it('logs a 500 as a request line so a failed request still counts', async () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});

		await logged('GET', '/api/members', () => {
			throw new Error('boom');
		});

		expect(info).toHaveBeenCalledTimes(1);
		expect(JSON.parse(info.mock.calls[0][0] as string)).toMatchObject({
			method: 'GET',
			path: '/api/members',
			status: 500
		});
	});

	it('answers 500 when an async handler rejects', async () => {
		vi.spyOn(console, 'info').mockImplementation(() => {});
		const err = vi.spyOn(console, 'error').mockImplementation(() => {});

		const response = await logged('GET', '/x', async () => {
			throw new Error('boom');
		});

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({ error: 'Something went wrong' });
		expect(err).toHaveBeenCalledTimes(1);
	});

	it('re-throws a 4xx HTTP error carrying a body instead of answering 500', () => {
		vi.spyOn(console, 'info').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});

		let err: unknown;
		try {
			logged('GET', '/api/members/x', () => {
				throw { status: 404, body: { message: 'Member not found' } };
			});
		} catch (error) {
			err = error;
		}

		expect(err).toMatchObject({ status: 404 });
	});

	it('re-throws an async 4xx HTTP error carrying a body', async () => {
		vi.spyOn(console, 'info').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});

		await expect(
			logged('GET', '/api/members/x', async () => {
				throw { status: 404, body: { message: 'Member not found' } };
			})
		).rejects.toMatchObject({ status: 404 });
	});

	it('logs a status-bearing non-HTTP error and answers 500', async () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});
		const err = vi.spyOn(console, 'error').mockImplementation(() => {});

		const response = await logged('GET', '/x', async () => {
			throw Object.assign(new Error('upstream down'), { status: 503 });
		});

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({ error: 'Something went wrong' });
		expect(err.mock.calls[0][0]).toContain('upstream down');
		expect(JSON.parse(info.mock.calls[0][0] as string)).toMatchObject({ status: 500 });
	});

	it('answers 500 for a 4xx status without a body', async () => {
		vi.spyOn(console, 'info').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});

		const response = await logged('GET', '/x', async () => {
			throw { status: 404 };
		});

		expect(response.status).toBe(500);
	});

	it('answers 500 when a sync handler returns no Response', () => {
		vi.spyOn(console, 'info').mockImplementation(() => {});
		const err = vi.spyOn(console, 'error').mockImplementation(() => {});

		const response = logged('GET', '/x', () => undefined as unknown as Response);

		expect(response).toBeInstanceOf(Response);
		expect((response as Response).status).toBe(500);
		expect(err.mock.calls[0][0]).toContain('handler returned no Response');
	});

	it('answers 500 when an async handler resolves without a Response', async () => {
		vi.spyOn(console, 'info').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});

		const response = await logged('GET', '/x', async () => undefined as unknown as Response);

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({ error: 'Something went wrong' });
	});

	it('keeps a synchronous handler synchronous', () => {
		vi.spyOn(console, 'info').mockImplementation(() => {});

		const result = logged('GET', '/api/members', () => json([]));

		expect(result).toBeInstanceOf(Response);
	});
});
