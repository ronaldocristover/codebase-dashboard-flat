// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { members as seed } from '#lib/mock/members';
import { listMembers, resetMembers } from '#lib/server/memberStore';
import { GET as getList, POST as postMember } from './+server';
import { GET as getMember, PATCH as patchMember } from './[id]/+server';
import { GET as getOrders } from './[id]/orders/+server';

// Test double: handlers require route-specific RequestEvent types.
function event(params: Record<string, string> = {}, body?: unknown, qs = ''): never {
	const request =
		body === undefined
			? undefined
			: new Request('http://localhost/api/members', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: typeof body === 'string' ? body : JSON.stringify(body)
				});
	return { params, request, url: new URL(`http://localhost/api/members${qs}`) } as never;
}

async function statusOf(panggil: () => unknown): Promise<number> {
	try {
		return ((await panggil()) as Response).status;
	} catch (err) {
		return (err as { status: number }).status;
	}
}

beforeEach(() => {
	resetMembers();
});

describe('GET /api/members', () => {
	it('returns the seeded members', async () => {
		const response = await getList(event({}, undefined, '?perPage=100'));

		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.members).toHaveLength(seed.length);
		expect(body.members[0].id).toBe(seed[0].id);
	});

	it('defaults to page 1 and 20 per page', async () => {
		const { members, pagination } = await (await getList(event())).json();

		expect(pagination).toEqual({ page: 1, perPage: 20, total: seed.length, totalPages: 3 });
		expect(members).toHaveLength(20);
	});

	it('slices the list with page and perPage', async () => {
		const { members, pagination } = await (await getList(event({}, undefined, '?page=2&perPage=5'))).json();

		expect(pagination.page).toBe(2);
		expect(pagination.perPage).toBe(5);
		expect(pagination.totalPages).toBe(10);
		expect(members).toHaveLength(5);
		expect(members[0].id).toBe(seed[5].id);
	});

	it('clamps perPage to 100', async () => {
		const { members, pagination } = await (await getList(event({}, undefined, '?perPage=99999'))).json();

		expect(pagination.perPage).toBe(100);
		expect(members).toHaveLength(seed.length);
	});

	it('clamps perPage and page to at least 1', async () => {
		const { pagination } = await (await getList(event({}, undefined, '?page=0&perPage=0'))).json();

		expect(pagination.page).toBe(1);
		expect(pagination.perPage).toBe(1);
	});

	it('falls back to page 1 when page is not a number', async () => {
		const { pagination } = await (await getList(event({}, undefined, '?page=abc'))).json();

		expect(pagination.page).toBe(1);
	});

	it('returns an empty list for a page past the end', async () => {
		const { members, pagination } = await (await getList(event({}, undefined, '?page=99'))).json();

		expect(members).toEqual([]);
		expect(pagination.page).toBe(99);
		expect(pagination.total).toBe(seed.length);
	});
});

describe('POST /api/members', () => {
	it('creates a member and includes it in the next list', async () => {
		const response = await postMember(
			event(
				{},
				{ nama: 'New Member', email: 'new@mail.com', hp: '0812-3456-7890', status: 'aktif' }
			)
		);

		expect(response.status).toBe(201);
		const created = await response.json();
		expect(created.id).toBe('MBR-0051');
		expect(created.totalBelanja).toBe(0);
		expect(created.bergabung).toMatch(/^\d{4}-\d{2}-\d{2}$/);

		const daftar = await (await getList(event({}, undefined, '?perPage=100'))).json();
		expect(daftar.members).toHaveLength(seed.length + 1);
		expect(daftar.members.some((member: { id: string }) => member.id === created.id)).toBe(true);
	});

	it('rejects an invalid payload with field errors', async () => {
		const response = await postMember(
			event({}, { nama: '  ', email: 'nope', hp: 'abc', status: 'lainnya' })
		);

		expect(response.status).toBe(400);
		const { errors } = await response.json();
		expect(Object.keys(errors).sort()).toEqual(['email', 'hp', 'nama', 'status']);
	});

	it('rejects invalid JSON', async () => {
		const response = await postMember(event({}, '{oops'));

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ errors: { body: 'Invalid JSON' } });
	});
});

describe('PATCH /api/members/[id]', () => {
	it('updates name and status', async () => {
		const id = seed[1].id;
		const response = await patchMember(event({ id }, { nama: 'Renamed', status: 'nonaktif' }));

		expect(response.status).toBe(200);
		const updated = await response.json();
		expect(updated.nama).toBe('Renamed');
		expect(updated.status).toBe('nonaktif');
		expect(updated.email).toBe(seed[1].email);
		expect(listMembers().find((member) => member.id === id)?.nama).toBe('Renamed');
	});

	it('rejects a patch that makes the member invalid', async () => {
		const response = await patchMember(event({ id: seed[1].id }, { email: 'nope' }));

		expect(response.status).toBe(400);
		expect(await response.json()).toHaveProperty('errors.email', 'Enter a valid email');
	});
});

describe('unknown member', () => {
	it('returns 404 from every member endpoint', async () => {
		const params = { id: 'MBR-9999' };

		expect(await statusOf(() => getMember(event(params)))).toBe(404);
		expect(await statusOf(() => patchMember(event(params, { nama: 'X' })))).toBe(404);
		expect(await statusOf(() => getOrders(event(params)))).toBe(404);
	});

	it('includes the not-found message', () => {
		let err: unknown;
		try {
			getMember(event({ id: 'MBR-9999' }));
		} catch (error) {
			err = error;
		}

		expect(err).toMatchObject({ status: 404, body: { message: 'Member not found' } });
	});
});

describe('GET /api/members/[id]/orders', () => {
	it('returns an empty array for the first seeded member', async () => {
		const response = await getOrders(event({ id: seed[0].id }));

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual([]);
	});

	it('returns deterministic orders with unique invoices', async () => {
		const response = await getOrders(event({ id: seed[1].id }));
		const orders = await response.json();

		expect(orders.length).toBeGreaterThan(0);
		expect(new Set(orders.map((order: { invoice: string }) => order.invoice)).size).toBe(
			orders.length
		);
		for (const order of orders) {
			expect(order.memberId).toBe(seed[1].id);
			expect(order.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		}
	});
});
