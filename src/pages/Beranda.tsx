import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Gauge, MapPin, Radio, Timer, Trophy, Users, Zap } from 'lucide-react'
import { useSemuaSesi } from '../lib/hooks'
import { JENJANG, JENJANG_INFO, JUMLAH_KECAMATAN, PESERTA_PER_JENJANG, PESERTA_PER_KECAMATAN } from '../lib/types'
import StatusPill from '../components/StatusPill'

export default function Beranda() {
  const { sesi } = useSemuaSesi()

  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600/30 via-violet-600/20 to-slate-900/40 p-6 sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-rose-500/20 blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-200">
            <Zap size={14} /> Cerdas · Cepat · Tepat
          </span>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Lomba <span className="text-shine">Ranking 1</span>
            <br />
            PGRI
          </h1>
          <p className="mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
            Kompetisi cerdas cermat jenjang SD, SMP, dan SMA antar {JUMLAH_KECAMATAN} kecamatan dengan skor langsung
            (live score). Jawab benar paling cepat, raih skor tertinggi!
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/peserta" className="btn-primary px-6 py-3 text-base">
              Masuk sebagai Peserta <ArrowRight size={18} />
            </Link>
            <Link to="/live/SD" className="btn-ghost px-6 py-3 text-base">
              <Radio size={18} /> Lihat Live Score
            </Link>
          </div>
        </motion.div>

        <div className="relative mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { ikon: Trophy, nilai: '3', label: 'Jenjang' },
            { ikon: MapPin, nilai: String(JUMLAH_KECAMATAN), label: 'Kecamatan' },
            { ikon: Users, nilai: String(PESERTA_PER_JENJANG), label: 'Peserta / jenjang' },
            { ikon: Users, nilai: String(PESERTA_PER_KECAMATAN), label: 'Wakil / kecamatan' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur">
              <s.ikon size={18} className="text-amber-300" />
              <div className="mt-2 text-2xl font-extrabold">{s.nilai}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* JENJANG */}
      <section>
        <h2 className="mb-5 text-2xl font-bold">Arena Lomba</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {JENJANG.map((j, i) => {
            const info = JENJANG_INFO[j]
            const s = sesi[j]
            return (
              <motion.div
                key={j}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="glass group relative overflow-hidden p-6"
              >
                <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${info.gradient} opacity-25 blur-2xl transition group-hover:opacity-40`} />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className={`bg-gradient-to-br ${info.gradient} bg-clip-text text-5xl font-black text-transparent`}>{j}</div>
                    <StatusPill status={s?.status} />
                  </div>
                  <div className="mt-1 text-sm text-slate-400">{info.nama}</div>
                  <div className="mt-4 text-sm text-slate-300">
                    {s?.status === 'soal' || s?.status === 'jeda' ? (
                      <>Sedang soal ke-<b>{s.soal_ke}</b></>
                    ) : s?.status === 'selesai' ? (
                      'Juara telah ditetapkan'
                    ) : (
                      `${PESERTA_PER_JENJANG} peserta dari ${JUMLAH_KECAMATAN} kecamatan`
                    )}
                  </div>
                  <div className="mt-6 flex gap-2">
                    <Link to={`/live/${j}`} className="btn-ghost flex-1">
                      <Radio size={16} /> Live
                    </Link>
                    <Link to="/hasil" className="btn-ghost flex-1">
                      <Trophy size={16} /> Hasil
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ATURAN */}
      <section className="glass p-6 sm:p-8">
        <h2 className="mb-6 text-2xl font-bold">Ketentuan & Sistem Penilaian</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              ikon: Users,
              judul: 'Peserta',
              isi: `Setiap jenjang diikuti ${PESERTA_PER_JENJANG} peserta: ${JUMLAH_KECAMATAN} kecamatan × ${PESERTA_PER_KECAMATAN} perwakilan.`,
            },
            {
              ikon: Timer,
              judul: 'Kecepatan = Skor',
              isi: 'Jawaban benar bernilai 500–1.000 poin. Semakin cepat menjawab, semakin tinggi skor. Jawaban salah = 0.',
            },
            {
              ikon: Gauge,
              judul: 'Penetapan Juara',
              isi: 'Juara 1, 2, 3 tiap jenjang ditetapkan otomatis dari total skor tertinggi. Seri: jumlah benar terbanyak, lalu waktu tercepat.',
            },
          ].map((a) => (
            <div key={a.judul} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/20 text-indigo-300">
                <a.ikon size={20} />
              </div>
              <div className="font-bold">{a.judul}</div>
              <p className="mt-1 text-sm text-slate-400">{a.isi}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
