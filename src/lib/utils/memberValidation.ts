import type { MemberStatus } from '#lib/types';

export interface MemberInput {
	nama: string;
	email: string;
	hp: string;
	status: MemberStatus;
}

export const MAX_NAMA = 100;
export const MAX_EMAIL = 254;
export const MAX_HP = 15;

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HP_DIGITS = new RegExp(`^\\d{9,${MAX_HP}}$`);
// The leading + is stripped below, so only the 62 and 0 forms reach this test.
const HP_PREFIX = /^(62|0)8/;

export function validateMemberInput(
	input: Partial<Record<keyof MemberInput, unknown>>
): Record<string, string> {
	const errors: Record<string, string> = {};

	const nama = typeof input.nama === 'string' ? input.nama.trim() : '';
	if (!nama) errors.nama = 'Name is required';
	else if (nama.length > MAX_NAMA) errors.nama = `Name must be ${MAX_NAMA} characters or fewer`;

	const email = typeof input.email === 'string' ? input.email.trim() : '';
	if (!EMAIL.test(email)) errors.email = 'Enter a valid email';
	else if (email.length > MAX_EMAIL) errors.email = `Email must be ${MAX_EMAIL} characters or fewer`;

	const hp = typeof input.hp === 'string' ? input.hp.replace(/[\s-]/g, '').replace(/^\+/, '') : '';
	if (!HP_DIGITS.test(hp) || !HP_PREFIX.test(hp)) errors.hp = 'Enter a valid phone number';

	if (input.status !== 'aktif' && input.status !== 'nonaktif') {
		errors.status = 'Choose a valid status';
	}

	return errors;
}
