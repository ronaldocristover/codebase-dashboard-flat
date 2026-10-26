import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import Toast from './Toast.svelte';

describe('Toast', () => {
	it('shows the message and dismisses through the close button', async () => {
		const onDismiss = vi.fn();
		render(Toast, { props: { message: 'Member saved successfully.', variant: 'success', onDismiss } });

		expect(screen.getByRole('status').textContent).toContain('Member saved successfully.');

		await fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
		expect(onDismiss).toHaveBeenCalled();
	});
});
