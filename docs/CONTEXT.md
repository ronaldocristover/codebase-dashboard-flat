# TokoKu Dashboard — Context

Dokumen ini konteks proyek untuk manusia dan agent. Untuk arsitektur detail, lihat
[`SYSTEM-DESIGN.md`](./SYSTEM-DESIGN.md). Untuk aturan menulis kode, lihat
[`AGENTS.md`](../AGENTS.md) dan [`svelte-best-practices.md`](./svelte-best-practices.md).

## Apa ini

Dashboard admin toko online fiktif **TokoKu**. Demo UI, bukan produk produksi.
Semua data mock, tidak ada backend, tidak ada API.

Status: selesai dan terverifikasi.

- `npm test` → 12 file, 65 test lulus
- `npm run check` → 0 error, 0 warning
- `npm run build` → sukses (dengan peringatan `adapter-auto`)
- `/`, `/member`, `/login` → 200

## Stack

| Bagian | Pilihan |
| --- | --- |
| Framework | SvelteKit 3, Svelte 5 (runes), TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (`@theme` tokens, tanpa config file) |
| Test | Vitest 4 + jsdom + `@testing-library/svelte` |
| Ikon/chart | SVG inline. Tidak ada library ikon atau chart. |
| Font | Plus Jakarta Sans (Google Fonts, `src/app.html`) |
| Adapter | `adapter-auto` (belum ada target deploy) |

## Perintah

```sh
npm run dev                 # dev server
npm run dev -- --port 5174  # port lain
npm test                    # seluruh test (sekali jalan)
npm run test:unit           # vitest watch
npm run check               # svelte-check + sync
npm run build               # build produksi
npm run preview             # preview hasil build
```

Jangan matikan dev server dengan `pkill -f "vite dev --port 5174"` dari shell yang
sama — pola itu cocok dengan command line shell itu sendiri dan ikut membunuhnya.
Pakai `kill $(lsof -t -i:5174)`.

## Peta direktori

```
src/
  app.html                     font, <html lang="id">, judul
  lib/
    components/                komponen UI + test colocated
    mock/                      data contoh (members, dashboard)
    stores/                    auth + UI state (in-memory)
    utils/                     format + filter/sort/paginate (pure)
    types.ts                   tipe domain
  routes/
    layout.css                 @theme design tokens + body
    +layout.svelte             root (favicon)
    login/                     halaman login
    (dashboard)/               shell: sidebar + top nav
      +layout.ts               guard (ssr = false)
      +layout.svelte           shell
      +error.svelte            404 yang tetap memakai shell
      +page.svelte             dashboard
      member/+page.svelte      tabel member
```

## Konvensi inti

- Import internal memakai `#lib/*` (`$lib` dihapus di SvelteKit 3).
- Svelte 5 runes: `$state`, `$derived`, `$effect`, `$props`. Tidak ada `export let`,
  `$:`, `on:click`, atau slot.
- Logika non-UI berupa fungsi murni di `src/lib/utils/` dan diuji terpisah.
- Komponen menerima props bertipe; tidak ada store global untuk state halaman.
- Teks UI berbahasa Indonesia; identifier kode berbahasa Indonesia bila domainnya
  Indonesia (`bergabung`, `totalBelanja`, `anggota`), selain itu Inggris.
- Tailwind utility langsung di markup. Warna dari token `@theme`, bukan hex bebas.
- Flat design: tanpa gradient, tanpa shadow, tanpa sudut besar.

## Batasan yang disengaja

- **Auth palsu.** `src/lib/stores/auth.ts` menerima email valid + password non-kosong,
  disimpan di memori. Refresh = logout. Guard hanya UX, bukan keamanan.
- **Data mock.** Tanggal member dibuat relatif terhadap hari ini (`isoDaysAgo`) supaya
  filter 7/30/90 hari tidak pernah kosong.
- **Menu mati.** Produk, Pesanan, dan Laporan sengaja belum punya halaman; dirender
  sebagai tombol non-navigasi. Route tak dikenal memakai `(dashboard)/+error.svelte`.
- **Tanpa adapter produksi.** Build sukses tetapi tidak siap deploy.

## Riwayat keputusan

- SvelteKit 3 (bukan 2) karena itu yang dihasilkan `sv create` saat proyek dibuat.
- Test pindah dari mode browser Playwright ke jsdom karena Playwright tidak tersedia
  di mesin ini.
- `resolve.conditions: ['browser']` hanya aktif saat `VITEST`, supaya
  `@testing-library/svelte` me-mount versi browser Svelte, bukan versi server.
- State sidebar sengaja di store modul, bukan `localStorage`: reset tiap refresh.
- Guard di `(dashboard)/+layout.ts` dengan `ssr = false`; shell tidak dirender server.
