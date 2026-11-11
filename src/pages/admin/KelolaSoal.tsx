import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Pencil, Plus, Timer, Trash2 } from 'lucide-react'
import { supabase, pesanError } from '../../lib/supabase'
import { PILIHAN, type Jenjang, type Pilihan, type Soal } from '../../lib/types'
import JenjangTabs from '../../components/JenjangTabs'
import Modal from '../../components/Modal'
import { WARNA_OPSI } from '../../components/OpsiJawaban'

type Form = Omit<Soal, 'id' | 'jenjang'> & { id?: string }

const kosong = (nomor: number): Form => ({
  nomor,
  pertanyaan: '',
  pilihan_a: '',
  pilihan_b: '',
  pilihan_c: '',
  pilihan_d: '',
  jawaban_benar: 'A',
  durasi_detik: 20,
  poin_maks: 1000,
})

export default function KelolaSoal() {
  const [jenjang, setJenjang] = useState<Jenjang>('SD')
  const [data, setData] = useState<Soal[]>([])
  const [form, setForm] = useState<Form | null>(null)
  const [error, setError] = useState('')
  const [simpan, setSimpan] = useState(false)

  const muat = useCallback(async () => {
    const { data } = await supabase.from('soal').select('*').eq('jenjang', jenjang).order('nomor')
    setData((data as Soal[]) ?? [])
  }, [jenjang])

  useEffect(() => {
    muat()
  }, [muat])

  const kirim = async (e: FormEvent) => {
    e.preventDefault()
    if (!form) return
    setSimpan(true)
    setError('')
    const { id, ...isi } = form
    const { error } = id
      ? await supabase.from('soal').update(isi).eq('id', id)
      : await supabase.from('soal').insert({ ...isi, jenjang })
    setSimpan(false)
    if (error) return setError(pesanError(error))
    setForm(null)
    muat()
  }

  const hapus = async (s: Soal) => {
    if (!confirm(`Hapus soal nomor ${s.nomor}?`)) return
    const { error } = await supabase.from('soal').delete().eq('id', s.id)
    if (error) alert(pesanError(error))
    muat()
  }

  const kunciOpsi = (k: Pilihan) => `pilihan_${k.toLowerCase()}` as 'pilihan_a'

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <JenjangTabs nilai={jenjang} onChange={setJenjang} />
        <button className="btn-primary" onClick={() => setForm(kosong((data.at(-1)?.nomor ?? 0) + 1))}>
          <Plus size={16} /> Tambah Soal
        </button>
      </div>

      <div className="space-y-3">
        {data.map((s) => (
          <div key={s.id} className="glass p-4 sm:p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 font-black">{s.nomor}</div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{s.pertanyaan}</div>
                <div className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
                  {PILIHAN.map((k) => (
                    <div
                      key={k}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 ${
                        s.jawaban_benar === k ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/40' : 'bg-white/[0.03] text-slate-300'
                      }`}
                    >
                      <span className={`grid h-5 w-5 place-items-center rounded bg-gradient-to-br ${WARNA_OPSI[k]} text-[10px] font-black text-white`}>{k}</span>
                      {s[kunciOpsi(k)]}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Timer size={12} /> {s.durasi_detik} detik
                  </span>
                  <span>Maks {s.poin_maks} poin</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" onClick={() => setForm({ ...s })}>
                  <Pencil size={15} />
                </button>
                <button className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300" onClick={() => hapus(s)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!data.length && <div className="glass p-10 text-center text-sm text-slate-400">Belum ada soal untuk jenjang {jenjang}.</div>}
      </div>

      <Modal buka={!!form} judul={form?.id ? 'Ubah Soal' : `Tambah Soal ${jenjang}`} onTutup={() => setForm(null)} lebar="max-w-2xl">
        {form && (
          <form onSubmit={kirim} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Nomor</label>
                <input type="number" min={1} className="input" value={form.nomor} onChange={(e) => setForm({ ...form, nomor: Number(e.target.value) })} required />
              </div>
              <div>
                <label className="label">Durasi (detik)</label>
                <input
                  type="number"
                  min={5}
                  max={300}
                  className="input"
                  value={form.durasi_detik}
                  onChange={(e) => setForm({ ...form, durasi_detik: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="label">Poin Maks</label>
                <input
                  type="number"
                  min={1}
                  className="input"
                  value={form.poin_maks}
                  onChange={(e) => setForm({ ...form, poin_maks: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Pertanyaan</label>
              <textarea className="input min-h-24" value={form.pertanyaan} onChange={(e) => setForm({ ...form, pertanyaan: e.target.value })} required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {PILIHAN.map((k) => (
                <div key={k}>
                  <label className="label">Pilihan {k}</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, jawaban_benar: k })}
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black transition ${
                        form.jawaban_benar === k ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                      title="Jadikan kunci jawaban"
                    >
                      {k}
                    </button>
                    <input
                      className="input"
                      value={form[kunciOpsi(k)]}
                      onChange={(e) => setForm({ ...form, [kunciOpsi(k)]: e.target.value })}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Klik huruf untuk menandai kunci jawaban. Kunci saat ini: <b className="text-emerald-300">{form.jawaban_benar}</b>
            </p>
            {error && <div className="rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200">{error}</div>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setForm(null)}>
                Batal
              </button>
              <button className="btn-primary" disabled={simpan}>
                {simpan ? 'Menyimpan…' : 'Simpan'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
