# AGENTS.md — TokoKu Dashboard

Aturan untuk agent yang bekerja di repo ini. Baca juga:

- [`docs/CONTEXT.md`](docs/CONTEXT.md) — konteks proyek, perintah, batasan
- [`docs/SYSTEM-DESIGN.md`](docs/SYSTEM-DESIGN.md) — route, lapisan, alur data
- [`docs/svelte-best-practices.md`](docs/svelte-best-practices.md) — aturan Svelte 5 / SvelteKit 3

## Apa ini

Dashboard admin toko online fiktif. Data mock, tanpa backend. Fokus: UI flat,
responsif, berbahasa Indonesia.

## Perintah

```sh
npm run dev                 # dev server (default 5173)
npm test                    # semua test, sekali jalan
npm run test:unit           # vitest watch
npm run check               # svelte-check, wajib 0 error
npm run build               # verifikasi build
```

Jangan hentikan dev server dengan `pkill -f "vite dev"`; pola itu bisa membunuh
shell pemanggil. Pakai `kill $(lsof -t -i:5174)`.

## Struktur dan import

- Import internal wajib `#lib/...` (`$lib` sudah tidak dipakai di SvelteKit 3).
- `src/routes/` untuk halaman dan komposisi; `src/lib/components/` untuk komponen;
  `src/lib/utils/` untuk logika murni; `src/lib/stores/` untuk state global;
  `src/lib/mock/` untuk data contoh.
- Jangan mengimpor dari `src/routes/` ke dalam `src/lib/`.
- Logika filter/sort/paginate/format harus berupa fungsi murni di `utils`,
  bukan di dalam markup.

## Svelte 5

- Runes mode dipaksa compiler. Jangan pakai `export let`, `$:`, `on:click`, slot,
  atau store auto-subscription untuk state halaman.
- `$state` untuk nilai yang berubah, `$derived` / `$derived.by` untuk nilai
  turunan, `$effect` hanya untuk efek samping dengan cleanup.
- Props selalu bertipe: `let { x }: { x: string } = $props()`.
- Anak tidak memutasi props; gunakan callback (`onPageChange`) atau `$bindable`
  bila benar-benar perlu.
- Jangan menjawab pertanyaan API Svelte dari ingatan. Pakai Svelte MCP di
  `opencode.jsonc` (`list-sections`, `get-documentation`, `svelte-autofixer`) atau
  Context7, lalu ikuti dokumentasi terbaru.

## SvelteKit 3

- Navigasi state dari `$app/state` (`page`, `navigating`), bukan `$app/stores`.
- Info runtime dari `$app/env` (`browser`, `building`, `dev`), bukan
  `$app/environment`.
- Environment variable baru lewat `src/env.ts` + `defineEnvVars`; jangan pakai
  `$env/*`.
- Adapter dipasang di `vite.config.ts` dalam `sveltekit()`. Tidak ada
  `svelte.config.js`.
- Guard ada di `(dashboard)/+layout.ts` dengan `ssr = false`. Jangan hapus
  `ssr = false` selama auth masih di store memori.
- Redirect memakai `redirect(303, '/login')` dan dilempar, bukan di-return.

## UI dan styling

- Token warna dan font hanya di `src/routes/layout.css` (`@theme`). Jangan menulis
  hex langsung di markup.
- Palet: `primary #014BAA`, `cream #F8F3F0`, plus token `line`, `ink`, `muted`,
  `success`, `warning`, `danger`.
- Flat design: tanpa gradient, tanpa `shadow-*`, radius maksimum `rounded-lg`.
- Ikon dan chart ditulis SVG inline. Jangan menambah library ikon/chart.
- Font Plus Jakarta Sans sudah dimuat di `src/app.html`.
- Seluruh teks UI berbahasa Indonesia.
- Layout harus tetap bekerja di mobile: tabel lebar memakai `overflow-x-auto`,
  sidebar menjadi drawer.

## Aksesibilitas

- Setiap tombol ikon butuh `aria-label`.
- Dropdown: `aria-haspopup`, `aria-expanded`, tutup dengan Escape dan klik luar.
- Paginasi aktif: `aria-current="page"`.
- Item navigasi tanpa halaman dirender `<button>`, bukan `<a href="#">`.
- Jangan menghapus indikator fokus tanpa pengganti yang jelas.

## Testing

- Setiap logika baru non-trivial butuh test.
- Test colocated: `Nama.test.ts` di samping `Nama.svelte`.
- Query memakai role/label, bukan selector class.
- `expect.requireAssertions` aktif: test tanpa assertion gagal.
- Bug fix: tulis test yang gagal dulu, lalu perbaiki.
- Sebelum selesai: `npm test` dan `npm run check` harus lulus.

## Batasan yang harus dipertahankan

- Auth adalah simulasi memori (`src/lib/stores/auth.ts`). Komentar `shortcut:`
  di sana menjelaskan batasnya; jangan menghapusnya tanpa mengganti auth dengan
  sesi server.
- Data mock boleh berubah, tetapi tanggal member harus tetap relatif
  (`isoDaysAgo`) agar filter 7/30/90 hari tidak kosong.
- Menu Produk, Pesanan, Laporan sengaja belum punya halaman.
- Belum ada adapter produksi. Jangan mengklaim siap deploy.

## Jangan

- Jangan menambah dependensi untuk hal yang bisa diselesaikan API platform.
- Jangan mengubah `package.json`/`tsconfig.json` tanpa alasan yang jelas.
- Jangan menulis komentar yang mengulang isi kode.
- Jangan memformat ulang file yang tidak terkait perubahan.
- Jangan commit rahasia, token, atau file `.env`.
