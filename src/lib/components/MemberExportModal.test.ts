import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { members } from '#lib/mock/members';
import { exportMembers } from '#lib/utils/memberExcel';
import MemberExportModal from './MemberExportModal.svelte';

vi.mock('#lib/utils/memberExcel', () => ({ exportMembers: vi.fn() }));

const sample = members.slice(0, 2);

function renderModal(onClose = vi.fn()) {
	return { onClose, ...render(MemberExportModal, { props: { open: true, members: sample, onClose } }) };
}

describe('MemberExportModal', () => {
	beforeEach(() => {
		vi.mocked(exportMembers).mockReset().mockResolvedValue(undefined);
	});

	it('shows the member count in a dialog', () => {
		renderModal();

		expect(screen.getByRole('dialog', { name: 'Export members' })).toBeTruthy();
		expect(screen.getByText(/Download 2 members/)).toBeTruthy();
	});

	it('downloads the members and closes', async () => {
		const { onClose } = renderModal();

		await fireEvent.click(screen.getByRole('button', { name: 'Download Excel' }));

		await waitFor(() => expect(exportMembers).toHaveBeenCalledWith(sample));
		expect(onClose).toHaveBeenCalled();
	});

	it('closes on Escape and on the close button', async () => {
		const { onClose } = renderModal();

		await fireEvent.keyDown(document, { key: 'Escape' });
		expect(onClose).toHaveBeenCalledTimes(1);

		await fireEvent.click(screen.getAllByRole('button', { name: 'Close dialog' })[0]);
		expect(onClose).toHaveBeenCalledTimes(2);
	});

	it('renders nothing while closed', () => {
		render(MemberExportModal, { props: { open: false, members: sample, onClose: vi.fn() } });

		expect(screen.queryByRole('dialog')).toBeNull();
	});
});
