import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MultiFileUpload from './MultiFileUpload.svelte';

function file(name: string, type: string, size = 10): File {
	return new File(['x'.repeat(size)], name, { type });
}

function choose(input: HTMLInputElement, picked: File[]) {
	Object.defineProperty(input, 'files', { value: picked, configurable: true });
	return fireEvent.change(input);
}

function input(container: HTMLElement): HTMLInputElement {
	return container.querySelector('input[type="file"]') as HTMLInputElement;
}

// The component writes back through $bindable, so `files` needs a real accessor.
function holder(initial: File[] = [], extra: { accept?: string; maxFiles?: number } = {}) {
	const state = { files: initial };
	const props = { ...extra };
	Object.defineProperty(props, 'files', {
		enumerable: true,
		configurable: true,
		get: () => state.files,
		set: (next: File[]) => {
			state.files = next;
		}
	});
	return props as typeof extra & { files: File[] };
}

describe('MultiFileUpload', () => {
	beforeEach(() => {
		URL.createObjectURL = vi.fn(() => 'blob:preview');
		URL.revokeObjectURL = vi.fn();
	});

	it('keeps the valid file and names the rejected one', async () => {
		const props = holder([], { accept: 'image/*,application/pdf' });
		const { container } = render(MultiFileUpload, { props });
		const valid = file('photo.png', 'image/png');
		const invalid = file('tool.exe', 'application/x-msdownload');

		await choose(input(container), [valid, invalid]);

		expect(props.files).toEqual([valid]);
		expect(screen.getByRole('alert').textContent).toBe(
			'tool.exe: Choose a PNG, JPG, GIF, WebP, or PDF file'
		);
	});

	it('reports the rejected type and the file cap in one message', async () => {
		const props = holder([], { maxFiles: 2 });
		const { container } = render(MultiFileUpload, { props });
		const batch = [
			file('a.exe', 'application/x-msdownload'),
			file('b.png', 'image/png'),
			file('c.png', 'image/png')
		];

		await choose(input(container), batch);

		expect(props.files).toEqual([batch[1]]);
		expect(screen.getByRole('alert').textContent).toContain('a.exe');
		expect(screen.getByRole('alert').textContent).toContain('Only 2 files allowed');
	});

	it('accepts a PDF when the accept list mixes images and PDFs', async () => {
		const props = holder([], { accept: 'image/*,application/pdf' });
		const { container } = render(MultiFileUpload, { props });
		const pdf = file('doc.pdf', 'application/pdf');

		await choose(input(container), [pdf]);

		expect(props.files).toEqual([pdf]);
		expect(screen.queryByRole('alert')).toBeNull();
	});

	it('clears the error on a later valid pick', async () => {
		const props = holder();
		const { container } = render(MultiFileUpload, { props });
		const valid = file('photo.png', 'image/png');

		await choose(input(container), [file('tool.exe', 'application/x-msdownload')]);
		expect(screen.getByRole('alert')).toBeTruthy();

		await choose(input(container), [valid]);

		expect(props.files).toEqual([valid]);
		expect(screen.queryByRole('alert')).toBeNull();
	});

	it('truncates a long rejected file name', async () => {
		const props = holder([], { accept: 'image/png,application/pdf' });
		const { container } = render(MultiFileUpload, { props });
		const long = file(`${'a'.repeat(60)}.exe`, 'application/x-msdownload');

		await choose(input(container), [long]);

		expect(screen.getByRole('alert').textContent).toBe(
			`${'a'.repeat(40)}: Choose a PNG, JPG, GIF, WebP, or PDF file`
		);
	});
});
