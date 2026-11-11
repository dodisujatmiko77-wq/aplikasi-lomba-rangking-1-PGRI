-- =====================================================================
--  CONTOH SOAL (10 soal per jenjang). Opsional — soal juga bisa dikelola
--  dari menu Admin -> Bank Soal. Jalankan setelah schema.sql.
-- =====================================================================
delete from public.soal;

insert into public.soal (jenjang, nomor, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, durasi_detik) values
-- ============================ SD ============================
('SD', 1, 'Hasil dari 125 + 375 adalah ...', '400', '450', '500', '550', 'C', 20),
('SD', 2, 'Ibu kota negara Indonesia yang baru bernama ...', 'Nusantara', 'Jakarta', 'Samarinda', 'Balikpapan', 'A', 20),
('SD', 3, 'Hewan yang berkembang biak dengan cara bertelur disebut ...', 'Vivipar', 'Ovipar', 'Ovovivipar', 'Herbivor', 'B', 20),
('SD', 4, 'Sila ke-3 Pancasila berbunyi ...', 'Ketuhanan Yang Maha Esa', 'Kemanusiaan yang adil dan beradab', 'Persatuan Indonesia', 'Keadilan sosial bagi seluruh rakyat Indonesia', 'C', 20),
('SD', 5, 'Bangun datar yang memiliki 3 sisi disebut ...', 'Persegi', 'Segitiga', 'Trapesium', 'Lingkaran', 'B', 15),
('SD', 6, 'Proses tumbuhan membuat makanan sendiri disebut ...', 'Respirasi', 'Fotosintesis', 'Evaporasi', 'Germinasi', 'B', 20),
('SD', 7, 'Hasil dari 12 x 8 adalah ...', '86', '92', '96', '108', 'C', 15),
('SD', 8, 'Lagu kebangsaan Indonesia Raya diciptakan oleh ...', 'Ismail Marzuki', 'W.R. Supratman', 'C. Simanjuntak', 'Ibu Sud', 'B', 20),
('SD', 9, 'Planet yang paling dekat dengan Matahari adalah ...', 'Venus', 'Bumi', 'Mars', 'Merkurius', 'D', 20),
('SD', 10, 'Lawan kata (antonim) dari "rajin" adalah ...', 'Pandai', 'Malas', 'Tekun', 'Giat', 'B', 15),
-- ============================ SMP ============================
('SMP', 1, 'Nilai x dari persamaan 3x - 7 = 11 adalah ...', '4', '5', '6', '7', 'C', 25),
('SMP', 2, 'Satuan SI untuk gaya adalah ...', 'Joule', 'Newton', 'Watt', 'Pascal', 'B', 20),
('SMP', 3, 'Proklamasi kemerdekaan Indonesia dibacakan pada tanggal ...', '17 Agustus 1945', '20 Mei 1908', '28 Oktober 1928', '1 Juni 1945', 'A', 20),
('SMP', 4, 'Organel sel yang berfungsi sebagai tempat respirasi sel adalah ...', 'Ribosom', 'Lisosom', 'Mitokondria', 'Badan Golgi', 'C', 20),
('SMP', 5, 'Luas lingkaran dengan jari-jari 7 cm (π = 22/7) adalah ...', '44 cm²', '154 cm²', '144 cm²', '308 cm²', 'B', 25),
('SMP', 6, 'Kalimat "Adik sedang membaca buku" termasuk kalimat ...', 'Majemuk', 'Pasif', 'Aktif', 'Tanya', 'C', 20),
('SMP', 7, '"She ___ to school every day." Kata yang tepat adalah ...', 'go', 'goes', 'going', 'gone', 'B', 20),
('SMP', 8, 'Garis khayal yang membagi bumi menjadi belahan utara dan selatan disebut ...', 'Garis bujur', 'Meridian', 'Khatulistiwa', 'Garis balik', 'C', 20),
('SMP', 9, 'Akar kuadrat dari 225 adalah ...', '13', '14', '15', '16', 'C', 15),
('SMP', 10, 'Lembaga negara yang berwenang membentuk undang-undang adalah ...', 'MA', 'DPR', 'MK', 'BPK', 'B', 20),
-- ============================ SMA ============================
('SMA', 1, 'Turunan pertama dari f(x) = 3x² + 2x adalah ...', '6x + 2', '3x + 2', '6x² + 2', '6x', 'A', 25),
('SMA', 2, 'Rumus kimia asam sulfat adalah ...', 'HCl', 'HNO₃', 'H₂SO₄', 'CH₃COOH', 'C', 20),
('SMA', 3, 'Hukum Newton yang menyatakan F = m·a adalah hukum Newton ke- ...', 'I', 'II', 'III', 'IV', 'B', 20),
('SMA', 4, 'Peristiwa Rengasdengklok terjadi pada tanggal ...', '15 Agustus 1945', '16 Agustus 1945', '17 Agustus 1945', '18 Agustus 1945', 'B', 25),
('SMA', 5, 'Nilai dari log₂ 64 adalah ...', '4', '5', '6', '8', 'C', 20),
('SMA', 6, 'Pembelahan sel yang menghasilkan sel gamet disebut ...', 'Mitosis', 'Meiosis', 'Amitosis', 'Fragmentasi', 'B', 20),
('SMA', 7, '"If I ___ rich, I would travel the world." Kata yang tepat adalah ...', 'am', 'was', 'were', 'be', 'C', 20),
('SMA', 8, 'Kurva permintaan umumnya memiliki kemiringan ...', 'Positif', 'Negatif', 'Nol', 'Tak hingga', 'B', 20),
('SMA', 9, 'Nilai dari sin 30° + cos 60° adalah ...', '0', '½', '1', '√3', 'C', 25),
('SMA', 10, 'Majas yang membandingkan dua hal secara langsung tanpa kata pembanding disebut ...', 'Simile', 'Metafora', 'Personifikasi', 'Hiperbola', 'B', 20);
