import { NavLink } from 'react-router-dom'
import { usePDFContext } from '../hooks/usePDFContext'

export default function Navbar() {
  const { tabs } = usePDFContext()

  return (
    <nav className="shrink-0 flex items-center justify-between px-6 h-14 bg-[#0a0a12] border-b border-white/10 text-slate-200">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3">
        <span className="font-bold text-base tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          PDF Library Reader
        </span>
      </div>

      {/* Navigation links */}
      <div className="flex items-center gap-2">
        <NavLink
          to="/library"
          className={({ isActive }) => `
            flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200
            ${isActive
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
          </svg>
          Biblioteca
        </NavLink>

        <NavLink
          to="/reader"
          className={({ isActive }) => `
            flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 relative
            ${isActive
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Lector PDF
          {tabs.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
              {tabs.length}
            </span>
          )}
        </NavLink>
      </div>
    </nav>
  )
}
