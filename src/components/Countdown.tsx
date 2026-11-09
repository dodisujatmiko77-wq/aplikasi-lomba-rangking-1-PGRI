import { useNow } from '../lib/hooks'

interface Props {
  mulai?: string | null
  selesai?: string | null
  ukuran?: number
  berhenti?: boolean
}

export function sisaMs(selesai: string | null | undefined, now: number) {
  if (!selesai) return 0
  return Math.max(0, new Date(selesai).getTime() - now)
}

export default function Countdown({ mulai, selesai, ukuran = 120, berhenti }: Props) {
  const now = useNow(100)
  if (!mulai || !selesai) return null
  const total = new Date(selesai).getTime() - new Date(mulai).getTime()
  const sisa = berhenti ? 0 : sisaMs(selesai, now)
  const rasio = total > 0 ? sisa / total : 0
  const r = 44
  const keliling = 2 * Math.PI * r
  const warna = rasio > 0.5 ? '#34d399' : rasio > 0.25 ? '#fbbf24' : '#f43f5e'

  return (
    <div className="relative grid place-items-center" style={{ width: ukuran, height: ukuran }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={warna}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={keliling}
          strokeDashoffset={keliling * (1 - rasio)}
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s' }}
        />
      </svg>
      <div className="text-center">
        <div className="font-extrabold tabular-nums" style={{ fontSize: ukuran * 0.3, color: warna }}>
          {Math.ceil(sisa / 1000)}
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">detik</div>
      </div>
    </div>
  )
}
