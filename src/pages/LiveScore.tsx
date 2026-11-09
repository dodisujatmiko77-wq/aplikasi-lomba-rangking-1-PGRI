import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, Users } from 'lucide-react'
import { usePeringkat, useSesi, useSoalAktif } from '../lib/hooks'
import { JENJANG, JENJANG_INFO, PESERTA_PER_JENJANG, type Jenjang } from '../lib/types'
import JenjangTabs from '../components/JenjangTabs'
import StatusPill from '../components/StatusPill'
import Countdown from '../components/Countdown'
import OpsiJawaban from '../components/OpsiJawaban'
import Leaderboard from '../components/Leaderboard'
import Podium from '../components/Podium'

export default function LiveScore() {
  const { jenjang: param } = useParams()
  const navigate = useNavigate()
  const jenjang = (param?.toUpperCase() ?? 'SD') as Jenjang
  if (!JENJANG.includes(jenjang)) return <Navigate to="/live/SD" replace />
  return <LiveJenjang key={jenjang} jenjang={jenjang} onGanti={(j) => navigate(`/live/${j}`)} />
}

function LiveJenjang({ jenjang, onGanti }: { jenjang: Jenjang; onGanti: (j: Jenjang) => void }) {
  const info = JENJANG_INFO[jenjang]
  const { sesi } = useSesi(jenjang)
  const { data: peringkat, versi } = usePeringkat(jenjang)
  const { soal } = useSoalAktif(jenjang, sesi, versi)
  const selesai = sesi?.status === 'selesai'
  const adaSoal = soal?.soal_id && (sesi?.status === 'soal' || sesi?.status === 'jeda')

  const layarPenuh = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen?.()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold sm:text-3xl">
              Live Score <span className={`bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent`}>{jenjang}</span>
            </h1>
            <StatusPill status={sesi?.status} />
          </div>
          <p className="text-sm text-slate-400">{info.nama} · skor diperbarui secara langsung</p>
        </div>
        <div className="flex items-center gap-2">
          <JenjangTabs nilai={jenjang} onChange={onGanti} />
          <button className="btn-ghost px-3" onClick={layarPenuh} title="Layar penuh">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {selesai ? (
        <div className="glass p-6 sm:p-10">
          <div className="mb-8 text-center">
            <div className="text-sm font-bold uppercase tracking-[0.3em] text-amber-300">Hasil Akhir</div>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Juara Lomba Ranking 1 Jenjang {jenjang}</h2>
          </div>
          <Podium data={peringkat} rayakan />
        </div>
      ) : (
        <div className="glass relative overflow-hidden p-5 sm:p-8">
          <div className={`pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br ${info.gradient} opacity-20 blur-3xl`} />
          <AnimatePresence mode="wait">
            {adaSoal && soal?.pilihan ? (
              <motion.div key={soal.soal_id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
                      <span className={`rounded-full bg-gradient-to-r ${info.gradient} px-3 py-1 font-bold text-white`}>
                        Soal {soal.soal_ke} / {soal.total_soal}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-slate-300">
                        <Users size={15} /> {soal.jumlah_menjawab ?? 0} / {peringkat.length || PESERTA_PER_JENJANG} sudah menjawab
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold leading-snug sm:text-3xl">{soal.pertanyaan}</h2>
                  </div>
                  <div className="self-center">
                    {soal.ditutup ? (
                      <div className="rounded-2xl bg-amber-400/15 px-5 py-3 text-center font-bold text-amber-200">Waktu habis</div>
                    ) : (
                      <Countdown mulai={soal.mulai_at} selesai={soal.selesai_at} ukuran={130} />
                    )}
                  </div>
                </div>
                <div className="mt-6">
                  <OpsiJawaban pilihan={soal.pilihan} kunci={soal.ditutup ? soal.jawaban_benar : null} besar />
                </div>
              </motion.div>
            ) : (
              <motion.div key="tunggu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative py-10 text-center">
                <div className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">Lomba Ranking 1 PGRI</div>
                <div className="mt-3 text-3xl font-black sm:text-4xl">Menunggu soal dimulai…</div>
                <div className="mt-2 text-slate-400">Peserta silakan masuk melalui menu Peserta.</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className={`grid gap-6 ${selesai ? '' : 'lg:grid-cols-[1fr_2fr]'}`}>
        {!selesai && (
          <div className="glass self-start p-5">
            <h3 className="mb-4 font-bold">3 Besar Sementara</h3>
            <Podium data={peringkat} kecil />
          </div>
        )}
        <div className="glass p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">Papan Peringkat</h3>
            <span className="text-xs text-slate-400">{peringkat.length} peserta</span>
          </div>
          <div className="scroll-thin max-h-[36rem] overflow-y-auto pr-1">
            <Leaderboard data={peringkat} />
          </div>
        </div>
      </div>
    </div>
  )
}
