import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isConfigured = Boolean(url && key && !url.includes('xxxx'))

export const supabase: SupabaseClient = createClient(
  isConfigured ? url! : 'https://placeholder.supabase.co',
  isConfigured ? key! : 'placeholder',
  { realtime: { params: { eventsPerSecond: 20 } } },
)

export function pesanError(e: unknown): string {
  if (!e) return 'Terjadi kesalahan'
  if (typeof e === 'string') return e
  if (typeof e === 'object' && e && 'message' in e) return String((e as { message: unknown }).message)
  return 'Terjadi kesalahan'
}
