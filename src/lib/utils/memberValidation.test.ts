import { describe, expect, it } from 'vitest';
import { MAX_EMAIL, MAX_HP, MAX_NAMA, validateMemberInput } from './memberValidation';

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

describe('validateMemberInput bounds', () => {
	it('exports the field limits', () => {
		expect([MAX_NAMA, MAX_EMAIL, MAX_HP]).toEqual([100, 254, 15]);
	});

	it('bounds the name length', () => {
		expect(validateMemberInput({ ...valid, nama: 'a'.repeat(101) })).toHaveProperty(
			'nama',
			'Name must be 100 characters or fewer'
		);
		expect(validateMemberInput({ ...valid, nama: 'a'.repeat(100) })).not.toHaveProperty('nama');
	});

	it('bounds the email length', () => {
		const email = `${'a'.repeat(255 - '@mail.com'.length)}@mail.com`;
		expect(validateMemberInput({ ...valid, email })).toHaveProperty(
			'email',
			'Email must be 254 characters or fewer'
		);
	});

	it('requires an Indonesian mobile prefix', () => {
		expect(validateMemberInput({ ...valid, hp: '1234567890' })).toHaveProperty('hp');
		expect(validateMemberInput({ ...valid, hp: '081234567890' })).not.toHaveProperty('hp');
		expect(validateMemberInput({ ...valid, hp: '6281234567890' })).not.toHaveProperty('hp');
		expect(validateMemberInput({ ...valid, hp: '+6281234567890' })).not.toHaveProperty('hp');
		expect(validateMemberInput({ ...valid, hp: '+62 812-3456-7890' })).not.toHaveProperty('hp');
	});

	it('rejects an email without a domain label', () => {
		expect(validateMemberInput({ ...valid, email: 'user@.com' })).toHaveProperty('email');
		expect(validateMemberInput({ ...valid, email: 'a@b.co' })).not.toHaveProperty('email');
	});
});
