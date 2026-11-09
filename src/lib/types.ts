export type Jenjang = 'SD' | 'SMP' | 'SMA'
export const JENJANG: Jenjang[] = ['SD', 'SMP', 'SMA']
export type Pilihan = 'A' | 'B' | 'C' | 'D'
export const PILIHAN: Pilihan[] = ['A', 'B', 'C', 'D']

export const JUMLAH_KECAMATAN = 15
export const PESERTA_PER_KECAMATAN = 3
export const PESERTA_PER_JENJANG = JUMLAH_KECAMATAN * PESERTA_PER_KECAMATAN

export type StatusSesi = 'menunggu' | 'soal' | 'jeda' | 'selesai'

export interface Sesi {
  jenjang: Jenjang
  status: StatusSesi
  soal_id: string | null
  soal_ke: number
  soal_mulai_at: string | null
  soal_selesai_at: string | null
  updated_at: string
}

export interface SoalAktif {
  status: StatusSesi
  soal_ke: number
  total_soal: number
  soal_id?: string
  pertanyaan?: string
  pilihan?: Record<Pilihan, string>
  durasi_detik?: number
  poin_maks?: number
  mulai_at?: string
  selesai_at?: string
  ditutup?: boolean
  jumlah_menjawab?: number
  jawaban_benar?: Pilihan | null
}

export interface Peringkat {
  peringkat: number
  peserta_id: string
  nomor_peserta: string
  nama: string
  sekolah: string
  kecamatan: string
  total_skor: number
  jumlah_benar: number
  jumlah_jawab: number
  total_waktu_ms: number
}

export interface Kecamatan {
  id: number
  nama: string
  urutan: number
}

export interface Peserta {
  id: string
  jenjang: Jenjang
  kecamatan_id: number
  nomor_peserta: string
  nama: string
  sekolah: string
  kode_akses: string
}

export interface Soal {
  id: string
  jenjang: Jenjang
  nomor: number
  pertanyaan: string
  pilihan_a: string
  pilihan_b: string
  pilihan_c: string
  pilihan_d: string
  jawaban_benar: Pilihan
  durasi_detik: number
  poin_maks: number
}

export interface PesertaLogin {
  id: string
  nama: string
  sekolah: string
  jenjang: Jenjang
  nomor_peserta: string
  kecamatan: string
  kode: string
}

export const JENJANG_INFO: Record<Jenjang, { nama: string; warna: string; gradient: string; text: string; ring: string; soft: string }> = {
  SD: {
    nama: 'Sekolah Dasar',
    warna: '#f43f5e',
    gradient: 'from-rose-500 to-orange-500',
    text: 'text-rose-300',
    ring: 'ring-rose-400/40',
    soft: 'bg-rose-500/15',
  },
  SMP: {
    nama: 'Sekolah Menengah Pertama',
    warna: '#0ea5e9',
    gradient: 'from-sky-500 to-indigo-500',
    text: 'text-sky-300',
    ring: 'ring-sky-400/40',
    soft: 'bg-sky-500/15',
  },
  SMA: {
    nama: 'Sekolah Menengah Atas',
    warna: '#10b981',
    gradient: 'from-emerald-500 to-teal-500',
    text: 'text-emerald-300',
    ring: 'ring-emerald-400/40',
    soft: 'bg-emerald-500/15',
  },
}

export const STATUS_LABEL: Record<StatusSesi, string> = {
  menunggu: 'Belum dimulai',
  soal: 'Soal berlangsung',
  jeda: 'Jeda / pembahasan',
  selesai: 'Selesai',
}
