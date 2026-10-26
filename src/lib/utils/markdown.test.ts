import { describe, expect, it } from 'vitest';
import { applyMarkdownFormat, renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
	it('renders headings, paragraphs, lists, and inline formatting', () => {
		const html = renderMarkdown('## Title\n\nHello **world** with *style*.\n\n- One\n- Two');

		expect(html).toContain('<h2>Title</h2>');
		expect(html).toContain('<strong>world</strong>');
		expect(html).toContain('<em>style</em>');
		expect(html).toContain('<ul>');
		expect(html).toContain('<li>One</li>');
	});

	it('escapes raw HTML and blocks unsafe links', () => {
		const html = renderMarkdown('<script>alert(1)</script>\n\n[x](javascript:alert(1))');

		expect(html).toContain('&lt;script&gt;');
		expect(html).not.toContain('<script>');
		expect(html).toContain('href="#"');
	});

	it('keeps inline code untouched by other formatting', () => {
		const html = renderMarkdown('`a * b * c`');

		expect(html).toContain('<code>a * b * c</code>');
		expect(html).not.toContain('<em>');
	});
});

describe('applyMarkdownFormat', () => {
	it('wraps the selection and keeps it selected', () => {
		const edit = applyMarkdownFormat('hello', 0, 5, 'bold');

		expect(edit.text).toBe('**hello**');
		expect(edit.selectionStart).toBe(2);
		expect(edit.selectionEnd).toBe(7);
	});

	it('inserts link text and selects the URL placeholder', () => {
		const edit = applyMarkdownFormat('click here', 0, 10, 'link');

		expect(edit.text).toBe('[click here](url)');
		expect(edit.text.slice(edit.selectionStart, edit.selectionEnd)).toBe('url');
	});

	it('prefixes each selected line', () => {
		const edit = applyMarkdownFormat('one\ntwo', 0, 7, 'bullet');

		expect(edit.text).toBe('- one\n- two');
		expect(edit.selectionStart).toBe(2);
		expect(edit.selectionEnd).toBe(11);
	});
});
