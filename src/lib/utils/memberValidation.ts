import type { MemberStatus } from '#lib/types';

export interface MemberInput {
	nama: string;
	email: string;
	hp: string;
	status: MemberStatus;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateMemberInput(
	input: Partial<Record<keyof MemberInput, unknown>>
): Record<string, string> {
	const errors: Record<string, string> = {};

	const nama = typeof input.nama === 'string' ? input.nama.trim() : '';
	if (!nama) errors.nama = 'Name is required';

	const email = typeof input.email === 'string' ? input.email.trim() : '';
	if (!EMAIL.test(email)) errors.email = 'Enter a valid email';

	const hp = typeof input.hp === 'string' ? input.hp.replace(/[\s-]/g, '') : '';
	if (!/^\d{9,15}$/.test(hp)) errors.hp = 'Enter a valid phone number';

	if (input.status !== 'aktif' && input.status !== 'nonaktif') {
		errors.status = 'Choose a valid status';
	}

	return errors;
}
