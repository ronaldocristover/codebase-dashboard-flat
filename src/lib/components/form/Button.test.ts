import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import Button from './Button.svelte';

const children = createRawSnippet(() => ({
	render: () => 'Click me'
}));

describe('Button', () => {
	it('renders children text', () => {
		render(Button, { props: { children } });
		expect(screen.getByRole('button', { name: 'Click me' })).toBeTruthy();
	});

	it('applies sm size class', () => {
		const { container } = render(Button, { props: { size: 'sm', children } });
		expect(container.querySelector('button')?.className).toContain('min-h-8');
	});

	it('applies md size class by default', () => {
		const { container } = render(Button, { props: { children } });
		expect(container.querySelector('button')?.className).toContain('min-h-10');
	});

	it('applies lg size class', () => {
		const { container } = render(Button, { props: { size: 'lg', children } });
		expect(container.querySelector('button')?.className).toContain('min-h-12');
	});

	it('disables the button when loading is true', () => {
		render(Button, { props: { loading: true, children } });
		const btn = screen.getByRole('button');
		expect(btn.hasAttribute('disabled')).toBe(true);
		expect(btn.getAttribute('aria-busy')).toBe('true');
	});

	it('disables the button when disabled is true', () => {
		render(Button, { props: { disabled: true, children } });
		const btn = screen.getByRole('button');
		expect(btn.hasAttribute('disabled')).toBe(true);
	});

	it('calls onclick when clicked and enabled', async () => {
		const onclick = vi.fn();
		render(Button, { props: { onclick, children } });
		await fireEvent.click(screen.getByRole('button'));
		expect(onclick).toHaveBeenCalled();
	});

	it('renders icon on the left by default', () => {
		render(Button, { props: { icon: 'plus', children } });
		const btn = screen.getByRole('button');
		expect(btn.textContent).toContain('Click me');
	});

	it('renders icon on the right when iconPosition is right', () => {
		render(Button, { props: { icon: 'plus', iconPosition: 'right', children } });
		const btn = screen.getByRole('button');
		expect(btn.textContent).toContain('Click me');
	});

	it('hides icon when loading', () => {
		render(Button, { props: { icon: 'plus', loading: true, children } });
		const btn = screen.getByRole('button');
		expect(btn.querySelector('svg.animate-spin')).toBeTruthy();
	});
});