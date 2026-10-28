export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	const kb = bytes / 1024;
	if (kb < 1024) return `${Math.round(kb)} KB`;
	return `${(kb / 1024).toFixed(1)} MB`;
}

export function fileSizeError(file: File, maxSizeMb: number): string | null {
	if (file.size > maxSizeMb * 1024 * 1024) return `File must be ${maxSizeMb} MB or smaller`;
	return null;
}

export function isImageFile(file: File): boolean {
	return file.type.startsWith('image/');
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf'];

// shortcut: checks the browser-reported MIME type only; sniff bytes on the server when uploads are actually stored.
export function fileTypeError(file: File): string | null {
	return ALLOWED_TYPES.includes(file.type) ? null : 'Choose a PNG, JPG, GIF, WebP, or PDF file';
}
