import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface Props {
  buka: boolean
  judul: string
  onTutup: () => void
  children: ReactNode
  lebar?: string
}

export default function Modal({ buka, judul, onTutup, children, lebar = 'max-w-lg' }: Props) {
  return (
    <AnimatePresence>
      {buka && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onTutup()}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className={`w-full ${lebar} rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">{judul}</h3>
              <button className="btn-ghost px-2 py-2" onClick={onTutup} aria-label="Tutup">
                <X size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
