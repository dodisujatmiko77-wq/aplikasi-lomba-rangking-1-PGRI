import { useState, type FormEvent } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { KeyRound, LogIn, UserRound } from 'lucide-react'
import { supabase, pesanError } from '../lib/supabase'
import { useLocalStorage } from '../lib/hooks'
import type { PesertaLogin } from '../lib/types'
import Logo from '../components/Logo'

export const KUNCI_AKUN = 'pgri-peserta'

export default function PesertaMasuk() {
  const [akun, setAkun] = useLocalStorage<PesertaLogin | null>(KUNCI_AKUN, null)
  const [nomor, setNomor] = useState('')
  const [kode, setKode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  if (akun) return <Navigate to="/peserta/lomba" replace />

  const masuk = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error } = await supabase.rpc('login_peserta', { p_nomor: nomor, p_kode: kode })
    setLoading(false)
    if (error) return setError(pesanError(error))
    if (!data) return setError('Nomor peserta atau kode akses salah.')
    setAkun({ ...(data as Omit<PesertaLogin, 'kode'>), kode: kode.trim().toUpperCase() })
    navigate('/peserta/lomba')
  }

  return (
    <div className="grid min-h-[70vh] place-items-center">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={masuk}
        className="glass w-full max-w-md p-8"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo besar />
          <h1 className="mt-4 text-2xl font-extrabold">Masuk Peserta</h1>
          <p className="mt-1 text-sm text-slate-400">Gunakan nomor peserta & kode akses dari panitia.</p>
        </div>
        <label className="label">Nomor Peserta</label>
        <div className="relative mb-4">
          <UserRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-10 uppercase"
            placeholder="contoh: SD-01-1"
            value={nomor}
            onChange={(e) => setNomor(e.target.value)}
            required
            autoFocus
          />
        </div>
        <label className="label">Kode Akses</label>
        <div className="relative mb-6">
          <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-10 uppercase tracking-[0.3em]"
            placeholder="••••••"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            required
          />
        </div>
        {error && <div className="mb-4 rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200">{error}</div>}
        <button className="btn-primary w-full py-3 text-base" disabled={loading}>
          <LogIn size={18} /> {loading ? 'Memeriksa…' : 'Masuk Arena'}
        </button>
      </motion.form>
    </div>
  )
}
