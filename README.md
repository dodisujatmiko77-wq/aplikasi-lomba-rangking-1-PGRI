# 🏆 Lomba Ranking 1 PGRI

Aplikasi web lomba cerdas cermat **Ranking 1 PGRI** untuk jenjang **SD, SMP, dan SMA** dengan **live score** secara langsung, menggunakan **React + Vite + Tailwind CSS** dan database **Supabase** (PostgreSQL + Realtime + Auth).

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| 3 jenjang | SD, SMP, SMA. Masing-masing lomba berjalan sendiri |
| 45 peserta per jenjang | 15 kecamatan × 3 perwakilan. Batas 3 peserta per kecamatan dijaga oleh database |
| Live score | Papan peringkat diperbarui saat itu juga (Supabase Realtime) dengan animasi naik/turun peringkat |
| Skor berdasarkan kecepatan | Jawaban benar bernilai **500–1.000 poin**: makin cepat, makin tinggi. Jawaban salah atau tidak menjawab bernilai 0 |
| Juara otomatis | Begitu lomba diselesaikan, **3 besar** tiap jenjang langsung ditetapkan dan ditampilkan di podium |
| Aman dari kecurangan | Kunci jawaban tidak pernah dikirim ke peserta selama soal berlangsung. Waktu dan skor dihitung di **server** |
| Panel panitia | Kontrol lomba (mulai, tutup, soal berikutnya, selesaikan, reset), kelola peserta, bank soal, dan nama kecamatan. Unduh CSV kode akses |
| Tampilan modern | Tema gelap dengan efek kaca (glassmorphism), responsif di HP, mode layar penuh untuk proyektor, dan confetti untuk juara |

## 🧮 Rumus Skor

```
benar : skor = poin_maks × (1 − 0,5 × waktu_menjawab / durasi_soal)
salah : skor = 0
```

Contoh dengan poin maks 1.000 dan durasi 20 detik: dijawab benar dalam 1 detik mendapat **975**, dalam 10 detik **750**, dan dalam 20 detik **500**.

**Penentuan peringkat:** total skor tertinggi → jumlah jawaban benar terbanyak → total waktu menjawab benar paling cepat.

## 📄 Halaman

| URL | Untuk | Isi |
|---|---|---|
| `#/` | Umum | Beranda, status tiap jenjang, ketentuan lomba |
| `#/live/SD` · `#/live/SMP` · `#/live/SMA` | Layar proyektor | Soal aktif, hitung mundur, live ranking 45 peserta, podium juara |
| `#/hasil` | Umum | Juara 1–3 setiap jenjang |
| `#/peserta` | Peserta (HP/laptop) | Login dengan nomor peserta dan kode akses, lalu menjawab soal |
| `#/admin` | Panitia | Panel kontrol lomba |

## 🚀 Cara Instalasi

### 1. Siapkan Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, lalu tempel dan jalankan isi file berikut secara berurutan:
   1. `supabase/schema.sql` (wajib): membuat tabel, fungsi, keamanan (RLS), realtime, dan 15 kecamatan.
   2. `supabase/seed_soal_contoh.sql` (opsional): 10 contoh soal per jenjang.
   3. `supabase/seed_peserta_demo.sql` (opsional): 135 peserta demo dengan kode akses `123456`.
3. Buat akun panitia di **Authentication → Users → Add user** (centang *Auto Confirm User*).
4. Daftarkan email akun tersebut sebagai admin di SQL Editor:
   ```sql
   insert into public.admin_users (email) values ('email-panitia@contoh.com');
   ```
   File `schema.sql` sudah membuat contoh admin `admin@pgri.id`. Hapus baris itu jika tidak dipakai.
5. (Disarankan) Matikan pendaftaran publik di **Authentication → Sign In / Providers → Allow new users to sign up**.
6. Pastikan **Realtime** aktif untuk tabel `sesi_lomba` dan `skor_peserta`. `schema.sql` sudah menambahkannya ke publikasi `supabase_realtime`.

### 2. Jalankan aplikasi

```bash
npm install
```

```bash
cp .env.example .env
```

Isi `.env` dengan nilai dari **Project Settings → API**:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

```bash
npm run dev
```

### 3. Deploy (opsional)

```bash
npm run build
```

Unggah folder `dist/` ke Vercel, Netlify, Cloudflare Pages, atau hosting statis lainnya. Jangan lupa mengisi environment variable `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di hosting tersebut. Aplikasi memakai *hash routing*, jadi tidak perlu pengaturan rewrite.

## 🎮 Alur Lomba (untuk Panitia)

1. **Persiapan:** di menu **Admin → Kecamatan**, ganti nama kecamatan. Di **Admin → Peserta**, isi 3 peserta per kecamatan untuk tiap jenjang, lalu klik **CSV + Kode Akses** untuk mencetak kartu login peserta. Di **Admin → Bank Soal**, susun soal tiap jenjang.
2. **Tampilkan** `#/live/SD` (atau SMP/SMA) di proyektor. Klik ikon ⤢ untuk layar penuh.
3. **Peserta login** di `#/peserta` dengan nomor peserta (contoh `SD-01-1`) dan kode akses.
4. Di **Admin → Kontrol Lomba**, klik **Mulai Lomba (Soal 1)**. Soal muncul serentak di layar peserta dan proyektor.
5. Saat waktu habis, soal **otomatis ditutup** dan kunci jawaban tampil. Panitia juga bisa menutupnya lebih awal dengan **Tutup Soal Sekarang**.
6. Klik **Soal Berikutnya**, dan ulangi sampai soal terakhir.
7. Klik **Selesaikan & Tetapkan Juara**. Podium juara 1, 2, 3 tampil di proyektor, layar peserta, dan halaman `#/hasil`.
8. **Reset** menghapus semua jawaban dan skor jenjang tersebut untuk mengulang lomba.

> Lomba SD, SMP, dan SMA bisa dijalankan bersamaan atau bergantian, karena masing-masing punya status sendiri.

## 🗂️ Struktur Proyek

```
supabase/
  schema.sql              # tabel, RPC, RLS, realtime, data kecamatan
  seed_soal_contoh.sql    # contoh soal
  seed_peserta_demo.sql   # peserta demo
src/
  lib/                    # klien Supabase, tipe data, hooks realtime
  components/             # Leaderboard, Podium, Countdown, OpsiJawaban, dll.
  pages/                  # Beranda, LiveScore, Hasil, PesertaMasuk, PesertaLomba
  pages/admin/            # Kontrol, KelolaPeserta, KelolaSoal, KelolaKecamatan
```

## 🔐 Catatan Keamanan

- Tabel `soal`, `peserta`, dan `jawaban` hanya bisa dibaca admin. Publik mengakses data lewat fungsi RPC yang menyembunyikan kunci jawaban dan kode akses.
- Jawaban dikirim lewat RPC `kirim_jawaban`. Server memeriksa kode akses, batas waktu (toleransi 1 detik untuk latensi jaringan), dan mencegah menjawab dua kali.
- Hitung mundur di semua layar disinkronkan dengan jam server.
