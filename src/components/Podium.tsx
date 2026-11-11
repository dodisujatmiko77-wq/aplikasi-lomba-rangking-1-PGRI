import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Crown } from 'lucide-react'
import type { Peringkat } from '../lib/types'

interface Props {
  data: Peringkat[]
  rayakan?: boolean
  kecil?: boolean
}

const URUTAN = [1, 0, 2] // tampil: juara 2, juara 1, juara 3
const TINGGI = ['h-40', 'h-28', 'h-20']
const TINGGI_KECIL = ['h-24', 'h-16', 'h-12']
const WARNA = [
  'from-amber-300 via-amber-400 to-yellow-600',
  'from-slate-200 via-slate-300 to-slate-500',
  'from-orange-300 via-orange-400 to-amber-700',
]

export default function Podium({ data, rayakan, kecil }: Props) {
  const juara = data.slice(0, 3)

  useEffect(() => {
    if (!rayakan || !juara.length) return
    const akhir = Date.now() + 2500
    const loop = () => {
      confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.7 } })
      confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.7 } })
      if (Date.now() < akhir) requestAnimationFrame(loop)
    }
    loop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rayakan, juara.map((j) => j.peserta_id).join()])

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4">
      {URUTAN.map((i, posisi) => {
        const p = juara[i]
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 * (2 - i), type: 'spring', stiffness: 120 }}
            className={`flex w-1/3 max-w-[13rem] flex-col items-center ${posisi === 1 ? 'order-2' : posisi === 0 ? 'order-1' : 'order-3'}`}
          >
            {p ? (
              <div className="mb-3 w-full text-center">
                {i === 0 && <Crown className="mx-auto mb-1 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]" size={kecil ? 22 : 32} />}
                <div
                  className={`mx-auto mb-2 grid place-items-center rounded-full bg-gradient-to-br ${WARNA[i]} font-black text-slate-900 shadow-xl ${
                    kecil ? 'h-11 w-11 text-base' : 'h-16 w-16 text-2xl'
                  }`}
                >
                  {p.nama
                    .split(' ')
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className={`line-clamp-2 font-extrabold leading-tight ${kecil ? 'text-xs' : 'text-sm sm:text-base'}`}>{p.nama}</div>
                <div className={`truncate text-slate-400 ${kecil ? 'text-[10px]' : 'text-xs'}`}>{p.kecamatan}</div>
                {!kecil && <div className="truncate text-[11px] text-slate-500">{p.sekolah}</div>}
                <div className={`mt-1 font-black tabular-nums text-amber-200 ${kecil ? 'text-sm' : 'text-lg'}`}>
                  {p.total_skor.toLocaleString('id-ID')}
                </div>
              </div>
            ) : (
              <div className="mb-3 text-xs text-slate-600">—</div>
            )}
            <div
              className={`relative w-full overflow-hidden rounded-t-2xl bg-gradient-to-b ${WARNA[i]} ${
                (kecil ? TINGGI_KECIL : TINGGI)[i]
              } grid place-items-center shadow-2xl`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="relative text-center text-slate-900">
                <div className={`font-black ${kecil ? 'text-2xl' : 'text-4xl'}`}>{i + 1}</div>
                {!kecil && <div className="text-[10px] font-bold uppercase tracking-widest">Juara {i + 1}</div>}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
