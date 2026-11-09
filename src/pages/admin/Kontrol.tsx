import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Flag, Play, RotateCcw, SkipForward, Square, Users } from 'lucide-react'
import { supabase, pesanError } from '../../lib/supabase'
import { useNow, usePeringkat, useSesi, useSoalAktif } from '../../lib/hooks'
import { JENJANG_INFO, PESERTA_PER_JENJANG, type Jenjang, type Soal } from '../../lib/types'
import JenjangTabs from '../../components/JenjangTabs'
import StatusPill from '../../components/StatusPill'
import Countdown from '../../components/Countdown'
import OpsiJawaban from '../../components/OpsiJawaban'
import Leaderboard from '../../components/Leaderboard'
import Podium from '../../components/Podium'

export default function Kontrol() {
  const [jenjang, setJenjang] = useState<Jenjang>('SD')
  return (
    <div className="space-y-5">
      <JenjangTabs nilai={jenjang} onChange={setJenjang} />
      <PanelKontrol key={jenjang} jenjang={jenjang} />
    </div>
  )
}

function PanelKontrol({ jenjang }: { jenjang: Jenjang }) {
  const info = JENJANG_INFO[jenjang]
  const { sesi } = useSesi(jenjang)
  const { data: peringkat, versi } = usePeringkat(jenjang)
  const { soal: aktif } = useSoalAktif(jenjang, sesi, versi)
  const [daftarSoal, setDaftarSoal] = useState<Soal[]>([])
  const [proses, setProses] = useState(false)
  const [error, setError] = useState('')
  const now = useNow(250)
  const sudahAutoTutup = useRef<string | null>(null)

  useEffect(() => {
    supabase
      .from('soal')
      .select('*')
      .eq('jenjang', jenjang)
      .order('nomor')
      .then(({ data }) => setDaftarSoal((data as Soal[]) ?? []))
  }, [jenjang])

  const total = daftarSoal.length
  const soalNow = daftarSoal.find((s) => s.id === sesi?.soal_id)
  const status = sesi?.status ?? 'menunggu'
  const soalKe = sesi?.soal_ke ?? 0

  const jalankan = async (fn: string, args: Record<string, unknown> = {}) => {
    setProses(true)
    setError('')
    const { error } = await supabase.rpc(fn, { p_jenjang: jenjang, ...args })
    setProses(false)
    if (error) setError(pesanError(error))
  }

  // Tutup soal otomatis saat waktu habis
  useEffect(() => {
    if (status !== 'soal' || !sesi?.soal_selesai_at || !sesi.soal_id) return
    if (now > new Date(sesi.soal_selesai_at).getTime() + 1200 && sudahAutoTutup.current !== sesi.soal_id) {
      sudahAutoTutup.current = sesi.soal_id
      jalankan('admin_tutup_soal')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, status, sesi?.soal_selesai_at, sesi?.soal_id])

  const reset = () => {
    if (confirm(`Reset lomba ${jenjang}? Semua jawaban dan skor jenjang ini akan dihapus.`)) jalankan('admin_reset')
  }
  const selesaikan = () => {
    if (confirm(`Selesaikan lomba ${jenjang} dan tetapkan 3 besar sebagai juara?`)) jalankan('admin_selesaikan')
  }

  const pesertaLengkap = peringkat.length === PESERTA_PER_JENJANG

  return (
    <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
      <div className="space-y-5">
        <div className="glass p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${info.gradient} font-black`}>{jenjang}</div>
              <div>
                <div className="font-bold">Lomba {info.nama}</div>
                <div className="text-xs text-slate-400">
                  Soal {soalKe} dari {total} · {peringkat.length}/{PESERTA_PER_JENJANG} peserta
                </div>
              </div>
            </div>
            <StatusPill status={status} />
          </div>

          {/* Cek kesiapan */}
          {status === 'menunggu' && (
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Cek ok={pesertaLengkap} teks={`Peserta ${peringkat.length}/${PESERTA_PER_JENJANG}`} />
              <Cek ok={total > 0} teks={`${total} soal tersedia`} />
            </div>
          )}

          {error && <div className="mt-4 rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200">{error}</div>}

          <div className="mt-5 flex flex-wrap gap-2">
            {status === 'menunggu' && (
              <button className="btn-success" disabled={proses || !total} onClick={() => jalankan('admin_mulai_soal', { p_soal_ke: 1 })}>
                <Play size={16} /> Mulai Lomba (Soal 1)
              </button>
            )}
            {status === 'soal' && (
              <button className="btn-primary" disabled={proses} onClick={() => jalankan('admin_tutup_soal')}>
                <Square size={16} /> Tutup Soal Sekarang
              </button>
            )}
            {status === 'jeda' && soalKe < total && (
              <button className="btn-success" disabled={proses} onClick={() => jalankan('admin_mulai_soal', { p_soal_ke: soalKe + 1 })}>
                <SkipForward size={16} /> Soal Berikutnya ({soalKe + 1})
              </button>
            )}
            {status === 'jeda' && (
              <button className={soalKe >= total ? 'btn-success' : 'btn-ghost'} disabled={proses} onClick={selesaikan}>
                <Flag size={16} /> Selesaikan & Tetapkan Juara
              </button>
            )}
            <button className="btn-ghost text-rose-300" disabled={proses} onClick={reset}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>

        {/* Soal aktif */}
        {soalNow && (status === 'soal' || status === 'jeda') && (
          <div className="glass p-5 sm:p-6">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Soal {soalKe}</div>
                <div className="mt-1 text-lg font-bold">{soalNow.pertanyaan}</div>
                <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-300">
                  <Users size={14} /> {aktif?.jumlah_menjawab ?? 0} / {peringkat.length} menjawab · Kunci:{' '}
                  <b className="text-emerald-300">{soalNow.jawaban_benar}</b>
                </div>
              </div>
              {status === 'soal' && <Countdown mulai={sesi?.soal_mulai_at} selesai={sesi?.soal_selesai_at} ukuran={90} />}
            </div>
            <OpsiJawaban
              pilihan={{ A: soalNow.pilihan_a, B: soalNow.pilihan_b, C: soalNow.pilihan_c, D: soalNow.pilihan_d }}
              kunci={soalNow.jawaban_benar}
            />
          </div>
        )}

        {status === 'selesai' && (
          <div className="glass p-6">
            <div className="mb-6 text-center">
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Juara Ditetapkan</div>
              <div className="mt-1 text-2xl font-black">Jenjang {jenjang}</div>
            </div>
            <Podium data={peringkat} />
          </div>
        )}

        {/* Daftar soal */}
        <div className="glass p-5">
          <h3 className="mb-3 font-bold">Urutan Soal</h3>
          <div className="scroll-thin max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {daftarSoal.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                  s.id === sesi?.soal_id ? 'bg-indigo-500/20 ring-1 ring-indigo-400/40' : i + 1 < soalKe ? 'opacity-50' : 'bg-white/[0.03]'
                }`}
              >
                <span className="w-6 font-bold text-slate-400">{i + 1}</span>
                <span className="flex-1 truncate">{s.pertanyaan}</span>
                <span className="text-xs text-slate-400">{s.durasi_detik}s</span>
              </div>
            ))}
            {!daftarSoal.length && <div className="text-sm text-slate-500">Belum ada soal. Tambahkan di tab Bank Soal.</div>}
          </div>
        </div>
      </div>

      <div className="glass p-5">
        <h3 className="mb-4 font-bold">Live Peringkat {jenjang}</h3>
        <div className="scroll-thin max-h-[48rem] overflow-y-auto pr-1">
          <Leaderboard data={peringkat} padat />
        </div>
      </div>
    </div>
  )
}

function Cek({ ok, teks }: { ok: boolean; teks: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${ok ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-200'}`}>
      {ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />} {teks}
    </div>
  )
}
