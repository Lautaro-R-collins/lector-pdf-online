import { usePDFContext } from '../hooks/usePDFContext'
import { usePDF } from '../hooks/usePDF'

export default function TabBar() {
  const { tabs, activeTabId, setActiveTabId, closeTab } = usePDFContext()
  const { openFilePicker } = usePDF()

  if (tabs.length === 0) return null

  return (
    <div
      className="flex items-center gap-1 px-2 pt-2 overflow-x-auto border-b border-white/5 bg-[#0d0d14] shrink-0"
      style={{ scrollbarWidth: 'none' }}
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTabId(tab.id)}
          className={`
            group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium
            max-w-45 shrink-0 transition-all duration-150 border border-b-0 relative cursor-pointer
            ${tab.id === activeTabId
              ? 'bg-[#16161f] border-white/10 text-slate-200'
              : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }
          `}
        >
          {/* Active indicator */}
          {tab.id === activeTabId && (
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
        onClick={openFilePicker}
        title="Abrir nuevo PDF"
        className="shrink-0 ml-1 mb-1.5 w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-all text-lg leading-none cursor-pointer"
      >
        +
      </button>
    </div>
  )
}
