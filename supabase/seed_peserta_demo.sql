-- =====================================================================
--  PESERTA DEMO: 3 peserta x 15 kecamatan x 3 jenjang = 135 peserta.
--  Opsional — untuk uji coba. Kode akses demo = "123456" agar mudah dicoba.
--  Jalankan setelah schema.sql.
-- =====================================================================
delete from public.peserta;

with nama_depan(n, nama) as (
  select row_number() over (), x from unnest(array[
    'Ahmad','Siti','Budi','Dewi','Rizky','Putri','Fajar','Nabila','Dimas','Aulia',
    'Bayu','Citra','Galih','Intan','Hendra','Laras','Ilham','Maya','Joko','Nadia',
    'Kevin','Olivia','Lutfi','Rani','Bagas','Salsa','Naufal','Tiara','Rafi','Zahra'
  ]) x
), nama_belakang(n, nama) as (
  select row_number() over (), x from unnest(array[
    'Pratama','Lestari','Saputra','Wulandari','Hidayat','Permata','Nugroho','Anggraini','Setiawan','Kusuma',
    'Ramadhan','Safitri','Wibowo','Maharani','Firmansyah'
  ]) x
)
insert into public.peserta (jenjang, kecamatan_id, nama, sekolah, kode_akses)
select
  j.jenjang,
  k.id,
  (select nama from nama_depan where n = 1 + ((k.id * 3 + s + j.idx * 7) % 30)) || ' ' ||
  (select nama from nama_belakang where n = 1 + ((k.id + s * 5 + j.idx * 2) % 15)),
  j.jenjang || ' Negeri ' || ((k.id - 1) * 3 + s) || ' ' || k.nama,
  '123456'
from public.kecamatan k
cross join (values ('SD', 0), ('SMP', 1), ('SMA', 2)) as j(jenjang, idx)
cross join generate_series(1, 3) s
order by j.idx, k.id, s;
