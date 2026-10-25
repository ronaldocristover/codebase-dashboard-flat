# TokoKu Dashboard

Dashboard admin toko online fiktif dengan desain flat. Dibangun dengan SvelteKit 3,
Svelte 5 (runes), TypeScript, dan Tailwind CSS v4. Semua data mock — tanpa backend,
tanpa API.

## Menjalankan

```sh
npm install
npm run dev
```

Buka `http://localhost:5173`. Login menerima email valid apa pun dengan kata sandi
non-kosong (mis. `rina@tokoku.id` / `rahasia`). Sesi disimpan di memori, jadi refresh
berarti logout.

## Perintah

```sh
npm test          # seluruh test
npm run test:unit # vitest watch
npm run check     # svelte-check
npm run build     # build produksi
npm run preview   # preview hasil build
```

## Isi

- `/login` — form masuk dengan panel branding
- `/` — stat card, tren penjualan, pesanan 7 hari, pesanan terbaru
- `/member` — tabel member dengan pencarian, filter status/tanggal, sort, paginasi
- Sidebar responsif (drawer di mobile), dropdown avatar dengan logout

## Struktur

```
src/lib/components/   komponen UI + test colocated
src/lib/mock/         data contoh
src/lib/stores/       auth dan state UI (in-memory)
src/lib/utils/        format, filter, sort, paginasi (fungsi murni)
src/routes/           halaman, shell dashboard, guard
```

## Dokumentasi

- [Konteks proyek](docs/CONTEXT.md)
- [System design](docs/SYSTEM-DESIGN.md)
- [Best practices Svelte 5 & SvelteKit 3](docs/svelte-best-practices.md)
- [Aturan agent](AGENTS.md)

## Batasan

Demo UI, bukan produk produksi. Auth hanya simulasi di memori dan guard berjalan di
klien. Menu Produk, Pesanan, dan Laporan belum punya halaman. Belum ada adapter
deploy.
