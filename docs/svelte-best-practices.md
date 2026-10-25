# Best Practices — Svelte 5 dan SvelteKit 3

Aturan di dokumen ini diturunkan dari dokumentasi resmi (lihat
[Sumber](#sumber)) dan dari pola yang sudah dipakai di repo ini. Setiap aturan
disertai contoh nyata di repo, supaya agent tidak mengarang API.

Versi proyek: Svelte `^5.57`, SvelteKit `^3.0`, Vite `^8`, Tailwind `^4`.

## 1. Runes wajib

Runes mode dipaksa untuk seluruh kode proyek di `vite.config.ts`:

```ts
sveltekit({
	compilerOptions: {
		runes: ({ filename }) =>
			filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	}
});
```

Konsekuensinya, pola Svelte 4 berikut **tidak boleh** muncul:

| Jangan | Pakai |
| --- | --- |
| `export let nama` | `let { nama } = $props()` |
| `$: harga = qty * unit` | `const harga = $derived(qty * unit)` |
| `on:click={...}` | `onclick={...}` |
| `<slot />` | `{@render children()}` |
| `$: { ... }` untuk efek samping | `$effect(() => { ... })` |
| `$app/stores` | `$app/state` |
| `$app/environment` | `$app/env` |
| `$env/static/*`, `$env/dynamic/*` | `src/env.ts` + `$app/env/public` / `$app/env/private` |

## 2. `$state` untuk data yang berubah

`$state` membuat nilai reaktif. Objek dan array dibungkus proxy, jadi mutasi
bersarang ikut terdeteksi.

Contoh repo — `src/routes/(dashboard)/member/+page.svelte`:

```ts
let query = $state('');
let statusFilter = $state<'semua' | MemberStatus>('semua');
let rentang = $state<'semua' | 7 | 30 | 90>('semua');
let page = $state(1);
let sortKey = $state<SortKey>('bergabung');
let sortDir = $state<SortDir>('desc');
```

Aturan:

- Beri tipe generik saat nilai awal tidak mewakili seluruh domain
  (`$state<'semua' | 7 | 30 | 90>('semua')`).
- Jangan menaruh data besar yang tidak pernah dimutasi di `$state`; gunakan
  `$state.raw` atau konstanta biasa.
- State halaman tetap lokal di komponen halaman. Naikkan ke store hanya bila
  benar-benar dipakai lintas komponen.

## 3. `$derived` untuk nilai turunan, bukan `$effect`

`$derived` menghitung nilai dari nilai lain dan tidak punya efek samping. Ini
pilihan pertama setiap kali ada "nilai B dihitung dari nilai A".

Contoh repo — pipeline tabel member:

```ts
const terfilter = $derived(
	filterMembers(members, { query, status: statusFilter, joinedWithin: rentang }, sekarang)
);
const terurut = $derived(sortMembers(terfilter, sortKey, sortDir));
const halaman = $derived(paginate(terurut, page, PER_HALAMAN));
```

Untuk perhitungan multi-baris, pakai `$derived.by` — contoh di
`src/lib/components/Pagination.svelte`:

```ts
const nomor = $derived.by(() => {
	if (totalPages === 0) return [];
	const jumlah = Math.min(5, totalPages);
	const mulai = Math.max(1, Math.min(page - 2, totalPages - jumlah + 1));
	return Array.from({ length: jumlah }, (_, i) => mulai + i);
});
```

Jangan menyalin hasil turunan ke `$state` lewat `$effect`; itu membuat dua sumber
kebenaran dan satu render tambahan.

## 4. `$effect` hanya untuk efek samping

`$effect` dipakai untuk menyentuh dunia luar: DOM listener, `document.body`,
timer, API browser. Selalu kembalikan cleanup.

Contoh repo — `src/lib/components/UserMenu.svelte`:

```ts
$effect(() => {
	if (!open) return;

	const klikLuar = (event: MouseEvent) => {
		if (akar && !akar.contains(event.target as Node)) open = false;
	};
	const tombolEsc = (event: KeyboardEvent) => {
		if (event.key === 'Escape') open = false;
	};

	document.addEventListener('click', klikLuar);
	document.addEventListener('keydown', tombolEsc);

	return () => {
		document.removeEventListener('click', klikLuar);
		document.removeEventListener('keydown', tombolEsc);
	};
});
```

Aturan:

- Baca dependency di dalam effect supaya pelacakan otomatis benar. Nilai yang
  dibaca di dalam `if` yang tidak jalan tidak menjadi dependency.
- Jangan memakai `$effect` untuk menurunkan nilai, mengubah state lain, atau
  menyinkronkan props.
- Efek yang butuh nilai tanpa melacaknya: `untrack(() => ...)` dari `svelte`.
- Efek yang hanya boleh jalan sekali saat mount: `onMount` lebih jelas maksudnya.
- Listener global di komponen yang sering di-mount/unmount wajib punya cleanup.

## 5. Props bertipe dan `$bindable`

Semua komponen menerima props lewat `$props()` dengan tipe eksplisit.

```svelte
<script lang="ts">
	let { judul, onToggleMenu }: { judul: string; onToggleMenu: () => void } = $props();
</script>
```

- Default value ditulis di destrukturisasi: `let { size = 'md' } = $props()`.
- Anak tidak boleh memutasi props. Bila anak perlu mengubah nilai milik induk,
  pilihan pertama adalah callback (`onPageChange` di `Pagination.svelte`).
- `$bindable()` hanya bila dua arah memang diperlukan:

```svelte
<script lang="ts">
	let { value = $bindable('') } = $props();
</script>
```

Repo ini belum memakai `$bindable`; pertahankan pola callback agar aliran data
tetap satu arah.

## 6. Snippets menggantikan slot

Layout dashboard memakai children snippet:

```svelte
<script lang="ts">
	import type { LayoutProps } from './$types';
	let { children }: LayoutProps = $props();
</script>

<main>{@render children()}</main>
```

Snippet bernama bisa menjadi prop implisit:

```svelte
<Table data={fruits}>
	{#snippet header()}<th>fruit</th>{/snippet}
	{#snippet row(d)}<td>{d.name}</td>{/snippet}
</Table>
```

Jangan mencampur `<slot />` dengan snippet. Snippet yang butuh parameter
dideklarasikan dengan parameter, bukan lewat slot props.

## 7. State modul dan kebocoran SSR

Store di `src/lib/stores/` adalah singleton modul — dibuat sekali per proses.
Di server, singleton dipakai bersama antarrequest, sehingga state pengguna bisa
bocor ke pengguna lain.

Repo ini aman karena `src/routes/(dashboard)/+layout.ts` menetapkan `ssr = false`
untuk seluruh area dashboard. **Jangan hapus `ssr = false` selama auth masih
disimpan di store memori.**

Aturan:

- State per pengguna/request harus berasal dari `load` (server) atau cookie, bukan
  dari variabel modul.
- State UI murni (sidebar, drawer) boleh di modul selama area tersebut
  client-only.
- Bila nanti SSR diaktifkan, pindahkan auth ke `hooks.server.ts` + `event.locals`
  dan kirim datanya lewat `load`.
- Store `writable` tetap kompatibel dengan runes: `$sidebarCollapsed` di
  `Sidebar.svelte` adalah auto-subscription. Jangan menulis `get(store)` di
  markup; itu mematikan reaktivitas.

## 8. SvelteKit 3: import `#lib`, bukan `$lib`

SvelteKit 3 memakai alias `#lib`. Di repo ini alias didefinisikan dua kali:

- `package.json` → `"imports": { "#lib": "./src/lib/index.js", "#lib/*": "./src/lib/*" }`
- `tsconfig.json` → `paths` untuk TypeScript dan editor

Contoh pemakaian:

```ts
import { auth } from '#lib/stores/auth';
import { filterMembers } from '#lib/utils/memberFilters';
```

Aturan:

- Import internal selalu `#lib/...`; jangan menulis `../../lib/...`.
- Tambahkan export di `src/lib/index.ts` hanya bila memang bagian dari API
  publik library. Saat ini file itu hanya berisi komentar; impor langsung per
  modul lebih jelas.
- `$lib` adalah alias lama; jangan dipakai di kode baru.

## 9. `$app/state` menggantikan `$app/stores`

`page`, `navigating`, dan `updated` sekarang diimpor dari `$app/state` dan sudah
reaktif dengan runes. Jangan menulis `$page`.

Contoh repo — `src/routes/(dashboard)/+layout.svelte`:

```ts
import { page } from '$app/state';

const judul = $derived(page.url.pathname.startsWith('/member') ? 'Member' : 'Dashboard');
```

`Sidebar.svelte` juga memakai `page.url.pathname` untuk menentukan item aktif.

Aturan:

- Bungkus pembacaan `page.*` di `$derived` bila nilainya berubah antar navigasi;
  `$:` tidak akan memperbaruinya.
- `page.error` tersedia untuk menampilkan error; `+error.svelte` memakai
  `page.status`.
- `page.data` berisi gabungan hasil `load`; jangan menyalinnya ke store.

## 10. Route group, guard, dan redirect

Struktur `src/routes/(dashboard)/` mengelompokkan halaman yang berbagi shell tanpa
mengubah URL. Guard ada di `+layout.ts`:

```ts
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { auth } from '#lib/stores/auth';

export const ssr = false;

export function load() {
	if (!get(auth)) {
		redirect(303, '/login');
	}
}
```

Aturan:

- `redirect()` dari `@sveltejs/kit` dilempar, bukan `return`; jangan menangkapnya
  dengan `try/catch` kosong.
- Gunakan status `303` untuk redirect setelah perubahan state.
- Guard di `load` universal hanya UX. Otorisasi nyata harus di server
  (`hooks.server.ts` atau `+page.server.ts`) karena kode klien bisa dilewati.
- Halaman yang butuh shell dan 404 kustom menaruh `+error.svelte` di dalam grup,
  seperti `(dashboard)/+error.svelte`.
- `export const ssr = false` dipasang di layout yang paling dekat dengan
  kebutuhan, bukan di root, supaya halaman publik tetap bisa dirender server.

## 11. Load dan form actions

Repo ini belum memakai `load` untuk data karena semua data mock. Pola yang benar
saat data nyata ditambahkan:

```ts
// +page.server.ts
export async function load({ fetch }) {
	const res = await fetch('/api/members');
	return { members: await res.json() };
}
```

- `+page.ts` untuk load universal (jalan di server saat SSR, lalu di klien saat
  navigasi); `+page.server.ts` untuk akses database/rahasia.
- Kembalikan data mentah yang serializable; jangan mengembalikan class atau fungsi.
- Form mutasi memakai actions + `use:enhance` agar tetap bekerja tanpa JavaScript:

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<form method="POST" use:enhance>
	<input name="nama" />
	<button>Simpan</button>
</form>
```

- Validasi selalu diulang di server. Validasi klien hanya untuk UX.

## 12. Environment variables dan `defineEnvVars`

SvelteKit 3 memusatkan env di `src/env.ts` dengan `defineEnvVars` dari
`@sveltejs/kit/env`:

```ts
import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_API_URL: { public: true, schema: (v) => v ?? 'http://localhost:5173' },
	SESSION_SECRET: { public: false }
});
```

- `public: true` → boleh diimpor dari `$app/env/public` (ikut ke browser).
- `public: false` (default) → hanya dari `$app/env/private`, yang server-only.
- `schema` memvalidasi saat start; gagal cepat lebih baik daripada `undefined`
  yang menjalar.
- `static: true` meng-inline nilai saat build dan membuka dead-code elimination.
- `$app/env` menyediakan `browser`, `building`, `dev`, `version` — pengganti
  `$app/environment`.
- Jangan pernah menaruh secret di `public: true` atau di `$app/env/public`.
- Proyek ini belum punya env; tambahkan `src/env.ts` hanya saat ada variabel nyata.

## 13. Adapter dan build

Di SvelteKit 3, adapter diberikan ke `sveltekit()` di `vite.config.ts`:

```ts
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit({ adapter: adapter() })]
});
```

- `adapter-auto` hanya untuk platform yang dikenali; tanpa target deploy ia
  memberi peringatan. Untuk produksi pilih `adapter-node`, `adapter-static`, atau
  adapter platform.
- `adapter-static` cocok untuk dashboard client-only, tetapi tidak menggantikan
  auth server.
- Build diverifikasi dengan `npm run build`, bukan hanya `npm run dev`.

## 14. Tailwind v4 dan token

- Token desain hanya di `src/routes/layout.css` dalam blok `@theme`. Jangan
  menulis hex langsung di markup.
- Warna dipakai lewat utility: `bg-primary`, `text-muted`, `border-line`,
  `bg-success-bg`.
- Tidak ada `tailwind.config.js`; konfigurasi berbasis CSS.
- Flat design: tanpa `shadow-*`, tanpa `bg-gradient-*`, radius maksimum
  `rounded-lg`.
- Import CSS hanya sekali, di root layout (`src/routes/+layout.svelte`).

## 15. Aksesibilitas

Pola yang sudah dipakai dan harus dipertahankan:

- Tombol ikon punya `aria-label` (toggle menu, panah paginasi).
- Dropdown memakai `aria-haspopup`, `aria-expanded`, `role="menu"`, dan menutup
  dengan Escape.
- Halaman aktif paginasi memakai `aria-current="page"`.
- Item navigasi yang tidak punya halaman dirender `<button>`, bukan `<a href="#">`.
- Input filter punya `aria-label` karena label visualnya adalah placeholder.
- Fokus terlihat: jangan hapus `outline` tanpa pengganti (`focus:border-primary`
  saja belum cukup untuk semua kasus).

Yang belum ada dan boleh ditambahkan saat menyentuh komponen terkait: focus trap
untuk drawer mobile, `aria-describedby` + `role="alert"` untuk pesan error login,
dan `aria-live` untuk hasil filter yang berubah.

## 16. Pengujian

- Logika non-UI diuji sebagai fungsi murni di `src/lib/utils/*.test.ts`. Teruskan
  `now` sebagai parameter agar test tidak bergantung jam asli.
- Komponen diuji dengan `@testing-library/svelte`; query memakai role/label, bukan
  class CSS.
- Test diletakkan colocated: `Pagination.test.ts` di sebelah `Pagination.svelte`.
- `expect.requireAssertions: true` berarti setiap test wajib punya assertion.
- `resolve.conditions: ['browser']` hanya saat `VITEST`; tanpa itu
  `@testing-library/svelte` bisa memuat build server Svelte dan gagal mount.
- Setiap bug fix dimulai dari test yang gagal (RED), lalu implementasi (GREEN).
- Jalankan `npm test` dan `npm run check` sebelum commit.

## 17. Gaya kode proyek

- TypeScript strict; tidak ada `any` tanpa alasan yang ditulis di komentar.
- Nama domain berbahasa Indonesia bila domainnya Indonesia: `bergabung`,
  `totalBelanja`, `anggota`, `halaman`. Nama teknis umum tetap Inggris:
  `filterMembers`, `sortMembers`, `onPageChange`.
- Teks UI berbahasa Indonesia, termasuk pesan error dan empty state.
- Komentar hanya untuk "mengapa" yang tidak terlihat dari kode. Batasan yang
  disengaja memakai format `shortcut: <batas>, <kapan ditingkatkan>`.
- Tidak menambah dependensi untuk hal yang bisa ditulis dengan API platform
  (ikon, chart, date library).

## 18. Memakai Svelte MCP

Proyek ini mendaftarkan server MCP `svelte` lewat `opencode.jsonc`
(`npx -y @sveltejs/mcp`). Gunakan sebelum menjawab pertanyaan API Svelte:

1. `list-sections` → cari bagian dokumentasi yang relevan.
2. `get-documentation` → ambil dokumentasi terbaru untuk bagian tersebut.
3. `svelte-autofixer` → jalankan pada kode Svelte yang baru ditulis sampai tidak
   ada saran tersisa.
4. `playground-link` → hanya untuk potongan kode yang tidak ditulis ke file.

Aturan: jangan menjawab API Svelte/SvelteKit dari ingatan bila MCP atau Context7
tersedia. Dokumentasi menang atas kebiasaan.

## Sumber

Diambil lewat Context7 pada 2026-10-25, lalu diverifikasi ke halaman resmi:

- Context7 library `/websites/svelte_dev_svelte` — Svelte 5: runes, `$state`,
  `$derived`, `$effect`, `$props`, `$bindable`, snippet, store.
- Context7 library `/websites/svelte_dev_kit` — SvelteKit 3: `load`, `$app/state`,
  `defineEnvVars`, adapter, testing.
- <https://svelte.dev/docs/svelte/$state>
- <https://svelte.dev/docs/svelte/$derived>
- <https://svelte.dev/docs/svelte/$effect>
- <https://svelte.dev/docs/svelte/snippet>
- <https://svelte.dev/docs/kit/load>
- <https://svelte.dev/docs/kit/$app-state>
- <https://svelte.dev/docs/kit/$app-env>
- <https://svelte.dev/docs/kit/@sveltejs-kit-env>
- <https://svelte.dev/docs/kit/adapters>
- <https://svelte.dev/docs/kit/auth>
- <https://svelte.dev/docs/ai/mcp>
- <https://svelte.dev/docs/ai/tools>
