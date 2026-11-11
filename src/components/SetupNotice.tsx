import { Database } from 'lucide-react'

export default function SetupNotice() {
  return (
    <div className="glass mx-auto max-w-2xl p-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500/20 text-indigo-300">
          <Database />
        </div>
        <div>
          <h1 className="text-xl font-bold">Hubungkan ke Supabase</h1>
          <p className="text-sm text-slate-400">Aplikasi belum dikonfigurasi.</p>
        </div>
      </div>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
        <li>Buat project di <b>supabase.com</b>.</li>
        <li>
          Buka <b>SQL Editor</b>, jalankan <code className="text-amber-300">supabase/schema.sql</code> (lalu opsional{' '}
          <code className="text-amber-300">seed_soal_contoh.sql</code> &amp;{' '}
          <code className="text-amber-300">seed_peserta_demo.sql</code>).
        </li>
        <li>
          Salin <code className="text-amber-300">.env.example</code> menjadi <code className="text-amber-300">.env</code>,
          isi <code>VITE_SUPABASE_URL</code> &amp; <code>VITE_SUPABASE_ANON_KEY</code>.
        </li>
        <li>
          Jalankan ulang <code className="text-amber-300">npm run dev</code>.
        </li>
      </ol>
    </div>
  )
}
