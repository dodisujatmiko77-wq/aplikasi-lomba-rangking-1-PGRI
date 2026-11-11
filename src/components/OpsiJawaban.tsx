import { Check, X } from 'lucide-react'
import { PILIHAN, type Pilihan } from '../lib/types'

export const WARNA_OPSI: Record<Pilihan, string> = {
  A: 'from-rose-500 to-red-600',
  B: 'from-sky-500 to-blue-600',
  C: 'from-amber-400 to-orange-500',
  D: 'from-emerald-500 to-green-600',
}

interface Props {
  pilihan: Record<Pilihan, string>
  kunci?: Pilihan | null
  dipilih?: Pilihan | null
  onPilih?: (p: Pilihan) => void
  nonaktif?: boolean
  besar?: boolean
}

export default function OpsiJawaban({ pilihan, kunci, dipilih, onPilih, nonaktif, besar }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PILIHAN.map((k) => {
        const benar = kunci === k
        const redup = (kunci && !benar) || (dipilih && dipilih !== k && !kunci)
        return (
          <button
            key={k}
            disabled={nonaktif || !onPilih}
            onClick={() => onPilih?.(k)}
            className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br ${WARNA_OPSI[k]} text-left font-bold text-white shadow-lg transition
              ${besar ? 'min-h-24 p-5 text-lg sm:text-xl' : 'min-h-16 p-4'}
              ${onPilih && !nonaktif ? 'hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]' : 'cursor-default'}
              ${redup ? 'opacity-30 saturate-50' : ''}
              ${benar ? 'ring-4 ring-white/80' : ''}
              ${dipilih === k ? 'ring-4 ring-white' : ''}`}
          >
            <span className={`grid shrink-0 place-items-center rounded-xl bg-black/20 font-black ${besar ? 'h-12 w-12 text-2xl' : 'h-9 w-9'}`}>{k}</span>
            <span className="flex-1">{pilihan[k]}</span>
            {kunci && benar && <Check className="shrink-0" size={besar ? 32 : 24} strokeWidth={3} />}
            {kunci && dipilih === k && !benar && <X className="shrink-0" size={besar ? 32 : 24} strokeWidth={3} />}
          </button>
        )
      })}
    </div>
  )
}
