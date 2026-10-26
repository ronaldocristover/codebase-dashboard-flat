import { describe, expect, it } from 'vitest';
import { validateMemberInput } from './memberValidation';

const valid = {
	nama: 'Siti Aminah',
	email: 'siti@mail.com',
	hp: '0812-3456-7890',
	status: 'aktif'
};

describe('validateMemberInput', () => {
	it('accepts a valid payload', () => {
		expect(validateMemberInput(valid)).toEqual({});
	});

	it('requires a non-empty name after trim', () => {
		expect(validateMemberInput({ ...valid, nama: '   ' })).toHaveProperty('nama', 'Name is required');
		expect(validateMemberInput({ ...valid, nama: 42 })).toHaveProperty('nama', 'Name is required');
	});

	it('rejects an invalid email', () => {
		expect(validateMemberInput({ ...valid, email: 'nope' })).toHaveProperty(
			'email',
			'Enter a valid email'
		);
		expect(validateMemberInput({ ...valid, email: '' })).toHaveProperty('email');
	});

	it('accepts digits with dashes and spaces, rejects the rest', () => {
		expect(validateMemberInput({ ...valid, hp: '0812 3456 7890' })).toEqual({});
		expect(validateMemberInput({ ...valid, hp: '12345678' })).toHaveProperty(
			'hp',
			'Enter a valid phone number'
		);
		expect(validateMemberInput({ ...valid, hp: '0812-ABCD-7890' })).toHaveProperty('hp');
		expect(validateMemberInput({ ...valid, hp: '1234567890123456' })).toHaveProperty('hp');
	});

	it('only accepts aktif or nonaktif', () => {
		expect(validateMemberInput({ ...valid, status: 'nonaktif' })).toEqual({});
		expect(validateMemberInput({ ...valid, status: 'lainnya' })).toHaveProperty(
			'status',
			'Choose a valid status'
		);
	});

	it('reports every missing field at once', () => {
		expect(Object.keys(validateMemberInput({})).sort()).toEqual(['email', 'hp', 'nama', 'status']);
	});
});
