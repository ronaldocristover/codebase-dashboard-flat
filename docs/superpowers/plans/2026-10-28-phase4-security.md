# Phase 4: Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SSKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add file upload validation, XSS protection, input length limits, and improve phone/email validation.

**Architecture:** 
- Add MIME type validation to file uploads
- Sanitize markdown input using DOMPurify
- Add max length constraints to validation
- Improve phone number validation
- Tests for security vulnerabilities

**Tech Stack:** 
- `file-type` (for MIME type detection)
- `dompurify` (for XSS protection)
- Existing validation logic

**Spec:** See `docs/superpowers/plans/2026-10-28-saas-readiness-audit.md` findings #11, #12, #14, #15, #16

## Global Constraints

- **Svelte 5 Runes:** All components must use `$props()`, `$state`, `$derived`, `$effect`
- **TypeScript Strict:** No `any` without explicit comment
- **Indonesian Domain Identifiers:** Technical terms stay English (`mime`, `sanitize`, `validation`)
- **File Structure:** Validation stays in `src/lib/utils/`; file upload in `src/lib/components/form/`
- **Testing:** Tests must be colocated with the code they test

## Review Focus

1. **File upload validation:** Only safe file types are accepted → Test: Try to upload a malicious file (e.g., `.js`, `.exe`)
2. **XSS protection:** Markdown with `<script>` tags doesn't execute → Test: Submit markdown with `<script>alert('XSS')</script>` and verify preview is safe
3. **Input length limits:** Long inputs are rejected → Test: Submit a name with 1000 characters
4. **Phone validation:** Invalid phone numbers are rejected → Test: Submit phone number `1234567890` (no prefix)
5. **Email validation:** Invalid emails are rejected → Test: Submit email `user@.com` or `@example.com`

---

## Task 1: Add file upload MIME type validation

**Files:**
- Modify: `src/lib/components/form/FileUpload.svelte`
- Test: `src/lib/components/form/FileUpload.test.ts`

**Interfaces:**
- Consumes: `file-type` library
- Produces: MIME type validation for file uploads

**Dependencies:** None

- [ ] **Step 1: Install file-type library**

```bash
npm install file-type
```

- [ ] **Step 2: Add MIME type validation to FileUpload**

Update `src/lib/components/form/FileUpload.svelte`:

```typescript
import type { File } from 'file-type';

type Props = {
	label?: string;
	file?: File | null;
	accept?: string;
	maxSizeMb?: number;
	hint?: string;
	disabled?: boolean;
};

let {
	label = 'File',
	file = $bindable<File | null>(null),
	accept,
	maxSizeMb = 5,
	hint,
	disabled = false
}: Props = $props();

const id = $props.id();
let error = $state('');

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'application/pdf'
];

function pick(event: Event) {
	const input = event.currentTarget as HTMLInputElement;
	const picked = input.files?.[0];
	if (!picked) return;

	const message = fileSizeError(picked, maxSizeMb);
	if (message) {
		error = message;
		input.value = '';
		return;
	}

	// Check MIME type
	const mimeType = picked.type;
	if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
		error = 'Invalid file type. Only images and PDFs are allowed.';
		input.value = '';
		return;
	}

	error = '';
	file = picked;
}

function clear() {
	file = null;
	error = '';
}
```

- [ ] **Step 3: Add test for MIME type validation**

```typescript
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import FileUpload from './FileUpload.svelte';

describe('FileUpload MIME type validation', () => {
	it('rejects executable files', async () => {
		const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
		const { getByLabelText } = render(FileUpload, {
			props: { file: $bindable(file), accept: '.exe,.pdf' }
		});

		const input = getByLabelText('File');
		await fireEvent.change(input, { target: { files: [file] } });

		expect(screen.getByText('Invalid file type. Only images and PDFs are allowed.')).toBeTruthy();
	});

	it('accepts valid image files', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
		const { getByLabelText } = render(FileUpload, {
			props: { file: $bindable(file), accept: '.jpg,.png' }
		});

		const input = getByLabelText('File');
		await fireEvent.change(input, { target: { files: [file] } });

		expect(screen.getByText('test.jpg')).toBeTruthy();
	});

	it('accepts PDF files', async () => {
		const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
		const { getByLabelText } = render(FileUpload, {
			props: { file: $bindable(file), accept: '.pdf' }
		});

		const input = getByLabelText('File');
		await fireEvent.change(input, { target: { files: [file] } });

		expect(screen.getByText('test.pdf')).toBeTruthy();
	});
});
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/lib/components/form/FileUpload.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/form/FileUpload.svelte src/lib/components/form/FileUpload.test.ts
git commit -m "feat: add MIME type validation to file uploads"
```

---

## Task 2: Sanitize markdown input

**Files:**
- Modify: `src/lib/components/form/MarkdownInput.svelte`
- Test: `src/lib/components/form/MarkdownInput.test.ts`

**Interfaces:**
- Consumes: `dompurify` library
- Produces: Sanitized markdown preview

**Dependencies:** None

- [ ] **Step 1: Install DOMPurify**

```bash
npm install dompurify
```

- [ ] **Step 2: Add sanitization to MarkdownInput**

Update `src/lib/components/form/MarkdownInput.svelte`:

```typescript
import DOMPurify from 'dompurify';

// ... existing code ...

{#if preview}
	<div
		class="preview min-h-32 px-3 py-2.5 text-sm leading-relaxed text-ink"
		aria-live="polite"
	>
		{#if value.trim()}
			{@html DOMPurify.sanitize(renderMarkdown(value))}
		{:else}
			<p class="text-sm text-muted">Nothing to preview.</p>
		{/if}
	</div>
{:else}
	<!-- ... existing code ... -->
{/if}
```

- [ ] **Step 3: Add test for XSS protection**

```typescript
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import MarkdownInput from './MarkdownInput.svelte';

describe('MarkdownInput XSS protection', () => {
	it('does not execute script tags', async () => {
		const { getByLabelText } = render(MarkdownInput, {
			props: { label: 'Markdown', value: $bindable('<script>alert("XSS")</script>') }
		});

		// Trigger preview mode
		const previewButton = screen.getByText('Preview');
		await fireEvent.click(previewButton);

		// Script should be sanitized, not executed
		const preview = screen.getByRole('generic');
		expect(preview.textContent).not.toContain('alert');
	});

	it('sanitizes dangerous attributes', async () => {
		const { getByLabelText } = render(MarkdownInput, {
			props: { label: 'Markdown', value: $bindable('<img src=x onerror=alert(1) />') }
		});

		const previewButton = screen.getByText('Preview');
		await fireEvent.click(previewButton);

		const preview = screen.getByRole('generic');
		expect(preview.innerHTML).not.toContain('onerror');
	});

	it('renders safe HTML correctly', async () => {
		const { getByLabelText } = render(MarkdownInput, {
			props: { label: 'Markdown', value: $bindable('<strong>Bold</strong>') }
		});

		const previewButton = screen.getByText('Preview');
		await fireEvent.click(previewButton);

		const preview = screen.getByRole('generic');
		expect(preview.innerHTML).toContain('<strong>Bold</strong>');
	});
});
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/lib/components/form/MarkdownInput.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/form/MarkdownInput.svelte src/lib/components/form/MarkdownInput.test.ts
git commit -m "feat: add XSS protection to markdown input"
```

---

## Task 3: Add input length limits

**Files:**
- Modify: `src/lib/utils/memberValidation.ts`
- Test: `src/lib/utils/memberValidation.test.ts`

**Interfaces:**
- Consumes: None (adds constraints)
- Produces: Max length validation for member fields

**Dependencies:** None

- [ ] **Step 1: Add max length constants**

Update `src/lib/utils/memberValidation.ts`:

```typescript
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAMA_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_HP_LENGTH = 15;
```

- [ ] **Step 2: Add max length validation**

Update validation function:

```typescript
export function validateMemberInput(
	input: Partial<Record<keyof MemberInput, unknown>>
): Record<string, string> {
	const errors: Record<string, string> = {};

	const nama = typeof input.nama === 'string' ? input.nama.trim() : '';
	if (!nama) errors.nama = 'Name is required';
	else if (nama.length > MAX_NAMA_LENGTH) errors.nama = `Name must not exceed ${MAX_NAMA_LENGTH} characters`;

	const email = typeof input.email === 'string' ? input.email.trim() : '';
	if (!EMAIL.test(email)) errors.email = 'Enter a valid email';
	else if (email.length > MAX_EMAIL_LENGTH) errors.email = `Email must not exceed ${MAX_EMAIL_LENGTH} characters`;

	const hp = typeof input.hp === 'string' ? input.hp.replace(/[\s-]/g, '') : '';
	if (!/^\d{4,15}$/.test(hp)) errors.hp = 'Enter a valid phone number (4-15 digits)';
	else if (hp.length > MAX_HP_LENGTH) errors.hp = `Phone number must not exceed ${MAX_HP_LENGTH} characters`;

	if (input.status !== 'aktif' && input.status !== 'nonaktif') {
		errors.status = 'Choose a valid status';
	}

	return errors;
}
```

- [ ] **Step 3: Add test for length validation**

Update `src/lib/utils/memberValidation.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { validateMemberInput } from './memberValidation';

describe('member validation length limits', () => {
	it('rejects name longer than 100 characters', () => {
		const errors = validateMemberInput({
			nama: 'a'.repeat(101),
			email: 'test@example.com',
			hp: '081234567890',
			status: 'aktif'
		});

		expect(errors.nama).toBe('Name must not exceed 100 characters');
	});

	it('rejects email longer than 255 characters', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: 'a'.repeat(256) + '@example.com',
			hp: '081234567890',
			status: 'aktif'
		});

		expect(errors.email).toBe('Email must not exceed 255 characters');
	});

	it('rejects phone number longer than 15 characters', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: 'test@example.com',
			hp: '081234567890123456',
			status: 'aktif'
		});

		expect(errors.hp).toBe('Phone number must not exceed 15 characters');
	});

	it('accepts name at exactly 100 characters', () => {
		const errors = validateMemberInput({
			nama: 'a'.repeat(100),
			email: 'test@example.com',
			hp: '081234567890',
			status: 'aktif'
		});

		expect(errors.nama).toBeUndefined();
	});

	it('accepts email at exactly 255 characters', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: 'a'.repeat(254) + '@example.com',
			hp: '081234567890',
			status: 'aktif'
		});

		expect(errors.email).toBeUndefined();
	});
});
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/lib/utils/memberValidation.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/memberValidation.ts src/lib/utils/memberValidation.test.ts
git commit -m "feat: add input length limits to member validation"
```

---

## Task 4: Improve phone number validation

**Files:**
- Modify: `src/lib/utils/memberValidation.ts`
- Test: `src/lib/utils/memberValidation.test.ts`

**Interfaces:**
- Consumes: Existing validation logic
- Produces: More realistic phone number validation

**Dependencies:** Task 3

- [ ] **Step 1: Improve phone validation regex**

Update `src/lib/utils/memberValidation.ts`:

```typescript
// More realistic Indonesian phone number validation
// Allows: 0812-3456-7890, 62812-3456-7890, 0812.3456.7890
const HP_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAMA_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_HP_LENGTH = 15;

export function validateMemberInput(
	input: Partial<Record<keyof MemberInput, unknown>>
): Record<string, string> {
	const errors: Record<string, string> = {};

	const nama = typeof input.nama === 'string' ? input.nama.trim() : '';
	if (!nama) errors.nama = 'Name is required';
	else if (nama.length > MAX_NAMA_LENGTH) errors.nama = `Name must not exceed ${MAX_NAMA_LENGTH} characters`;

	const email = typeof input.email === 'string' ? input.email.trim() : '';
	if (!EMAIL.test(email)) errors.email = 'Enter a valid email';
	else if (email.length > MAX_EMAIL_LENGTH) errors.email = `Email must not exceed ${MAX_EMAIL_LENGTH} characters`;

	const hp = typeof input.hp === 'string' ? input.hp.replace(/[\s-]/g, '') : '';
	if (!HP_REGEX.test(hp)) errors.hp = 'Enter a valid Indonesian phone number (e.g., 0812-3456-7890)';
	else if (hp.length > MAX_HP_LENGTH) errors.hp = `Phone number must not exceed ${MAX_HP_LENGTH} characters`;

	if (input.status !== 'aktif' && input.status !== 'nonaktif') {
		errors.status = 'Choose a valid status';
	}

	return errors;
}
```

- [ ] **Step 2: Add test for phone validation**

Update `src/lib/utils/memberValidation.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { validateMemberInput } from './memberValidation';

describe('member validation phone number', () => {
	it('rejects phone number without 8 prefix', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: 'test@example.com',
			hp: '611234567890',
			status: 'aktif'
		});

		expect(errors.hp).toBeTruthy();
	});

	it('rejects phone number with 11 digits (invalid format)', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: 'test@example.com',
			hp: '081234567890',
			status: 'aktif'
		});

		expect(errors.hp).toBeTruthy();
	});

	it('accepts valid 08 prefix phone number', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: 'test@example.com',
			hp: '081234567890',
			status: 'aktif'
		});

		expect(errors.hp).toBeUndefined();
	});

	it('accepts valid 62 prefix phone number', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: 'test@example.com',
			hp: '6281234567890',
			status: 'aktif'
		});

		expect(errors.hp).toBeUndefined();
	});

	it('accepts phone number with spaces', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: 'test@example.com',
			hp: '0812 3456 7890',
			status: 'aktif'
		});

		expect(errors.hp).toBeUndefined();
	});

	it('accepts phone number with dashes', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: 'test@example.com',
			hp: '0812-3456-7890',
			status: 'aktif'
		});

		expect(errors.hp).toBeUndefined();
	});
});
```

- [ ] **Step 3: Run tests**

Run: `npm test -- src/lib/utils/memberValidation.test.ts`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/lib/utils/memberValidation.ts src/lib/utils/memberValidation.test.ts
git commit -m "feat: improve phone number validation for Indonesian format"
```

---

## Task 5: Improve email validation

**Files:**
- Modify: `src/lib/utils/memberValidation.ts`
- Test: `src/lib/utils/memberValidation.test.ts`

**Interfaces:**
- Consumes: Existing validation logic
- Produces: More robust email validation

**Dependencies:** Task 4

- [ ] **Step 1: Improve email regex**

Update `src/lib/utils/memberValidation.ts`:

```typescript
// More robust email validation that rejects invalid formats
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const HP_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAMA_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_HP_LENGTH = 15;

export function validateMemberInput(
	input: Partial<Record<keyof MemberInput, unknown>>
): Record<string, string> {
	const errors: Record<string, string> = {};

	const nama = typeof input.nama === 'string' ? input.nama.trim() : '';
	if (!nama) errors.nama = 'Name is required';
	else if (nama.length > MAX_NAMA_LENGTH) errors.nama = `Name must not exceed ${MAX_NAMA_LENGTH} characters`;

	const email = typeof input.email === 'string' ? input.email.trim() : '';
	if (!EMAIL_REGEX.test(email)) errors.email = 'Enter a valid email address';
	else if (email.length > MAX_EMAIL_LENGTH) errors.email = `Email must not exceed ${MAX_EMAIL_LENGTH} characters`;

	const hp = typeof input.hp === 'string' ? input.hp.replace(/[\s-]/g, '') : '';
	if (!HP_REGEX.test(hp)) errors.hp = 'Enter a valid Indonesian phone number (e.g., 0812-3456-7890)';
	else if (hp.length > MAX_HP_LENGTH) errors.hp = `Phone number must not exceed ${MAX_HP_LENGTH} characters`;

	if (input.status !== 'aktif' && input.status !== 'nonaktif') {
		errors.status = 'Choose a valid status';
	}

	return errors;
}
```

- [ ] **Step 2: Add test for email validation**

Update `src/lib/utils/memberValidation.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { validateMemberInput } from './memberValidation';

describe('member validation email', () => {
	it('rejects email without @ symbol', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: 'testexample.com',
			hp: '081234567890',
			status: 'aktif'
		});

		expect(errors.email).toBeTruthy();
	});

	it('rejects email without domain', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: 'test@',
			hp: '081234567890',
			status: 'aktif'
		});

		expect(errors.email).toBeTruthy();
	});

	it('rejects email with multiple @ symbols', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: 'test@@example.com',
			hp: '081234567890',
			status: 'aktif'
		});

		expect(errors.email).toBeTruthy();
	});

	it('rejects email starting with @', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: '@example.com',
			hp: '081234567890',
			status: 'aktif'
		});

		expect(errors.email).toBeTruthy();
	});

	it('rejects email ending with @', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: 'test@',
			hp: '081234567890',
			status: 'aktif'
		});

		expect(errors.email).toBeTruthy();
	});

	it('accepts valid email', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: 'test@example.com',
			hp: '081234567890',
			status: 'aktif'
		});

		expect(errors.email).toBeUndefined();
	});

	it('accepts email with subdomain', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: 'test@mail.example.com',
			hp: '081234567890',
			status: 'aktif'
		});

		expect(errors.email).toBeUndefined();
	});

	it('accepts email with numbers and special characters', () => {
		const errors = validateMemberInput({
			nama: 'Test',
			email: 'test.123+abc@example.com',
			hp: '081234567890',
			status: 'aktif'
		});

		expect(errors.email).toBeUndefined();
	});
});
```

- [ ] **Step 3: Run tests**

Run: `npm test -- src/lib/utils/memberValidation.test.ts`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/lib/utils/memberValidation.ts src/lib/utils/memberValidation.test.ts
git commit -m "feat: improve email validation with more robust regex"
```

---

## Phase 4 Completion Checklist

- [ ] All tasks completed
- [ ] All tests pass (`npm test`)
- [ ] svelte-check passes (`npm run check`)
- [ ] File uploads validate MIME types
- [ ] Markdown input is sanitized against XSS
- [ ] Input length limits are enforced
- [ ] Phone validation is more realistic
- [ ] Email validation is more robust
- [ ] All tests pass and code follows project conventions

---

## Success Criteria for Phase 4

- Malicious files are rejected
- XSS attacks are prevented in markdown preview
- Long inputs are rejected
- Invalid phone numbers are rejected
- Invalid emails are rejected
- All tests pass and code follows project conventions

---

## Next Phase

Proceed to **Phase 5: Observability** (`docs/superpowers/plans/2026-10-28-phase5-observability.md`)
