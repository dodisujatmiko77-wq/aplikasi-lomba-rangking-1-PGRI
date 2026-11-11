import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { supabase, pesanError } from '../../lib/supabase'
import { JUMLAH_KECAMATAN, type Kecamatan } from '../../lib/types'

export default function KelolaKecamatan() {
  const [data, setData] = useState<Kecamatan[]>([])
  const [ubah, setUbah] = useState<Record<number, string>>({})
  const [pesan, setPesan] = useState('')

  const muat = () =>
    supabase
      .from('kecamatan')
      .select('*')
      .order('urutan')
      .order('id')
      .then(({ data }) => setData((data as Kecamatan[]) ?? []))

  useEffect(() => {
    muat()
  }, [])

  const simpan = async (k: Kecamatan) => {
    const nama = ubah[k.id]?.trim()
    if (!nama || nama === k.nama) return
    const { error } = await supabase.from('kecamatan').update({ nama }).eq('id', k.id)
    setPesan(error ? pesanError(error) : `Tersimpan: ${nama}`)
    setUbah((u) => {
      const s = { ...u }
      delete s[k.id]
      return s
    })
    muat()
  }

  return (
    <div className="glass p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold">Daftar {JUMLAH_KECAMATAN} Kecamatan</h2>
        <p className="text-sm text-slate-400">Ubah nama kecamatan sesuai wilayah Anda. Tekan Enter atau ✓ untuk menyimpan.</p>
        {pesan && <p className="mt-2 text-sm text-emerald-300">{pesan}</p>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((k, i) => (
          <div key={k.id} className="flex items-center gap-2">
            <span className="w-7 text-right text-sm font-bold text-slate-500">{i + 1}</span>
            <input
              className="input"
              value={ubah[k.id] ?? k.nama}
              onChange={(e) => setUbah({ ...ubah, [k.id]: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && simpan(k)}
            />
            <button
              className="btn-ghost px-2.5"
              disabled={ubah[k.id] === undefined || ubah[k.id].trim() === k.nama}
              onClick={() => simpan(k)}
            >
              <Check size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
