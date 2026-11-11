import { STATUS_LABEL, type StatusSesi } from '../lib/types'

const GAYA: Record<StatusSesi, string> = {
  menunggu: 'bg-slate-500/15 text-slate-300 ring-slate-400/30',
  soal: 'bg-rose-500/15 text-rose-300 ring-rose-400/40',
  jeda: 'bg-amber-500/15 text-amber-300 ring-amber-400/40',
  selesai: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/40',
}

export default function StatusPill({ status }: { status?: StatusSesi }) {
  const s = status ?? 'menunggu'
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1 ${GAYA[s]}`}>
      <span className="relative flex h-2 w-2">
        {s === 'soal' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
      </span>
      {s === 'soal' ? 'LIVE · ' + STATUS_LABEL[s] : STATUS_LABEL[s]}
    </span>
  )
}
