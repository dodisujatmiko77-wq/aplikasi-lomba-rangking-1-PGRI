import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'
import { isConfigured } from '../lib/supabase'
import SetupNotice from './SetupNotice'

const MENU = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/live/SD', label: 'Live Score', match: '/live' },
  { to: '/hasil', label: 'Hasil & Juara' },
  { to: '/peserta', label: 'Peserta', match: '/peserta' },
  { to: '/admin', label: 'Admin', match: '/admin' },
]

export default function Layout() {
  const [buka, setBuka] = useState(false)
  const lokasi = useLocation()
  const modeLayar = lokasi.pathname.startsWith('/peserta/lomba')

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <NavLink to="/" className="flex items-center gap-3">
            <Logo />
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight sm:text-base">Lomba Ranking 1</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300/90">PGRI</div>
            </div>
          </NavLink>
          {!modeLayar && (
            <>
              <nav className="hidden items-center gap-1 md:flex">
                {MENU.map((m) => {
                  const aktif = m.match ? lokasi.pathname.startsWith(m.match) : undefined
                  return (
                    <NavLink
                      key={m.to}
                      to={m.to}
                      end={m.end}
                      className={({ isActive }) =>
                        `rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                          (aktif ?? isActive) ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                        }`
                      }
                    >
                      {m.label}
                    </NavLink>
                  )
                })}
              </nav>
              <button className="btn-ghost px-2.5 md:hidden" onClick={() => setBuka(!buka)} aria-label="Menu">
                {buka ? <X size={18} /> : <Menu size={18} />}
              </button>
            </>
          )}
        </div>
        {buka && !modeLayar && (
          <nav className="border-t border-white/5 px-4 py-3 md:hidden">
            {MENU.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                end={m.end}
                onClick={() => setBuka(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5"
              >
                {m.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-8">
        {isConfigured ? <Outlet /> : <SetupNotice />}
      </main>
      {!modeLayar && (
        <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Lomba Ranking 1 PGRI · SD · SMP · SMA · 15 Kecamatan
        </footer>
      )}
    </div>
  )
}
