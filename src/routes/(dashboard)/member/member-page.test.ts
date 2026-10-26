import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { members } from '#lib/mock/members';
import { formatRupiah } from '#lib/utils/format';
import MemberPage from './+page.svelte';

function rows(container: HTMLElement): string[][] {
	return Array.from(container.querySelectorAll('tbody tr')).map((tr) =>
		Array.from(tr.querySelectorAll('td')).map((td) => td.textContent?.trim() ?? '')
	);
}

function maxSpend(): string {
	return formatRupiah(Math.max(...members.map((m) => m.totalBelanja)));
}

function renderPage() {
	return render(MemberPage, { props: { data: { members } } });
}

describe('member page', () => {
	it('shows the breadcrumb, title, and the first 10 rows', () => {
		const { container } = renderPage();

		expect(screen.getByText('Home')).toBeTruthy();
		expect(screen.getByRole('heading', { name: 'Members' })).toBeTruthy();
		expect(screen.getByText('50 members')).toBeTruthy();
		expect(container.querySelectorAll('tbody tr')).toHaveLength(10);
		expect(screen.getByText(/Showing 1–10 of 50 members/)).toBeTruthy();
	});

	it('links the add button to the new member page', () => {
		renderPage();

		expect(screen.getByRole('link', { name: '+ Add Member' }).getAttribute('href')).toBe(
			'/member/new'
		);
	});

	it('searches members by name', async () => {
		const { container } = renderPage();
		await fireEvent.input(screen.getByLabelText('Search members'), {
			target: { value: 'Siti Aminah' }
		});

		const list = rows(container);
		expect(list).toHaveLength(1);
		expect(list[0][0]).toContain('Siti Aminah');
	});

	it('links the member name and the view/edit actions', async () => {
		renderPage();
		await fireEvent.input(screen.getByLabelText('Search members'), {
			target: { value: 'Siti Aminah' }
		});

		const member = members.find((m) => m.nama === 'Siti Aminah');
		expect(member).toBeTruthy();

		expect(screen.getByRole('link', { name: 'Siti Aminah' }).getAttribute('href')).toBe(
			`/member/${member!.id}`
		);
		expect(
			screen.getByRole('link', { name: 'View Siti Aminah' }).getAttribute('href')
		).toBe(`/member/${member!.id}`);
		expect(
			screen.getByRole('link', { name: 'Edit Siti Aminah' }).getAttribute('href')
		).toBe(`/member/${member!.id}/edit`);
	});

	it('shows the empty state when nothing matches', async () => {
		renderPage();
		await fireEvent.input(screen.getByLabelText('Search members'), {
			target: { value: 'zzzz' }
		});

		expect(screen.getByText('No matching members')).toBeTruthy();
		expect(screen.getByText('Try changing the keyword or filters.')).toBeTruthy();
	});

	it('shows the empty state when filters leave no data', async () => {
		renderPage();

		await fireEvent.input(screen.getByLabelText('Search members'), {
			target: { value: 'Siti Aminah' }
		});
		await fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'nonaktif' } });
		await fireEvent.change(screen.getByLabelText('Joined'), { target: { value: '7' } });

		expect(screen.getByText('No matching members')).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Reset filters' })).toBeTruthy();
	});

	it('filters by joined range', async () => {
		renderPage();
		await fireEvent.change(screen.getByLabelText('Joined'), { target: { value: '7' } });

		expect(screen.getByText(/Showing 1–\d+ of \d+ members/)).toBeTruthy();
	});

	it('filters by status', async () => {
		const { container } = renderPage();
		await fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'nonaktif' } });

		const list = rows(container);
		expect(list.length).toBeGreaterThan(0);
		for (const row of list) {
			expect(row[row.length - 2]).toContain('Inactive');
		}
	});

	it('sorts total spend ascending then descending', async () => {
		const { container } = renderPage();
		const header = screen.getByRole('button', { name: /Total Spend/ });

		await fireEvent.click(header);
		expect(rows(container)[0][4]).toBe('Rp 89.000');

		await fireEvent.click(header);
		expect(rows(container)[0][4]).toBe(maxSpend());
	});

	it('returns to page 1 when a filter changes', async () => {
		renderPage();
		await fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
		expect(screen.getByText(/Showing 21–30/)).toBeTruthy();

		await fireEvent.input(screen.getByLabelText('Search members'), {
			target: { value: 'Siti Aminah' }
		});
		expect(screen.getByText(/Showing 1–1/)).toBeTruthy();
	});

	it('resets all filters', async () => {
		const { container } = renderPage();
		await fireEvent.input(screen.getByLabelText('Search members'), { target: { value: 'zzzz' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

		expect(container.querySelectorAll('tbody tr')).toHaveLength(10);
	});
});
