# TokoKu Dashboard — System Design

Dokumen ini menjelaskan arsitektur aplikasi: route, lapisan, alur data, guard, token
visual, dan strategi pengujian. Untuk konteks umum lihat [`CONTEXT.md`](./CONTEXT.md).
Untuk aturan menulis kode lihat [`AGENTS.md`](../AGENTS.md) dan
[`svelte-best-practices.md`](./svelte-best-practices.md).

## 1. Tujuan dan batasan

Dashboard admin toko online fiktif. Fokusnya tampilan: data mock, tanpa backend,
tanpa API, tanpa database. Yang diuji adalah perilaku UI dan logika filter, bukan
integrasi jaringan.

Batasan yang membentuk desain:

- Tidak ada dependensi ikon atau chart; semua SVG ditulis inline.
- Tidak ada gradient, shadow, atau sudut besar. Pemisah memakai border 1px.
- Auth hanya simulasi di memori; guard adalah UX, bukan keamanan.
- SSR dimatikan untuk area dashboard, jadi seluruh state halaman aman di modul.

## 2. Peta route

| Route | File | Akses | Isi |
| --- | --- | --- | --- |
| `/login` | `src/routes/login/+page.svelte` | publik | Form email + kata sandi, panel branding kiri |
| `/` | `src/routes/(dashboard)/+page.svelte` | guard | 4 stat card, line chart, bar chart, tabel pesanan terbaru |
| `/member` | `src/routes/(dashboard)/member/+page.svelte` | guard | Tabel member: cari, filter, sort, paginasi |
| `*` (di dalam shell) | `src/routes/(dashboard)/+error.svelte` | guard | 404 yang tetap menampilkan sidebar + top nav |

Grup `(dashboard)` tidak menambah segmen URL. Fungsinya mengelompokkan route yang
memakai shell dan guard yang sama.

Root `src/routes/+layout.svelte` hanya memasang favicon; shell dashboard ada di
`(dashboard)/+layout.svelte`. Konsekuensinya halaman login tidak pernah merender
sidebar, dan halaman 404 di dalam dashboard tetap mempertahankan navigasi.

## 3. Lapisan

```
routes/            komposisi halaman, state lokal, markup Tailwind
  (dashboard)/     shell + guard + error boundary
lib/components/    komponen presentasional + test colocated
lib/stores/        state lintas komponen (auth, UI)
lib/utils/         fungsi murni: format, filter/sort/paginate
lib/mock/          data contoh
lib/types.ts       tipe domain bersama
```

Aturan arah dependensi: `routes` boleh mengimpor semua lapisan; `components` boleh
mengimpor `utils`, `stores`, `types`; `utils` hanya boleh mengimpor `types`. Tidak ada
lapisan yang mengimpor dari `routes`.

State halaman (filter, sort, halaman aktif) sengaja tinggal di komponen halaman, bukan
di store global. Store hanya dipakai untuk state yang benar-benar lintas komponen:
status login dan status sidebar.

## 4. Alur data halaman member

Satu arah, tanpa efek samping:

```
$state mentah            query, statusFilter, rentang, page, sortKey, sortDir
   │
   ├─ filterMembers()    → $derived terfilter
   ├─ sortMembers()      → $derived terurut
   └─ paginate()         → $derived halaman { items, total, totalPages, from, to }
                              │
                              └─ render tabel / empty state / Pagination
```

- `sekarang` dihitung sekali saat komponen dibuat; filter tanggal memakai acuan itu
  supaya hasil tidak berubah di tengah interaksi.
- Setiap perubahan filter memanggil `resetHalaman()`, sehingga `page` kembali ke 1.
- `ubahSort()` mengganti `sortKey`, membalik arah bila kolom sama, dan mereset halaman.
- Empty state muncul saat `halaman.items.length === 0` dan menyediakan tombol reset.
- Fungsi filter/sort/paginate murni dan menerima `now` sebagai parameter opsional,
  sehingga bisa diuji tanpa memalsukan jam global.

Data member dibuat 50 baris dengan `isoDaysAgo()` supaya filter 7/30/90 hari selalu
berisi. Tanggal tidak di-hardcode agar demo tidak kedaluwarsa.

## 5. Auth dan guard

Alur:

```
/login  ──submit──►  login(email, password)
                        │ validasi format email + password tidak kosong
                        ▼
                    auth.set(true)  ──►  goto('/')
                        │
                        ▼
             (dashboard)/+layout.ts  ──get(auth) false──►  redirect(303, '/login')
```

- `auth` adalah `writable(false)` di memori. Refresh menghapus sesi.
- `ssr = false` pada `(dashboard)/+layout.ts` membuat guard berjalan di browser,
  tempat store tersedia. Tanpa itu, server tidak punya state login.
- Guard hanya memeriksa keberadaan sesi; tidak ada peran, izin, atau expiry.
- Logout ada di dropdown avatar (`UserMenu`), bukan di sidebar: `logout()` lalu
  `goto('/login')`.
- Login yang sudah punya sesi langsung diarahkan ke `/` lewat `onMount`.

Karena guard berada di klien, siapa pun yang memanggil route secara langsung tetap
mendapat shell kosong sampai hidrasi selesai, lalu diarahkan. Ini cukup untuk demo,
tidak cukup untuk produksi. Auth nyata harus di `hooks.server.ts`, memakai cookie
`httpOnly`, dan memeriksa sesi di server sebelum merender data.

## 6. State UI

| State | Lokasi | Sifat |
| --- | --- | --- |
| `auth` | `lib/stores/auth.ts` | global, in-memory |
| `sidebarCollapsed` | `lib/stores/ui.ts` | global, persist sampai refresh |
| `mobileNavOpen` | `lib/stores/ui.ts` | global, drawer mobile |
| `submenu` | `Sidebar.svelte` | lokal, satu submenu terbuka |
| `open` | `UserMenu.svelte` | lokal, dropdown avatar |
| filter/sort/page | `member/+page.svelte` | lokal per halaman |

Drawer mobile memakai `$effect` untuk memasang listener `Escape`, mengunci
`document.body.style.overflow`, dan mengembalikan semuanya di cleanup. Fokus tidak
dijebak (belum ada focus trap); ini batasan yang diketahui.

## 7. Token desain

Token didefinisikan sekali di `src/routes/layout.css` lewat `@theme` Tailwind v4,
lalu dipakai sebagai utility (`bg-primary`, `text-muted`, `border-line`).

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `primary` | `#014BAA` | aksi utama, judul, item aktif |
| `primary-soft` | `#E7EFFB` | latar item aktif, badge |
| `cream` | `#F8F3F0` | latar aplikasi dan top nav |
| `line` / `line-strong` | `#E9E1DB` / `#E3DAD3` | border kartu, tabel, input |
| `ink` | `#2B2B2B` | teks utama |
| `muted` | `#9A9089` | teks sekunder |
| `success` / `warning` / `danger` + varian `-bg`, `-line` | hijau, amber, merah | status pesanan dan member |
| `font-sans` | Plus Jakarta Sans | seluruh teks |

Aturan visual: radius maksimum `rounded-lg`, tanpa `shadow-*`, tanpa `bg-gradient-*`.
Hierarki dibuat dari ukuran teks, berat font, dan border — bukan bayangan.

## 8. Komponen bersama

| Komponen | Peran | Catatan |
| --- | --- | --- |
| `Logo` | wordmark TokoKu | prop `onDark`, `size` |
| `Sidebar` | navigasi utama | item mati dirender sebagai `<button>`, bukan `<a>` |
| `TopNav` | judul halaman + toggle mobile + avatar | tanpa input pencarian |
| `UserMenu` | dropdown profil dan logout | klik luar + Escape menutup |
| `StatCard` | ringkasan angka | tren naik/turun dari data |
| `StatusPill` | status pesanan/member | varian warna dari token |
| `Breadcrumb` | jejak navigasi | item terakhir tanpa tautan |
| `Pagination` | kontrol halaman | callback `onPageChange`, `aria-current` |
| `LineChart` / `BarChart` | grafik SVG inline | tanpa library |

Semua komponen memakai `$props()` bertipe dan tidak menyentuh store kecuali yang
memang global.

## 9. Strategi pengujian

Dua tingkat:

1. **Logika murni** — `src/lib/utils/*.test.ts` dan `src/lib/mock/members.test.ts`.
   Menguji filter (query, status, rentang tanggal), sort (asc/desc, kestabilan),
   paginasi (batas halaman), dan format (Rupiah, tanggal). Tidak butuh DOM.
2. **Komponen dan halaman** — `*.test.ts` colocated memakai
   `@testing-library/svelte` + jsdom. Menguji render, interaksi klik/input, aria
   state, empty state, dan navigasi guard.

Konfigurasi di `vite.config.ts`:

- `environment: 'jsdom'`
- `setupFiles: ['./vitest-setup.ts']`
- `expect.requireAssertions: true` — test tanpa assertion dianggap gagal
- `resolve.conditions: ['browser']` hanya saat `VITEST`, supaya Svelte yang di-mount
  adalah build browser, bukan build server

Perintah: `npm test` (sekali jalan), `npm run test:unit` (watch),
`npm run check` (svelte-check), `npm run build` (verifikasi produksi).

## 10. Build dan deploy

Adapter dipasang di dalam `sveltekit()` pada `vite.config.ts`, bukan di
`svelte.config.js` (proyek ini tidak punya file tersebut). Saat ini memakai
`adapter-auto`, yang hanya mengenali sebagian platform. Tanpa target deploy, build
tetap sukses tetapi menghasilkan peringatan.

Untuk produksi, pilih satu:

- `@sveltejs/adapter-node` → server Node mandiri, cocok untuk VPS/Docker.
- `@sveltejs/adapter-static` → SPA statis; cocok karena dashboard tidak butuh SSR,
  tetapi guard tetap harus diganti auth nyata.
- Adapter platform (Vercel/Netlify/Cloudflare) bila hosting sudah ditentukan.

Langkah rilis: `npm ci` → `npm run check` → `npm test` → `npm run build` → jalankan
output adapter.

## 11. Batasan dan risiko

- **Auth bukan keamanan.** Sesi di memori, guard di klien, tidak ada cookie.
- **Tidak ada persistensi.** Refresh menghapus login dan state sidebar.
- **Data mock.** Tidak ada loading state, error jaringan, atau retry.
- **Menu mati.** Produk, Pesanan, dan Laporan belum punya halaman; submenu Laporan
  hanya contoh label.
- **Tanpa adapter produksi.** Build sukses, belum siap deploy.
- **Aksesibilitas sebagian.** Escape dan `aria-expanded` sudah ada; focus trap dan
  `aria-describedby` untuk pesan error login belum.
- **Grafik dekoratif.** `preserveAspectRatio="none"` membuat titik line chart
  terdistorsi; cukup untuk demo, bukan untuk data yang perlu dibaca presisi.

## 12. Jalur pengembangan berikutnya

Bila demo ini naik jadi produk, urutan perubahan yang masuk akal:

1. Ganti auth memori dengan sesi server (`hooks.server.ts`, cookie `httpOnly`).
2. Tambah `+page.server.ts` untuk memuat data; pindahkan filter ke server bila data
   sudah besar, atau pertahankan filter di klien untuk dataset kecil.
3. Tambah `adapter-node` (atau adapter platform) dan pipeline build.
4. Tambah state loading/error pada tabel dan grafik.
5. Lengkapi halaman Produk, Pesanan, dan Laporan agar tidak ada menu mati.
