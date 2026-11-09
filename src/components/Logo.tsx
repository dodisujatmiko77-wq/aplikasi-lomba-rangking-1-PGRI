import { Trophy } from 'lucide-react'

export default function Logo({ besar = false }: { besar?: boolean }) {
  return (
    <div
      className={`grid place-items-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-500/30 ${
        besar ? 'h-16 w-16' : 'h-10 w-10'
      }`}
    >
      <Trophy size={besar ? 32 : 20} strokeWidth={2.5} />
    </div>
  )
}
