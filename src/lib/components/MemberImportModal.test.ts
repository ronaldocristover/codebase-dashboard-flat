import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MemberImportModal from './MemberImportModal.svelte';

const mocks = vi.hoisted(() => ({
	readMemberFile: vi.fn(),
	downloadTemplate: vi.fn()
}));

vi.mock('#lib/utils/memberExcel', () => ({
	readMemberFile: mocks.readMemberFile,
	downloadTemplate: mocks.downloadTemplate
}));

const input = { nama: 'Siti Aminah', email: 'siti@example.com', hp: '081234567890', status: 'aktif' };

function renderModal(onImported = vi.fn()) {
	const onClose = vi.fn();
	const view = render(MemberImportModal, { props: { open: true, onClose, onImported } });
	return { onClose, onImported, ...view };
}

async function chooseFile(container: HTMLElement) {
	const fileInput = container.querySelector('input[type="file"]');
	if (!fileInput) throw new Error('file input not found');
	await fireEvent.change(fileInput, { target: { files: [new File(['x'], 'members.xlsx')] } });
}

describe('MemberImportModal', () => {
	beforeEach(() => {
		mocks.readMemberFile.mockReset().mockResolvedValue({
			rows: [{ row: 2, input }],
			errors: []
		});
		mocks.downloadTemplate.mockReset().mockResolvedValue(undefined);
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ id: 'MBR-9999' }) })
		);
	});

	it('downloads the import template', async () => {
		renderModal();

		await fireEvent.click(screen.getByRole('button', { name: 'Download import template' }));

		await waitFor(() => expect(mocks.downloadTemplate).toHaveBeenCalled());
	});

	it('previews a valid file and imports it', async () => {
		const { container, onImported } = renderModal();

		await chooseFile(container);
		expect(await screen.findByText('1 row is ready to import.')).toBeTruthy();

		await fireEvent.click(screen.getByRole('button', { name: 'Import 1 member' }));

		await waitFor(() => expect(onImported).toHaveBeenCalledWith(1));
		expect(screen.getByText('Imported 1 row.')).toBeTruthy();
		expect(fetch).toHaveBeenCalledWith(
			'/api/members',
			expect.objectContaining({ method: 'POST', body: JSON.stringify(input) })
		);
	});

	it('lists rows that will be skipped', async () => {
		mocks.readMemberFile.mockResolvedValue({
			rows: [{ row: 2, input }],
			errors: [{ row: 3, message: 'Enter a valid email' }]
		});
		const { container } = renderModal();

		await chooseFile(container);

		expect(await screen.findByText('Row 3: Enter a valid email')).toBeTruthy();
		expect(screen.getByText('1 row will be skipped:')).toBeTruthy();
	});
});
