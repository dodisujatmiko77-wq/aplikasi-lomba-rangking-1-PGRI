import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Download, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { supabase, pesanError } from '../../lib/supabase'
import { JENJANG_INFO, PESERTA_PER_JENJANG, PESERTA_PER_KECAMATAN, type Jenjang, type Kecamatan, type Peserta } from '../../lib/types'
import JenjangTabs from '../../components/JenjangTabs'
import Modal from '../../components/Modal'

interface Form {
  id?: string
  kecamatan_id: number
  nama: string
  sekolah: string
  kode_akses: string
}

export default function KelolaPeserta() {
  const [jenjang, setJenjang] = useState<Jenjang>('SD')
  const [kecamatan, setKecamatan] = useState<Kecamatan[]>([])
  const [peserta, setPeserta] = useState<Peserta[]>([])
  const [cari, setCari] = useState('')
  const [form, setForm] = useState<Form | null>(null)
  const [error, setError] = useState('')
  const [simpan, setSimpan] = useState(false)

  const muat = useCallback(async () => {
    const [k, p] = await Promise.all([
      supabase.from('kecamatan').select('*').order('urutan').order('id'),
      supabase.from('peserta').select('*').eq('jenjang', jenjang).order('nomor_peserta'),
    ])
    setKecamatan((k.data as Kecamatan[]) ?? [])
    setPeserta((p.data as Peserta[]) ?? [])
  }, [jenjang])

  useEffect(() => {
    muat()
  }, [muat])

  const perKec = useMemo(() => {
    const m: Record<number, Peserta[]> = {}
    for (const p of peserta) (m[p.kecamatan_id] ||= []).push(p)
    return m
  }, [peserta])

  const q = cari.trim().toLowerCase()
  const cocok = (p: Peserta) =>
    !q || [p.nama, p.sekolah, p.nomor_peserta].some((s) => s?.toLowerCase().includes(q))

  const kirim = async (e: FormEvent) => {
    e.preventDefault()
    if (!form) return
    setSimpan(true)
    setError('')
    const isi = {
      jenjang,
      kecamatan_id: form.kecamatan_id,
      nama: form.nama.trim(),
      sekolah: form.sekolah.trim(),
      ...(form.kode_akses.trim() ? { kode_akses: form.kode_akses.trim() } : {}),
    }
    const { error } = form.id
      ? await supabase.from('peserta').update(isi).eq('id', form.id)
      : await supabase.from('peserta').insert(isi)
    setSimpan(false)
    if (error) return setError(pesanError(error))
    setForm(null)
    muat()
  }

  const hapus = async (p: Peserta) => {
    if (!confirm(`Hapus peserta ${p.nama}? Skor & jawabannya juga terhapus.`)) return
    const { error } = await supabase.from('peserta').delete().eq('id', p.id)
    if (error) alert(pesanError(error))
    muat()
  }

  const unduhCsv = () => {
    const nk = Object.fromEntries(kecamatan.map((k) => [k.id, k.nama]))
    const baris = [
      ['Nomor Peserta', 'Nama', 'Sekolah', 'Kecamatan', 'Jenjang', 'Kode Akses'],
      ...peserta.map((p) => [p.nomor_peserta, p.nama, p.sekolah, nk[p.kecamatan_id] ?? '', p.jenjang, p.kode_akses]),
    ]
    const csv = baris.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `peserta-${jenjang}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const info = JENJANG_INFO[jenjang]
  const persen = Math.round((peserta.length / PESERTA_PER_JENJANG) * 100)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <JenjangTabs nilai={jenjang} onChange={setJenjang} />
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input w-56 pl-9" placeholder="Cari peserta…" value={cari} onChange={(e) => setCari(e.target.value)} />
          </div>
          <button className="btn-ghost" onClick={unduhCsv} disabled={!peserta.length}>
            <Download size={16} /> CSV + Kode Akses
          </button>
        </div>
      </div>

      <div className="glass p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-bold">
            Peserta {jenjang}: {peserta.length} / {PESERTA_PER_JENJANG}
          </span>
          <span className="text-slate-400">{persen}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
          <div className={`h-full rounded-full bg-gradient-to-r ${info.gradient} transition-all`} style={{ width: `${persen}%` }} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kecamatan.map((k) => {
          const daftar = perKec[k.id] ?? []
          const kosong = PESERTA_PER_KECAMATAN - daftar.length
          return (
            <div key={k.id} className="glass p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-bold">{k.nama}</div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    kosong === 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'
                  }`}
                >
                  {daftar.length}/{PESERTA_PER_KECAMATAN}
                </span>
              </div>
              <div className="space-y-2">
                {daftar.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 ${cocok(p) ? '' : 'opacity-25'}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{p.nama}</div>
                      <div className="truncate text-[11px] text-slate-400">
                        {p.nomor_peserta} · kode <span className="font-mono text-amber-200">{p.kode_akses}</span>
                      </div>
                    </div>
                    <button
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                      onClick={() =>
                        setForm({ id: p.id, kecamatan_id: p.kecamatan_id, nama: p.nama, sekolah: p.sekolah, kode_akses: p.kode_akses })
                      }
                      title="Ubah"
                    >
                      <Pencil size={14} />
                    </button>
                    <button className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300" onClick={() => hapus(p)} title="Hapus">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, kosong) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setForm({ kecamatan_id: k.id, nama: '', sekolah: '', kode_akses: '' })}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-3 py-2.5 text-sm text-slate-400 transition hover:border-indigo-400/50 hover:text-indigo-200"
                  >
                    <Plus size={14} /> Tambah peserta
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Modal buka={!!form} judul={form?.id ? 'Ubah Peserta' : `Tambah Peserta ${jenjang}`} onTutup={() => setForm(null)}>
        {form && (
          <form onSubmit={kirim} className="space-y-4">
            <div>
              <label className="label">Kecamatan</label>
              <select
                className="input"
                value={form.kecamatan_id}
                onChange={(e) => setForm({ ...form, kecamatan_id: Number(e.target.value) })}
              >
                {kecamatan.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama} ({(perKec[k.id] ?? []).length}/{PESERTA_PER_KECAMATAN})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Nama Lengkap</label>
              <input className="input" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required autoFocus />
            </div>
            <div>
              <label className="label">Asal Sekolah</label>
              <input className="input" value={form.sekolah} onChange={(e) => setForm({ ...form, sekolah: e.target.value })} required />
            </div>
            <div>
              <label className="label">Kode Akses (kosongkan = otomatis)</label>
              <input
                className="input font-mono uppercase"
                value={form.kode_akses}
                onChange={(e) => setForm({ ...form, kode_akses: e.target.value })}
                maxLength={12}
              />
            </div>
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
