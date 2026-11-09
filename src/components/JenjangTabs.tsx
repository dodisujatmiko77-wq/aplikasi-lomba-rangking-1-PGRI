import { JENJANG, JENJANG_INFO, type Jenjang } from '../lib/types'

export default function JenjangTabs({ nilai, onChange }: { nilai: Jenjang; onChange: (j: Jenjang) => void }) {
  return (
    <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
      {JENJANG.map((j) => (
        <button
          key={j}
          onClick={() => onChange(j)}
          className={`rounded-xl px-5 py-2 text-sm font-bold transition ${
            nilai === j
              ? `bg-gradient-to-r ${JENJANG_INFO[j].gradient} text-white shadow-lg`
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {j}
        </button>
      ))}
    </div>
  )
}
