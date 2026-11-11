import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { BookOpen, Gamepad2, LogOut, MapPin, ShieldCheck, Users } from 'lucide-react'
import { supabase, pesanError } from '../../lib/supabase'
import Kontrol from './Kontrol'
import KelolaPeserta from './KelolaPeserta'
import KelolaSoal from './KelolaSoal'
import KelolaKecamatan from './KelolaKecamatan'

const TAB = [
  { id: 'kontrol', label: 'Kontrol Lomba', ikon: Gamepad2 },
  { id: 'peserta', label: 'Peserta', ikon: Users },
  { id: 'soal', label: 'Bank Soal', ikon: BookOpen },
  { id: 'kecamatan', label: 'Kecamatan', ikon: MapPin },
] as const
type TabId = (typeof TAB)[number]['id']

export default function Admin() {
  const [sesi, setSesi] = useState<Session | null>(null)
  const [siap, setSiap] = useState(false)
  const [admin, setAdmin] = useState<boolean | null>(null)
  const [tab, setTab] = useState<TabId>('kontrol')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesi(data.session)
      setSiap(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSesi(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!sesi) return setAdmin(null)
    supabase.rpc('is_admin').then(({ data }) => setAdmin(Boolean(data)))
  }, [sesi])

  if (!siap) return null
  if (!sesi) return <LoginAdmin />
  if (admin === null) return <div className="py-20 text-center text-slate-400">Memeriksa akses…</div>
  if (!admin)
    return (
      <div className="glass mx-auto max-w-md p-8 text-center">
        <h1 className="text-xl font-bold">Akses ditolak</h1>
        <p className="mt-2 text-sm text-slate-400">
          Akun <b>{sesi.user.email}</b> belum terdaftar sebagai admin. Tambahkan email ini ke tabel{' '}
          <code className="text-amber-300">admin_users</code> di Supabase.
        </p>
        <button className="btn-ghost mt-6" onClick={() => supabase.auth.signOut()}>
          <LogOut size={16} /> Keluar
        </button>
      </div>
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold sm:text-3xl">
            <ShieldCheck className="text-emerald-300" /> Panel Panitia
          </h1>
          <p className="text-sm text-slate-400">Masuk sebagai {sesi.user.email}</p>
        </div>
        <button className="btn-ghost" onClick={() => supabase.auth.signOut()}>
          <LogOut size={16} /> Keluar
        </button>
      </div>
      <div className="scroll-thin flex gap-2 overflow-x-auto">
        {TAB.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`btn shrink-0 ${tab === t.id ? 'bg-white/10 text-white ring-1 ring-white/20' : 'text-slate-400 hover:text-white'}`}
          >
            <t.ikon size={16} /> {t.label}
          </button>
        ))}
      </div>
      {tab === 'kontrol' && <Kontrol />}
      {tab === 'peserta' && <KelolaPeserta />}
      {tab === 'soal' && <KelolaSoal />}
      {tab === 'kecamatan' && <KelolaKecamatan />}
    </div>
  )
}

function LoginAdmin() {
  const [email, setEmail] = useState('')
  const [sandi, setSandi] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const masuk = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: sandi })
    setLoading(false)
    if (error) setError(pesanError(error))
  }

  return (
    <div className="grid min-h-[70vh] place-items-center">
      <form onSubmit={masuk} className="glass w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-300">
            <ShieldCheck size={28} />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold">Login Panitia</h1>
          <p className="mt-1 text-sm text-slate-400">Khusus admin / operator lomba.</p>
        </div>
        <label className="label">Email</label>
        <input className="input mb-4" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label className="label">Kata Sandi</label>
        <input className="input mb-6" type="password" value={sandi} onChange={(e) => setSandi(e.target.value)} required />
        {error && <div className="mb-4 rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200">{error}</div>}
        <button className="btn-primary w-full py-3" disabled={loading}>
          {loading ? 'Memproses…' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}
