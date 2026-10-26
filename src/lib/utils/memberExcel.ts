import type { SheetData } from 'write-excel-file/browser';
import type { Member, MemberStatus } from '#lib/types';
import { formatTanggal } from '#lib/utils/format';
import { validateMemberInput, type MemberInput } from '#lib/utils/memberValidation';

export interface ImportRow {
	row: number;
	input: MemberInput;
}

export interface ImportError {
	row: number;
	message: string;
}

export interface ParsedImport {
	rows: ImportRow[];
	errors: ImportError[];
}

const LABELS: Record<keyof MemberInput, string> = {
	nama: 'Name',
	email: 'Email',
	hp: 'Phone',
	status: 'Status'
};

// Indonesian aliases keep files exported from an older sheet importable.
const ALIASES: Record<keyof MemberInput, string[]> = {
	nama: ['name', 'nama'],
	email: ['email', 'e-mail'],
	hp: ['phone', 'hp', 'telepon'],
	status: ['status']
};

const TEMPLATE_HEADERS = ['Name', 'Email', 'Phone', 'Status'];
const EXPORT_HEADERS = ['Name', 'Email', 'Phone', 'Joined', 'Total Spend', 'Status'];
const HEADER_ROW = TEMPLATE_HEADERS.map((value) => ({ value, fontWeight: 'bold' as const }));
const COLUMNS = [{ width: 28 }, { width: 32 }, { width: 20 }, { width: 14 }];

// Sample rows so the downloaded template is importable without editing.
export const TEMPLATE_ROWS = [
	['Rina Wijaya', 'rina.wijaya@example.com', '081200000001', 'Active'],
	['Dedi Kurniawan', 'dedi.kurniawan@example.com', '081200000002', 'Inactive'],
	['Ayu Lestari', 'ayu.lestari@example.com', '081200000003', 'Active'],
	['Fajar Nugroho', 'fajar.nugroho@example.com', '081200000004', 'Active'],
	['Maya Sari', 'maya.sari@example.com', '081200000005', 'Inactive']
];

function normalizeStatus(raw: string): MemberStatus {
	const value = raw.toLowerCase();
	if (value === 'active' || value === 'aktif') return 'aktif';
	if (value === 'inactive' || value === 'nonaktif') return 'nonaktif';
	return raw as MemberStatus;
}

function statusLabel(status: MemberStatus): string {
	return status === 'aktif' ? 'Active' : 'Inactive';
}

export function parseMemberSheet(data: unknown[][]): ParsedImport {
	const errors: ImportError[] = [];
	const rows: ImportRow[] = [];
	const header = (data[0] ?? []).map((cell) => String(cell ?? '').trim().toLowerCase());
	const index = {} as Record<keyof MemberInput, number>;

	for (const field of Object.keys(LABELS) as (keyof MemberInput)[]) {
		const column = header.findIndex((cell) => ALIASES[field].includes(cell));
		if (column === -1) errors.push({ row: 1, message: `Missing column: ${LABELS[field]}` });
		index[field] = column;
	}
	if (errors.length > 0) return { rows, errors };

	data.slice(1).forEach((cells, offset) => {
		const value = (field: keyof MemberInput) => String(cells[index[field]] ?? '').trim();
		const raw = {
			nama: value('nama'),
			email: value('email'),
			hp: value('hp'),
			status: value('status')
		};
		if (!raw.nama && !raw.email && !raw.hp && !raw.status) return;

		const input: MemberInput = {
			nama: raw.nama,
			email: raw.email,
			hp: raw.hp,
			status: normalizeStatus(raw.status)
		};
		const fieldErrors = validateMemberInput(input);
		if (Object.keys(fieldErrors).length > 0) {
			errors.push({ row: offset + 2, message: Object.values(fieldErrors).join(' · ') });
			return;
		}
		rows.push({ row: offset + 2, input });
	});

	return { rows, errors };
}

export async function readMemberFile(file: File): Promise<ParsedImport> {
	const { readSheet } = await import('read-excel-file/browser');
	return parseMemberSheet(await readSheet(file));
}

export async function downloadTemplate(): Promise<void> {
	const { default: writeXlsxFile } = await import('write-excel-file/browser');

	await writeXlsxFile([
		{ sheet: 'Members', data: [HEADER_ROW, ...TEMPLATE_ROWS], columns: COLUMNS }
	]).toFile('member-import-template.xlsx');
}

export async function exportMembers(members: Member[]): Promise<void> {
	const { default: writeXlsxFile } = await import('write-excel-file/browser');
	const header = EXPORT_HEADERS.map((value) => ({ value, fontWeight: 'bold' as const }));
	const rows: SheetData = members.map((member) => [
		member.nama,
		member.email,
		member.hp,
		formatTanggal(member.bergabung),
		{ value: member.totalBelanja, type: Number, format: '#,##0' },
		statusLabel(member.status)
	]);
	const columns = [{ width: 28 }, { width: 32 }, { width: 20 }, { width: 18 }, { width: 16 }, { width: 12 }];

	await writeXlsxFile([{ sheet: 'Members', data: [header, ...rows], columns }]).toFile(
		`members-${new Date().toISOString().slice(0, 10)}.xlsx`
	);
}
