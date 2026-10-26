const ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

export type MarkdownFormat = 'bold' | 'italic' | 'code' | 'link' | 'heading' | 'bullet' | 'quote';

export type MarkdownEdit = {
	text: string;
	selectionStart: number;
	selectionEnd: number;
};

function escapeHtml(text: string): string {
	return text.replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

function safeHref(url: string): string {
	const trimmed = url.trim();
	if (/^(https?:\/\/|mailto:)/i.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('#')) {
		return trimmed;
	}
	return '#';
}

function inline(text: string): string {
	const codes: string[] = [];
	let out = text.replace(/`([^`]+)`/g, (_, code: string) => {
		codes.push(`<code>${code}</code>`);
		return `\u0000${codes.length - 1}\u0000`;
	});

	out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, href: string) => {
		return `<a href="${safeHref(href)}" target="_blank" rel="noreferrer">${label}</a>`;
	});
	out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
	out = out.replace(/\u0000(\d+)\u0000/g, (_, index: string) => codes[Number(index)]);

	return out;
}

export function renderMarkdown(markdown: string): string {
	const escaped = escapeHtml(markdown.replace(/\r\n/g, '\n'));
	const lines = escaped.split('\n');
	const html: string[] = [];
	let list: 'ul' | 'ol' | null = null;
	let inCode = false;

	function closeList() {
		if (!list) return;
		html.push(`</${list}>`);
		list = null;
	}

	for (const line of lines) {
		if (line.trim().startsWith('```')) {
			if (inCode) {
				html.push('</code></pre>');
				inCode = false;
			} else {
				closeList();
				html.push('<pre><code>');
				inCode = true;
			}
			continue;
		}

		if (inCode) {
			html.push(line);
			continue;
		}

		if (line.trim() === '') {
			closeList();
			continue;
		}

		const heading = /^(#{1,6})\s+(.*)$/.exec(line);
		if (heading) {
			closeList();
			const level = heading[1].length;
			html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
			continue;
		}

		const quote = /^>\s?(.*)$/.exec(line);
		if (quote) {
			closeList();
			html.push(`<blockquote>${inline(quote[1])}</blockquote>`);
			continue;
		}

		const unordered = /^[-*]\s+(.*)$/.exec(line);
		if (unordered) {
			if (list !== 'ul') {
				closeList();
				html.push('<ul>');
				list = 'ul';
			}
			html.push(`<li>${inline(unordered[1])}</li>`);
			continue;
		}

		const ordered = /^\d+\.\s+(.*)$/.exec(line);
		if (ordered) {
			if (list !== 'ol') {
				closeList();
				html.push('<ol>');
				list = 'ol';
			}
			html.push(`<li>${inline(ordered[1])}</li>`);
			continue;
		}

		closeList();
		html.push(`<p>${inline(line)}</p>`);
	}

	closeList();
	if (inCode) html.push('</code></pre>');

	return html.join('\n');
}

function wrap(text: string, start: number, end: number, before: string, after: string): MarkdownEdit {
	return {
		text: `${text.slice(0, start)}${before}${text.slice(start, end)}${after}${text.slice(end)}`,
		selectionStart: start + before.length,
		selectionEnd: end + before.length
	};
}

function prefixLines(text: string, start: number, end: number, prefix: string): MarkdownEdit {
	const lineStart = text.lastIndexOf('\n', start - 1) + 1;
	const lineEnd = text.indexOf('\n', end);
	const blockEnd = lineEnd === -1 ? text.length : lineEnd;
	const lines = text.slice(lineStart, blockEnd).split('\n');
	const prefixed = lines.map((line) => `${prefix}${line}`).join('\n');
	const added = prefix.length * lines.length;

	return {
		text: `${text.slice(0, lineStart)}${prefixed}${text.slice(blockEnd)}`,
		selectionStart: start + prefix.length,
		selectionEnd: end + added
	};
}

export function applyMarkdownFormat(
	text: string,
	start: number,
	end: number,
	format: MarkdownFormat
): MarkdownEdit {
	if (format === 'bold') return wrap(text, start, end, '**', '**');
	if (format === 'italic') return wrap(text, start, end, '*', '*');
	if (format === 'code') return wrap(text, start, end, '`', '`');
	if (format === 'heading') return prefixLines(text, start, end, '## ');
	if (format === 'bullet') return prefixLines(text, start, end, '- ');
	if (format === 'quote') return prefixLines(text, start, end, '> ');

	const label = text.slice(start, end) || 'link text';
	const inserted = `[${label}](url)`;
	const urlStart = start + label.length + 3;

	return {
		text: `${text.slice(0, start)}${inserted}${text.slice(end)}`,
		selectionStart: urlStart,
		selectionEnd: urlStart + 3
	};
}
