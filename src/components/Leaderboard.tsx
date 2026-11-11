import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Crown, Medal } from 'lucide-react'
import type { Peringkat } from '../lib/types'

const MEDALI = [
  'from-amber-300 to-yellow-500 text-amber-950',
  'from-slate-200 to-slate-400 text-slate-900',
  'from-orange-300 to-amber-700 text-orange-950',
]

interface Props {
  data: Peringkat[]
  batas?: number
  sorot?: string
  padat?: boolean
}

export default function Leaderboard({ data, batas, sorot, padat }: Props) {
  // Simpan skor sebelumnya untuk menampilkan animasi "+poin"
  const sebelum = useRef<Record<string, number>>({})
  const [delta, setDelta] = useState<Record<string, number>>({})

  useEffect(() => {
    const baru: Record<string, number> = {}
    for (const p of data) {
      const lama = sebelum.current[p.peserta_id]
      if (lama !== undefined && p.total_skor > lama) baru[p.peserta_id] = p.total_skor - lama
      sebelum.current[p.peserta_id] = p.total_skor
    }
    if (Object.keys(baru).length) {
      setDelta((d) => ({ ...d, ...baru }))
      const t = setTimeout(() => {
        setDelta((d) => {
          const s = { ...d }
          for (const k of Object.keys(baru)) delete s[k]
          return s
        })
      }, 2500)
      return () => clearTimeout(t)
    }
  }, [data])

  const tampil = batas ? data.slice(0, batas) : data
  if (!tampil.length) {
    return <div className="py-10 text-center text-sm text-slate-500">Belum ada peserta terdaftar.</div>
  }

  return (
    <ul className="space-y-1.5">
      <AnimatePresence initial={false}>
        {tampil.map((p) => {
          const top = p.peringkat <= 3 && p.total_skor > 0
          return (
            <motion.li
              layout
              key={p.peserta_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              className={`relative flex items-center gap-3 rounded-2xl border px-3 ${padat ? 'py-1.5' : 'py-2.5'} ${
                sorot === p.peserta_id
                  ? 'border-indigo-400/60 bg-indigo-500/15'
                  : top
                    ? 'border-amber-300/20 bg-gradient-to-r from-amber-400/10 to-transparent'
                    : 'border-white/5 bg-white/[0.03]'
              }`}
            >
              <div
                className={`grid shrink-0 place-items-center rounded-xl font-extrabold tabular-nums ${
                  padat ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm'
                } ${top ? 'bg-gradient-to-br ' + MEDALI[p.peringkat - 1] : 'bg-white/5 text-slate-400'}`}
              >
                {top && p.peringkat === 1 ? <Crown size={padat ? 14 : 16} /> : p.peringkat}
              </div>
              <div className="min-w-0 flex-1">
                <div className={`truncate font-bold ${padat ? 'text-sm' : ''}`}>{p.nama}</div>
                {!padat && (
                  <div className="truncate text-xs text-slate-400">
                    {p.kecamatan} · {p.sekolah || p.nomor_peserta}
                  </div>
                )}
              </div>
              {!padat && (
                <div className="hidden text-right text-xs text-slate-400 sm:block">
                  <div>
                    <span className="font-bold text-emerald-300">{p.jumlah_benar}</span> benar
                  </div>
                  <div>{p.jumlah_jawab} dijawab</div>
                </div>
              )}
              <div className="relative w-20 text-right">
                <motion.div
                  key={p.total_skor}
                  initial={{ scale: 1.3, color: '#fde68a' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  className={`font-extrabold tabular-nums ${padat ? 'text-sm' : 'text-lg'}`}
                >
                  {p.total_skor.toLocaleString('id-ID')}
                </motion.div>
                <AnimatePresence>
                  {delta[p.peserta_id] && (
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: -2 }}
                      exit={{ opacity: 0, y: -12 }}
                      className="absolute -top-3 right-0 rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white"
                    >
                      +{delta[p.peserta_id]}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ul>
  )
}

export function IkonPeringkat({ n }: { n: number }) {
  if (n > 3) return <span className="font-bold">#{n}</span>
  return <Medal className={n === 1 ? 'text-amber-300' : n === 2 ? 'text-slate-300' : 'text-orange-400'} />
}
