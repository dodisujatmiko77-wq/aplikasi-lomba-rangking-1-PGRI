import { useCallback, useEffect, useRef, useState } from 'react'
import { isConfigured, supabase } from './supabase'
import type { Jenjang, Peringkat, Sesi, SoalAktif } from './types'

const uid = () => Math.random().toString(36).slice(2, 10)

/** Selisih jam server - jam perangkat (ms), agar hitung mundur sinkron di semua layar. */
let offsetCache: number | null = null
export function useServerOffset() {
  const [offset, setOffset] = useState(offsetCache ?? 0)
  useEffect(() => {
    if (offsetCache !== null || !isConfigured) return
    let batal = false
    ;(async () => {
      const t0 = Date.now()
      const { data, error } = await supabase.rpc('server_now')
      const t1 = Date.now()
      if (error || !data || batal) return
      offsetCache = new Date(data as string).getTime() - (t0 + t1) / 2
      setOffset(offsetCache)
    })()
    return () => {
      batal = true
    }
  }, [])
  return offset
}

/** Waktu sekarang menurut server, diperbarui tiap `interval` ms. */
export function useNow(interval = 100) {
  const offset = useServerOffset()
  const [now, setNow] = useState(() => Date.now() + offset)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now() + offset), interval)
    return () => clearInterval(t)
  }, [offset, interval])
  return now
}

/** Status lomba semua jenjang (realtime). */
export function useSemuaSesi() {
  const [sesi, setSesi] = useState<Partial<Record<Jenjang, Sesi>>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }
    let aktif = true
    const muat = async () => {
      const { data } = await supabase.from('sesi_lomba').select('*')
      if (!aktif || !data) return
      const map: Partial<Record<Jenjang, Sesi>> = {}
      for (const s of data as Sesi[]) map[s.jenjang] = s
      setSesi(map)
      setLoading(false)
    }
    muat()
    const ch = supabase
      .channel('sesi-' + uid())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sesi_lomba' }, (payload) => {
        const s = payload.new as Sesi
        if (s?.jenjang) setSesi((prev) => ({ ...prev, [s.jenjang]: s }))
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') muat()
      })
    const poll = setInterval(muat, 15000)
    return () => {
      aktif = false
      clearInterval(poll)
      supabase.removeChannel(ch)
    }
  }, [])

  return { sesi, loading }
}

export function useSesi(jenjang: Jenjang) {
  const { sesi, loading } = useSemuaSesi()
  return { sesi: sesi[jenjang], loading }
}

/**
 * Soal aktif untuk jenjang (tanpa kunci jawaban saat berlangsung).
 * Dimuat ulang ketika sesi berubah, ketika waktu habis, dan bila `pemicu` berubah.
 */
export function useSoalAktif(jenjang: Jenjang, sesi: Sesi | undefined, pemicu?: unknown) {
  const [soal, setSoal] = useState<SoalAktif | null>(null)
  const offset = useServerOffset()

  const muat = useCallback(async () => {
    if (!isConfigured) return
    const { data } = await supabase.rpc('get_soal_aktif', { p_jenjang: jenjang })
    if (data) setSoal(data as SoalAktif)
  }, [jenjang])

  useEffect(() => {
    muat()
  }, [muat, sesi?.updated_at, sesi?.status, pemicu])

  // Muat ulang otomatis sesaat setelah waktu soal habis (untuk mengungkap kunci jawaban)
  useEffect(() => {
    if (sesi?.status !== 'soal' || !sesi.soal_selesai_at) return
    const sisa = new Date(sesi.soal_selesai_at).getTime() - (Date.now() + offset) + 1300
    const t = setTimeout(muat, Math.max(0, sisa))
    return () => clearTimeout(t)
  }, [sesi?.status, sesi?.soal_selesai_at, offset, muat])

  return { soal, muat }
}

/** Papan peringkat live per jenjang. */
export function usePeringkat(jenjang: Jenjang) {
  const [data, setData] = useState<Peringkat[]>([])
  const [loading, setLoading] = useState(true)
  const [versi, setVersi] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const muat = useCallback(async () => {
    if (!isConfigured) {
      setLoading(false)
      return
    }
    const { data } = await supabase.rpc('get_peringkat', { p_jenjang: jenjang })
    if (data) {
      setData(data as Peringkat[])
      setVersi((v) => v + 1)
    }
    setLoading(false)
  }, [jenjang])

  useEffect(() => {
    setLoading(true)
    muat()
    if (!isConfigured) return
    const jadwal = () => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(muat, 250)
    }
    const ch = supabase
      .channel('skor-' + jenjang + '-' + uid())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skor_peserta' }, (payload) => {
        const row = (payload.new && Object.keys(payload.new).length ? payload.new : payload.old) as { jenjang?: string }
        if (!row?.jenjang || row.jenjang === jenjang) jadwal()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sesi_lomba' }, jadwal)
      .subscribe()
    const poll = setInterval(muat, 20000)
    return () => {
      clearInterval(poll)
      if (timer.current) clearTimeout(timer.current)
      supabase.removeChannel(ch)
    }
  }, [jenjang, muat])

  return { data, loading, versi, muat }
}

export function useLocalStorage<T>(key: string, awal: T) {
  const [nilai, setNilai] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key)
      return s ? (JSON.parse(s) as T) : awal
    } catch {
      return awal
    }
  })
  const simpan = useCallback(
    (v: T | ((p: T) => T)) => {
      setNilai((prev) => {
        const baru = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
        try {
          if (baru === null || baru === undefined) localStorage.removeItem(key)
          else localStorage.setItem(key, JSON.stringify(baru))
        } catch {
          /* abaikan */
        }
        return baru
      })
    },
    [key],
  )
  return [nilai, simpan] as const
}

export function formatDetik(ms: number) {
  return (ms / 1000).toFixed(2) + ' dtk'
}
