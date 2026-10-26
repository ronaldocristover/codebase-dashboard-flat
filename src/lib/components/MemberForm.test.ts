import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import MemberForm from './MemberForm.svelte';

function submit(container: HTMLElement) {
	const form = container.querySelector('form');
	if (!form) throw new Error('form not found');
	return fireEvent.submit(form);
}

async function fillValidFields() {
	await fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'Siti Aminah' } });
	await fireEvent.input(screen.getByLabelText('Email'), {
		target: { value: 'siti@example.com' }
	});
	await fireEvent.input(screen.getByLabelText('Phone'), { target: { value: '081234567890' } });
}

describe('MemberForm', () => {
	it('shows inline errors and does not submit invalid input', async () => {
		const onSubmit = vi.fn();
		const { container } = render(MemberForm, { props: { onSubmit } });

		await submit(container);

		expect(onSubmit).not.toHaveBeenCalled();
		expect(screen.getByText('Name is required')).toBeTruthy();
		expect(screen.getByText('Enter a valid email')).toBeTruthy();
		expect(screen.getByText('Enter a valid phone number')).toBeTruthy();

		const name = screen.getByLabelText('Name');
		expect(name.getAttribute('aria-invalid')).toBe('true');
		expect(name.getAttribute('aria-describedby')).toBe('member-nama-error');
	});

	it('submits valid input with the member payload', async () => {
		const onSubmit = vi.fn().mockResolvedValue(null);
		const { container } = render(MemberForm, { props: { onSubmit } });

		await fillValidFields();
		await submit(container);

		await waitFor(() =>
			expect(onSubmit).toHaveBeenCalledWith({
				nama: 'Siti Aminah',
				email: 'siti@example.com',
				hp: '081234567890',
				status: 'aktif'
			})
		);
		expect(screen.queryAllByRole('alert')).toHaveLength(0);
	});

	it('shows server errors returned by onSubmit', async () => {
		const onSubmit = vi.fn().mockResolvedValue({ email: 'Email is already used' });
		const { container } = render(MemberForm, { props: { onSubmit } });

		await fillValidFields();
		await submit(container);

		expect(await screen.findByText('Email is already used')).toBeTruthy();
		expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).toBe('true');
	});
});
