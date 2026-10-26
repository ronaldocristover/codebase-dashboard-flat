import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Accordion from './Accordion.svelte';

const items = [
	{ title: 'First question', content: 'First answer.' },
	{ title: 'Second question', content: 'Second answer.' }
];

describe('Accordion', () => {
	it('opens one panel at a time and closes it again', async () => {
		render(Accordion, { props: { items } });
		const first = screen.getByRole('button', { name: 'First question' });
		const second = screen.getByRole('button', { name: 'Second question' });

		await fireEvent.click(first);
		expect(screen.getByText('First answer.')).toBeTruthy();
		expect(first.getAttribute('aria-expanded')).toBe('true');

		await fireEvent.click(second);
		expect(screen.queryByText('First answer.')).toBeNull();
		expect(screen.getByText('Second answer.')).toBeTruthy();

		await fireEvent.click(second);
		expect(screen.queryByText('Second answer.')).toBeNull();
	});
});
