import { useState } from 'react'
import { usePDFContext } from '../hooks/usePDFContext'
import { usePDF } from '../hooks/usePDF'
import { useNavigate, useLocation } from 'react-router-dom'

export default function TabBar() {
  const { tabs, activeTabId, setActiveTabId, closeTab } = usePDFContext()
  const { openFilePicker } = usePDF()
  const navigate = useNavigate()
  const location = useLocation()
  const [modeMenuOpen, setModeMenuOpen] = useState(false)

  const isLibraryActive = location.pathname === '/library'

  return (
    <div
      className="flex items-center justify-between px-3 pt-2 border-b border-white/5 bg-[#0d0d14] shrink-0 select-none"
    >
      {/* Left side: PDF Tabs list & '+' button */}
      <div className="flex items-center gap-1 overflow-x-auto min-w-0" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTabId(tab.id)
              if (isLibraryActive) navigate('/reader')
            }}
            className={`
              group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium
              max-w-45 shrink-0 transition-all duration-150 border border-b-0 relative cursor-pointer
              ${!isLibraryActive && tab.id === activeTabId
                ? 'bg-[#16161f] border-white/10 text-slate-200'
                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }
            `}
          >
            {!isLibraryActive && tab.id === activeTabId && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-indigo-500 rounded-full" />
            )}

            <svg className="w-3 h-3 shrink-0 text-red-400/70" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
            </svg>

            <span className="truncate">{tab.name}</span>

            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                closeTab(tab.id)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                  closeTab(tab.id)
                }
              }}
              className="shrink-0 w-4 h-4 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all"
              title="Cerrar pestaña"
            >
              ✕
            </span>
          </button>
        ))}

        {/* New tab / open file button */}
        <button
          type="button"
          onClick={() => {
            openFilePicker()
            if (isLibraryActive) navigate('/reader')
          }}
          title="Abrir nuevo PDF"
          className="shrink-0 ml-1 mb-1.5 w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-all text-lg leading-none cursor-pointer"
        >
          +
        </button>
      </div>

      {/* Right side: MODO Selector (Hover / Click Modal Dropdown) */}
      <div
        className="relative mb-1.5 shrink-0 ml-3 z-30"
        onMouseEnter={() => setModeMenuOpen(true)}
        onMouseLeave={() => setModeMenuOpen(false)}
      >
        <button
          type="button"
          onClick={() => setModeMenuOpen(o => !o)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all text-xs font-semibold cursor-pointer shadow-sm"
        >
          <span className="text-[10px] tracking-wide text-indigo-400 font-bold uppercase">MODO:</span>
          <span>{isLibraryActive ? 'Biblioteca' : 'Lector PDF'}</span>
          <svg
            className={`w-3.5 h-3.5 text-indigo-400 transition-transform duration-200 ${modeMenuOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Modal Dropdown Panel */}
        {modeMenuOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-[#161622] border border-white/10 p-1.5 shadow-2xl z-50">
            <button
              type="button"
              onClick={() => {
                navigate('/reader')
                setModeMenuOpen(false)
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isLibraryActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span>📄</span> Modo Lector PDF
            </button>

            <button
              type="button"
              onClick={() => {
                navigate('/library')
                setModeMenuOpen(false)
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer mt-1 ${
                isLibraryActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span>📖</span> Modo Biblioteca
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
