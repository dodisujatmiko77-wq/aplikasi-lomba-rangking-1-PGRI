import { Link } from 'react-router-dom'
import { Radio } from 'lucide-react'
import { usePeringkat, useSemuaSesi } from '../lib/hooks'
import { JENJANG, JENJANG_INFO, type Jenjang, type Sesi } from '../lib/types'
import Podium from '../components/Podium'
import StatusPill from '../components/StatusPill'

export default function Hasil() {
  const { sesi } = useSemuaSesi()
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="text-sm font-bold uppercase tracking-[0.3em] text-amber-300">Penetapan Juara</div>
        <h1 className="mt-2 text-3xl font-black sm:text-5xl">
          Hasil <span className="text-shine">Lomba Ranking 1</span> PGRI
        </h1>
        <p className="mt-3 text-slate-400">3 besar skor tertinggi untuk setiap jenjang ditetapkan langsung oleh sistem.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        {JENJANG.map((j) => (
          <KartuHasil key={j} jenjang={j} sesi={sesi[j]} />
        ))}
      </div>
    </div>
  )
}

function KartuHasil({ jenjang, sesi }: { jenjang: Jenjang; sesi?: Sesi }) {
  const { data } = usePeringkat(jenjang)
  const info = JENJANG_INFO[jenjang]
  const final = sesi?.status === 'selesai'
  return (
    <div className="glass relative overflow-hidden p-6">
      <div className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${info.gradient} opacity-25 blur-3xl`} />
      <div className="relative mb-6 flex items-start justify-between">
        <div>
          <div className={`bg-gradient-to-r ${info.gradient} bg-clip-text text-3xl font-black text-transparent`}>{jenjang}</div>
          <div className="text-xs text-slate-400">{info.nama}</div>
        </div>
        <StatusPill status={sesi?.status} />
      </div>
      {!final && (
        <div className="relative mb-4 rounded-xl bg-amber-400/10 px-3 py-2 text-center text-xs font-semibold text-amber-200">
          Hasil sementara — lomba belum selesai
        </div>
      )}
      <div className="relative">
        <Podium data={data} kecil rayakan={final} />
      </div>
      <div className="relative mt-6 space-y-2">
        {data.slice(0, 3).map((p) => (
          <div key={p.peserta_id} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2 text-sm">
            <div className="min-w-0">
              <div className="truncate font-bold">
                Juara {p.peringkat} · {p.nama}
              </div>
              <div className="truncate text-xs text-slate-400">
                {p.sekolah} · {p.kecamatan}
              </div>
            </div>
            <div className="text-right">
              <div className="font-extrabold tabular-nums">{p.total_skor.toLocaleString('id-ID')}</div>
              <div className="text-[10px] text-slate-400">{p.jumlah_benar} benar</div>
            </div>
          </div>
        ))}
      </div>
      <Link to={`/live/${jenjang}`} className="btn-ghost relative mt-5 w-full">
        <Radio size={16} /> Papan peringkat lengkap
      </Link>
    </div>
  )
}
