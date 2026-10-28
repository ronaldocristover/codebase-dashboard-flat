import { describe, expect, it } from 'vitest';
import { fileSizeError, fileTypeError, formatFileSize, isImageFile } from './fileUpload';

describe('formatFileSize', () => {
	it('formats bytes, kilobytes, and megabytes', () => {
		expect(formatFileSize(512)).toBe('512 B');
		expect(formatFileSize(2048)).toBe('2 KB');
		expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
	});
});

describe('fileSizeError', () => {
	it('rejects files above the limit and accepts files at the limit', () => {
		expect(fileSizeError({ size: 5 * 1024 * 1024 } as File, 5)).toBeNull();
		expect(fileSizeError({ size: 6 * 1024 * 1024 } as File, 5)).toBe(
			'File must be 5 MB or smaller'
		);
	});
});

describe('isImageFile', () => {
	it('detects image MIME types', () => {
		expect(isImageFile({ type: 'image/png' } as File)).toBe(true);
		expect(isImageFile({ type: 'application/pdf' } as File)).toBe(false);
	});
});

describe('fileTypeError', () => {
	it('accepts every allowed type', () => {
		for (const type of ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf']) {
			expect(fileTypeError(new File([], 'a', { type }))).toBeNull();
		}
	});

	it('rejects other types with a message naming the allowed types', () => {
		expect(fileTypeError(new File([], 'a.exe', { type: 'application/x-msdownload' }))).toBe(
			'Choose a PNG, JPG, GIF, WebP, or PDF file'
		);
	});

	it('rejects an unknown empty type', () => {
		expect(fileTypeError(new File([], 'a', { type: '' }))).toBe(
			'Choose a PNG, JPG, GIF, WebP, or PDF file'
		);
	});

	it('does not throw when the type property is missing', () => {
		expect(fileTypeError({} as File)).toBe('Choose a PNG, JPG, GIF, WebP, or PDF file');
	});
});
