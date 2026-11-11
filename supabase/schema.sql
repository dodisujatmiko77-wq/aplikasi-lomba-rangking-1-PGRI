-- =====================================================================
--  LOMBA RANKING 1 PGRI — Skema Database Supabase
--  Jalankan seluruh file ini di Supabase Dashboard -> SQL Editor -> Run
--  (Aman dijalankan ulang: objek lama akan dihapus lalu dibuat kembali.
--   PERHATIAN: menjalankan ulang akan MENGHAPUS data yang sudah ada.)
-- =====================================================================

create extension if not exists pgcrypto;

drop table if exists public.jawaban cascade;
drop table if exists public.skor_peserta cascade;
drop table if exists public.sesi_lomba cascade;
drop table if exists public.soal cascade;
drop table if exists public.peserta cascade;
drop table if exists public.kecamatan cascade;
drop table if exists public.admin_users cascade;

-- ---------------------------------------------------------------------
--  TABEL
-- ---------------------------------------------------------------------

-- Daftar admin/operator lomba (email akun Supabase Auth)
create table public.admin_users (
  email text primary key
);

-- 15 kecamatan peserta
create table public.kecamatan (
  id      serial primary key,
  nama    text not null unique,
  urutan  int  not null default 0
);

-- Peserta: 3 per kecamatan per jenjang  => 45 peserta per jenjang
create table public.peserta (
  id             uuid primary key default gen_random_uuid(),
  jenjang        text not null check (jenjang in ('SD','SMP','SMA')),
  kecamatan_id   int  not null references public.kecamatan(id) on delete restrict,
  nomor_peserta  text unique,
  nama           text not null,
  sekolah        text not null default '',
  kode_akses     text not null default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  created_at     timestamptz not null default now()
);
create index on public.peserta (jenjang, kecamatan_id);

-- Bank soal per jenjang (pilihan ganda A-D)
create table public.soal (
  id             uuid primary key default gen_random_uuid(),
  jenjang        text not null check (jenjang in ('SD','SMP','SMA')),
  nomor          int  not null,
  pertanyaan     text not null,
  pilihan_a      text not null,
  pilihan_b      text not null,
  pilihan_c      text not null,
  pilihan_d      text not null,
  jawaban_benar  char(1) not null check (jawaban_benar in ('A','B','C','D')),
  durasi_detik   int  not null default 20 check (durasi_detik between 5 and 300),
  poin_maks      int  not null default 1000 check (poin_maks > 0),
  created_at     timestamptz not null default now(),
  unique (jenjang, nomor)
);

-- Status lomba per jenjang (1 baris per jenjang)
--   menunggu : lomba belum dimulai
--   soal     : soal sedang tampil & bisa dijawab
--   jeda     : soal ditutup, kunci jawaban ditampilkan
--   selesai  : lomba selesai, juara ditetapkan
create table public.sesi_lomba (
  jenjang          text primary key check (jenjang in ('SD','SMP','SMA')),
  status           text not null default 'menunggu'
                   check (status in ('menunggu','soal','jeda','selesai')),
  soal_id          uuid references public.soal(id) on delete set null,
  soal_ke          int  not null default 0,
  soal_mulai_at    timestamptz,
  soal_selesai_at  timestamptz,
  updated_at       timestamptz not null default now()
);
insert into public.sesi_lomba (jenjang) values ('SD'), ('SMP'), ('SMA');

-- Jawaban peserta (1 jawaban per soal per peserta)
create table public.jawaban (
  id          bigserial primary key,
  peserta_id  uuid not null references public.peserta(id) on delete cascade,
  soal_id     uuid not null references public.soal(id) on delete cascade,
  jenjang     text not null,
  pilihan     char(1) not null check (pilihan in ('A','B','C','D')),
  benar       boolean not null,
  waktu_ms    int not null,
  skor        int not null,
  created_at  timestamptz not null default now(),
  unique (peserta_id, soal_id)
);
create index on public.jawaban (soal_id);

-- Rekap skor (dipakai untuk live score via Realtime)
create table public.skor_peserta (
  peserta_id      uuid primary key references public.peserta(id) on delete cascade,
  jenjang         text not null,
  total_skor      int    not null default 0,
  jumlah_benar    int    not null default 0,
  jumlah_jawab    int    not null default 0,
  total_waktu_ms  bigint not null default 0,  -- akumulasi waktu jawaban benar
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
--  TRIGGER: batas 3 peserta per kecamatan per jenjang + nomor otomatis
-- ---------------------------------------------------------------------
create or replace function public.trg_peserta_validasi()
returns trigger language plpgsql as $$
declare
  v_jumlah int;
  v_slot   int;
begin
  select count(*) into v_jumlah
  from public.peserta
  where jenjang = new.jenjang
    and kecamatan_id = new.kecamatan_id
    and id <> new.id;

  if v_jumlah >= 3 then
    raise exception 'Kecamatan ini sudah memiliki 3 peserta untuk jenjang %', new.jenjang;
  end if;

  if new.nomor_peserta is null or btrim(new.nomor_peserta) = ''
     or (tg_op = 'UPDATE' and (old.jenjang <> new.jenjang or old.kecamatan_id <> new.kecamatan_id)
         and new.nomor_peserta = old.nomor_peserta) then
    for v_slot in 1..3 loop
      new.nomor_peserta := new.jenjang || '-' || lpad(new.kecamatan_id::text, 2, '0') || '-' || v_slot;
      exit when not exists (
        select 1 from public.peserta where nomor_peserta = new.nomor_peserta and id <> new.id
      );
    end loop;
  end if;

  new.kode_akses := upper(btrim(new.kode_akses));
  return new;
end $$;

create trigger peserta_validasi
before insert or update on public.peserta
for each row execute function public.trg_peserta_validasi();

-- ---------------------------------------------------------------------
--  FUNGSI BANTU
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.server_now()
returns timestamptz language sql volatile as $$
  select clock_timestamp();
$$;

-- ---------------------------------------------------------------------
--  RPC PESERTA
-- ---------------------------------------------------------------------

-- Login peserta dengan nomor peserta + kode akses
create or replace function public.login_peserta(p_nomor text, p_kode text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'id', p.id, 'nama', p.nama, 'sekolah', p.sekolah, 'jenjang', p.jenjang,
    'nomor_peserta', p.nomor_peserta, 'kecamatan', k.nama
  )
  from public.peserta p
  join public.kecamatan k on k.id = p.kecamatan_id
  where upper(btrim(p.nomor_peserta)) = upper(btrim(p_nomor))
    and p.kode_akses = upper(btrim(p_kode));
$$;

-- Soal yang sedang aktif (tanpa kunci jawaban selama soal berjalan)
create or replace function public.get_soal_aktif(p_jenjang text)
returns json language plpgsql stable security definer set search_path = public as $$
declare
  s     public.sesi_lomba;
  q     public.soal;
  v_tutup boolean;
  v_total int;
  v_jawab int;
begin
  select * into s from public.sesi_lomba where jenjang = p_jenjang;
  select count(*) into v_total from public.soal where jenjang = p_jenjang;

  if s.soal_id is null or s.status not in ('soal','jeda') then
    return json_build_object('status', s.status, 'soal_ke', s.soal_ke, 'total_soal', v_total);
  end if;

  select * into q from public.soal where id = s.soal_id;
  select count(*) into v_jawab from public.jawaban where soal_id = s.soal_id;

  v_tutup := s.status = 'jeda' or clock_timestamp() > s.soal_selesai_at + interval '1 second';

  return json_build_object(
    'status', s.status,
    'soal_ke', s.soal_ke,
    'total_soal', v_total,
    'soal_id', q.id,
    'pertanyaan', q.pertanyaan,
    'pilihan', json_build_object('A', q.pilihan_a, 'B', q.pilihan_b, 'C', q.pilihan_c, 'D', q.pilihan_d),
    'durasi_detik', q.durasi_detik,
    'poin_maks', q.poin_maks,
    'mulai_at', s.soal_mulai_at,
    'selesai_at', s.soal_selesai_at,
    'ditutup', v_tutup,
    'jumlah_menjawab', v_jawab,
    'jawaban_benar', case when v_tutup then q.jawaban_benar else null end
  );
end $$;

-- Kirim jawaban. Skor dihitung di server berdasarkan kecepatan:
--   benar  : poin_maks x (1 - 0.5 x waktu/durasi)  -> paling cepat ~1000, paling lambat 500
--   salah  : 0
create or replace function public.kirim_jawaban(p_peserta_id uuid, p_kode text, p_pilihan text)
returns json language plpgsql volatile security definer set search_path = public as $$
declare
  v_now     timestamptz := clock_timestamp();
  p         public.peserta;
  s         public.sesi_lomba;
  q         public.soal;
  v_ms      int;
  v_rasio   numeric;
  v_benar   boolean;
  v_skor    int;
  v_pilihan char(1) := upper(btrim(p_pilihan));
begin
  select * into p from public.peserta where id = p_peserta_id and kode_akses = upper(btrim(p_kode));
  if not found then
    raise exception 'Kode akses tidak valid';
  end if;

  select * into s from public.sesi_lomba where jenjang = p.jenjang;
  if s.status <> 'soal' or s.soal_id is null then
    raise exception 'Tidak ada soal yang sedang aktif';
  end if;
  if v_now > s.soal_selesai_at + interval '1 second' then
    raise exception 'Waktu menjawab sudah habis';
  end if;
  if v_pilihan not in ('A','B','C','D') then
    raise exception 'Pilihan jawaban tidak valid';
  end if;

  select * into q from public.soal where id = s.soal_id;

  v_ms    := greatest(0, floor(extract(epoch from (v_now - s.soal_mulai_at)) * 1000))::int;
  v_rasio := least(1, v_ms::numeric / (q.durasi_detik * 1000));
  v_benar := v_pilihan = q.jawaban_benar;
  v_skor  := case when v_benar then round(q.poin_maks * (1 - 0.5 * v_rasio))::int else 0 end;

  insert into public.jawaban (peserta_id, soal_id, jenjang, pilihan, benar, waktu_ms, skor)
  values (p.id, q.id, p.jenjang, v_pilihan, v_benar, v_ms, v_skor)
  on conflict (peserta_id, soal_id) do nothing;
  if not found then
    raise exception 'Anda sudah menjawab soal ini';
  end if;

  insert into public.skor_peserta as sp (peserta_id, jenjang, total_skor, jumlah_benar, jumlah_jawab, total_waktu_ms, updated_at)
  values (p.id, p.jenjang, v_skor, case when v_benar then 1 else 0 end, 1,
          case when v_benar then v_ms else 0 end, v_now)
  on conflict (peserta_id) do update set
    total_skor     = sp.total_skor + excluded.total_skor,
    jumlah_benar   = sp.jumlah_benar + excluded.jumlah_benar,
    jumlah_jawab   = sp.jumlah_jawab + 1,
    total_waktu_ms = sp.total_waktu_ms + excluded.total_waktu_ms,
    updated_at     = v_now;

  return json_build_object('pilihan', v_pilihan, 'waktu_ms', v_ms);
end $$;

-- Hasil jawaban peserta untuk soal tertentu (hanya setelah soal ditutup)
create or replace function public.hasil_jawaban_saya(p_peserta_id uuid, p_kode text, p_soal_id uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare
  s public.sesi_lomba;
  j public.jawaban;
  p public.peserta;
begin
  select * into p from public.peserta where id = p_peserta_id and kode_akses = upper(btrim(p_kode));
  if not found then return null; end if;
  select * into s from public.sesi_lomba where jenjang = p.jenjang;
  if s.soal_id = p_soal_id and s.status = 'soal'
     and clock_timestamp() <= s.soal_selesai_at + interval '1 second' then
    return null; -- belum boleh diungkap
  end if;
  select * into j from public.jawaban where peserta_id = p_peserta_id and soal_id = p_soal_id;
  if not found then return json_build_object('dijawab', false); end if;
  return json_build_object('dijawab', true, 'pilihan', j.pilihan, 'benar', j.benar,
                           'skor', j.skor, 'waktu_ms', j.waktu_ms);
end $$;

-- Papan peringkat per jenjang (semua peserta, urut skor tertinggi)
-- Urutan: total skor ↓, jumlah benar ↓, total waktu benar ↑, nomor peserta ↑
create or replace function public.get_peringkat(p_jenjang text)
returns table (
  peringkat int, peserta_id uuid, nomor_peserta text, nama text, sekolah text,
  kecamatan text, total_skor int, jumlah_benar int, jumlah_jawab int, total_waktu_ms bigint
) language sql stable security definer set search_path = public as $$
  select
    (row_number() over (order by coalesce(sp.total_skor,0) desc, coalesce(sp.jumlah_benar,0) desc,
                               coalesce(sp.total_waktu_ms,0) asc, p.nomor_peserta asc))::int,
    p.id, p.nomor_peserta, p.nama, p.sekolah, k.nama,
    coalesce(sp.total_skor,0), coalesce(sp.jumlah_benar,0), coalesce(sp.jumlah_jawab,0),
    coalesce(sp.total_waktu_ms,0)
  from public.peserta p
  join public.kecamatan k on k.id = p.kecamatan_id
  left join public.skor_peserta sp on sp.peserta_id = p.id
  where p.jenjang = p_jenjang
  order by 1;
$$;

-- ---------------------------------------------------------------------
--  RPC ADMIN (kontrol jalannya lomba)
-- ---------------------------------------------------------------------
create or replace function public.admin_mulai_soal(p_jenjang text, p_soal_ke int)
returns void language plpgsql volatile security definer set search_path = public as $$
declare
  q public.soal;
  v_now timestamptz := clock_timestamp();
begin
  if not public.is_admin() then raise exception 'Akses ditolak: bukan admin'; end if;

  select * into q from public.soal where jenjang = p_jenjang
  order by nomor offset greatest(p_soal_ke - 1, 0) limit 1;
  if not found then raise exception 'Soal ke-% untuk jenjang % tidak ditemukan', p_soal_ke, p_jenjang; end if;

  update public.sesi_lomba set
    status = 'soal', soal_id = q.id, soal_ke = p_soal_ke,
    soal_mulai_at = v_now,
    soal_selesai_at = v_now + make_interval(secs => q.durasi_detik),
    updated_at = v_now
  where jenjang = p_jenjang;
end $$;

create or replace function public.admin_tutup_soal(p_jenjang text)
returns void language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Akses ditolak: bukan admin'; end if;
  update public.sesi_lomba set
    status = 'jeda',
    soal_selesai_at = least(coalesce(soal_selesai_at, clock_timestamp()), clock_timestamp()),
    updated_at = clock_timestamp()
  where jenjang = p_jenjang and status = 'soal';
end $$;

create or replace function public.admin_selesaikan(p_jenjang text)
returns void language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Akses ditolak: bukan admin'; end if;
  update public.sesi_lomba set status = 'selesai', updated_at = clock_timestamp()
  where jenjang = p_jenjang;
end $$;

create or replace function public.admin_reset(p_jenjang text)
returns void language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Akses ditolak: bukan admin'; end if;
  delete from public.jawaban where jenjang = p_jenjang;
  delete from public.skor_peserta where jenjang = p_jenjang;
  update public.sesi_lomba set status = 'menunggu', soal_id = null, soal_ke = 0,
    soal_mulai_at = null, soal_selesai_at = null, updated_at = clock_timestamp()
  where jenjang = p_jenjang;
end $$;

-- ---------------------------------------------------------------------
--  ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.admin_users  enable row level security;
alter table public.kecamatan    enable row level security;
alter table public.peserta      enable row level security;
alter table public.soal         enable row level security;
alter table public.sesi_lomba   enable row level security;
alter table public.jawaban      enable row level security;
alter table public.skor_peserta enable row level security;

-- admin_users: hanya admin yang dapat melihat
create policy admin_users_select on public.admin_users for select using (public.is_admin());

-- kecamatan: publik baca, admin tulis
create policy kecamatan_select on public.kecamatan for select using (true);
create policy kecamatan_admin  on public.kecamatan for all using (public.is_admin()) with check (public.is_admin());

-- peserta: hanya admin (publik membaca lewat RPC get_peringkat)
create policy peserta_admin on public.peserta for all using (public.is_admin()) with check (public.is_admin());

-- soal: hanya admin (peserta membaca lewat RPC get_soal_aktif, tanpa kunci)
create policy soal_admin on public.soal for all using (public.is_admin()) with check (public.is_admin());

-- sesi_lomba: publik baca (status lomba), admin tulis
create policy sesi_select on public.sesi_lomba for select using (true);
create policy sesi_admin  on public.sesi_lomba for all using (public.is_admin()) with check (public.is_admin());

-- jawaban: hanya admin yang membaca; insert lewat RPC kirim_jawaban
create policy jawaban_admin on public.jawaban for all using (public.is_admin()) with check (public.is_admin());

-- skor_peserta: publik baca (live score)
create policy skor_select on public.skor_peserta for select using (true);
create policy skor_admin  on public.skor_peserta for all using (public.is_admin()) with check (public.is_admin());

grant execute on function public.login_peserta(text, text)              to anon, authenticated;
grant execute on function public.get_soal_aktif(text)                   to anon, authenticated;
grant execute on function public.kirim_jawaban(uuid, text, text)        to anon, authenticated;
grant execute on function public.hasil_jawaban_saya(uuid, text, uuid)   to anon, authenticated;
grant execute on function public.get_peringkat(text)                    to anon, authenticated;
grant execute on function public.server_now()                           to anon, authenticated;
grant execute on function public.is_admin()                             to anon, authenticated;

-- ---------------------------------------------------------------------
--  REALTIME
-- ---------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.sesi_lomba;   exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.skor_peserta; exception when duplicate_object then null; end;
  end if;
end $$;
alter table public.skor_peserta replica identity full;

-- ---------------------------------------------------------------------
--  DATA AWAL: 15 kecamatan (silakan ganti nama lewat menu Admin)
-- ---------------------------------------------------------------------
insert into public.kecamatan (nama, urutan)
select 'Kecamatan ' || g, g from generate_series(1, 15) g;

-- ---------------------------------------------------------------------
--  DAFTARKAN ADMIN: ganti email di bawah dengan email akun admin Anda
--  (buat akunnya di Authentication -> Users -> Add user)
-- ---------------------------------------------------------------------
insert into public.admin_users (email) values ('admin@pgri.id');
