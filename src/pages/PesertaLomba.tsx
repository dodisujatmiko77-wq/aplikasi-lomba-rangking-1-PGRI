import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Clock, Hourglass, LogOut, PartyPopper, Send, Trophy, XCircle } from 'lucide-react'
import { supabase, pesanError } from '../lib/supabase'
import { formatDetik, useLocalStorage, useNow, usePeringkat, useSesi, useSoalAktif } from '../lib/hooks'
import { JENJANG_INFO, type Pilihan, type PesertaLogin } from '../lib/types'
import { KUNCI_AKUN } from './PesertaMasuk'
import Countdown, { sisaMs } from '../components/Countdown'
import OpsiJawaban from '../components/OpsiJawaban'
import Podium from '../components/Podium'
import Leaderboard from '../components/Leaderboard'

interface JawabanLokal {
  pilihan: Pilihan
  waktu_ms: number
}
interface HasilJawaban {
  dijawab: boolean
  pilihan?: Pilihan
  benar?: boolean
  skor?: number
  waktu_ms?: number
}

export default function PesertaLomba() {
  const [akun, setAkun] = useLocalStorage<PesertaLogin | null>(KUNCI_AKUN, null)
  if (!akun) return <Navigate to="/peserta" replace />
  return <Arena akun={akun} keluar={() => setAkun(null)} />
}

function Arena({ akun, keluar }: { akun: PesertaLogin; keluar: () => void }) {
  const info = JENJANG_INFO[akun.jenjang]
  const { sesi } = useSesi(akun.jenjang)
  const { data: peringkat, versi } = usePeringkat(akun.jenjang)
  const { soal } = useSoalAktif(akun.jenjang, sesi)
  const now = useNow(200)
  const [jawaban, setJawaban] = useLocalStorage<Record<string, JawabanLokal>>(`pgri-jawaban-${akun.id}`, {})
  const [hasil, setHasil] = useState<HasilJawaban | null>(null)
  const [mengirim, setMengirim] = useState(false)
  const [error, setError] = useState('')

  const saya = useMemo(() => peringkat.find((p) => p.peserta_id === akun.id), [peringkat, akun.id])
  const soalId = soal?.soal_id
  const sudah = soalId ? jawaban[soalId] : undefined
  const waktuHabis = soal?.ditutup || (soal?.selesai_at ? sisaMs(soal.selesai_at, now) <= 0 : false)
  const bisaJawab = sesi?.status === 'soal' && !!soal?.pilihan && !waktuHabis && !sudah && !mengirim

  // Lomba di-reset panitia -> bersihkan catatan jawaban lokal
  useEffect(() => {
    if (sesi?.status === 'menunggu' && Object.keys(jawaban).length) setJawaban({})
  }, [sesi?.status, jawaban, setJawaban])

  useEffect(() => {
    setHasil(null)
    setError('')
  }, [soalId])

  // Ambil hasil jawaban setelah soal ditutup
  useEffect(() => {
    if (!soalId || !soal?.ditutup) return
    supabase
      .rpc('hasil_jawaban_saya', { p_peserta_id: akun.id, p_kode: akun.kode, p_soal_id: soalId })
      .then(({ data }) => data && setHasil(data as HasilJawaban))
  }, [soalId, soal?.ditutup, akun.id, akun.kode, versi])

  const kirim = async (p: Pilihan) => {
    if (!bisaJawab || !soalId) return
    setMengirim(true)
    setError('')
    const { data, error } = await supabase.rpc('kirim_jawaban', { p_peserta_id: akun.id, p_kode: akun.kode, p_pilihan: p })
    setMengirim(false)
    if (error) {
      const msg = pesanError(error)
      if (/sudah menjawab/i.test(msg)) setJawaban((j) => ({ ...j, [soalId]: { pilihan: p, waktu_ms: 0 } }))
      if (/kode akses/i.test(msg)) keluar()
      return setError(msg)
    }
    const d = data as { pilihan: Pilihan; waktu_ms: number }
    setJawaban((j) => ({ ...j, [soalId]: d }))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Kartu identitas */}
      <div className="glass flex flex-wrap items-center gap-4 p-4">
        <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${info.gradient} text-lg font-black`}>
          {akun.jenjang}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-extrabold">{akun.nama}</div>
          <div className="truncate text-xs text-slate-400">
            {akun.nomor_peserta} · {akun.sekolah} · {akun.kecamatan}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Peringkat</div>
            <div className="text-xl font-black">#{saya?.peringkat ?? '-'}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Skor</div>
            <div className="text-xl font-black text-amber-200 tabular-nums">{(saya?.total_skor ?? 0).toLocaleString('id-ID')}</div>
          </div>
          <button className="btn-ghost px-2.5" onClick={keluar} title="Keluar">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {sesi?.status === 'selesai' ? (
          <motion.div key="selesai" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass p-6 sm:p-10 text-center">
            {saya && saya.peringkat <= 3 && saya.total_skor > 0 ? (
              <>
                <PartyPopper className="mx-auto text-amber-300" size={48} />
                <h2 className="mt-3 text-3xl font-black">Selamat! Anda Juara {saya.peringkat}</h2>
              </>
            ) : (
              <>
                <Trophy className="mx-auto text-amber-300" size={44} />
                <h2 className="mt-3 text-3xl font-black">Lomba Selesai</h2>
                <p className="mt-1 text-slate-400">Terima kasih telah berpartisipasi. Peringkat akhir Anda: #{saya?.peringkat ?? '-'}</p>
              </>
            )}
            <div className="mt-8">
              <Podium data={peringkat} rayakan />
            </div>
          </motion.div>
        ) : soal?.soal_id && soal.pilihan && (sesi?.status === 'soal' || sesi?.status === 'jeda') ? (
          <motion.div key={soal.soal_id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass p-5 sm:p-7">
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className={`rounded-full bg-gradient-to-r ${info.gradient} px-3 py-1 text-sm font-bold`}>
                Soal {soal.soal_ke} / {soal.total_soal}
              </span>
              {!waktuHabis ? (
                <Countdown mulai={soal.mulai_at} selesai={soal.selesai_at} ukuran={84} />
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-sm font-bold text-amber-200">
                  <Clock size={14} /> Waktu habis
                </span>
              )}
            </div>
            <h2 className="mb-6 text-xl font-extrabold leading-snug sm:text-2xl">{soal.pertanyaan}</h2>
            <OpsiJawaban
              pilihan={soal.pilihan}
              onPilih={kirim}
              nonaktif={!bisaJawab}
              dipilih={sudah?.pilihan ?? hasil?.pilihan ?? null}
              kunci={soal.ditutup ? soal.jawaban_benar : null}
              besar
            />

            <div className="mt-5 min-h-14">
              {error && <div className="rounded-xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{error}</div>}
              {mengirim && <div className="text-center text-sm text-slate-300">Mengirim jawaban…</div>}
              {soal.ditutup && hasil ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-3 rounded-2xl px-5 py-4 ${
                    hasil.benar ? 'bg-emerald-500/15 text-emerald-100' : 'bg-rose-500/15 text-rose-100'
                  }`}
                >
                  {hasil.benar ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                  <div className="flex-1">
                    <div className="text-lg font-extrabold">
                      {!hasil.dijawab ? 'Tidak menjawab' : hasil.benar ? 'Jawaban Benar!' : 'Jawaban Salah'}
                    </div>
                    {hasil.dijawab && <div className="text-sm opacity-80">Waktu menjawab {formatDetik(hasil.waktu_ms ?? 0)}</div>}
                  </div>
                  <div className="text-2xl font-black tabular-nums">+{hasil.skor ?? 0}</div>
                </motion.div>
              ) : sudah ? (
                <div className="flex items-center gap-3 rounded-2xl bg-indigo-500/15 px-5 py-4 text-indigo-100">
                  <Send size={22} />
                  <div>
                    <div className="font-bold">Jawaban {sudah.pilihan} terkirim{sudah.waktu_ms ? ` dalam ${formatDetik(sudah.waktu_ms)}` : ''}</div>
                    <div className="text-sm opacity-80">Tunggu hingga soal ditutup untuk melihat hasilnya.</div>
                  </div>
                </div>
              ) : waktuHabis ? (
                <div className="text-center text-sm text-slate-400">Menunggu hasil…</div>
              ) : null}
            </div>
          </motion.div>
        ) : (
          <motion.div key="tunggu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-10 text-center">
            <motion.div animate={{ rotate: [0, 180, 180, 360] }} transition={{ repeat: Infinity, duration: 3 }} className="mx-auto w-fit">
              <Hourglass className="text-indigo-300" size={44} />
            </motion.div>
            <h2 className="mt-4 text-2xl font-black">Bersiaplah!</h2>
            <p className="mt-1 text-slate-400">Soal akan muncul otomatis saat panitia memulai lomba.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {sesi?.status !== 'soal' && peringkat.length > 0 && (
        <div className="glass p-5">
          <h3 className="mb-3 font-bold">Peringkat {akun.jenjang}</h3>
          <div className="scroll-thin max-h-96 overflow-y-auto pr-1">
            <Leaderboard data={peringkat} sorot={akun.id} padat />
          </div>
        </div>
      )}
    </div>
  )
}
