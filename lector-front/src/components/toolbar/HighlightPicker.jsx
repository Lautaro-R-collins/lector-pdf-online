import { useState } from 'react'

const HIGHLIGHT_COLORS = ['#facc15', '#86efac', '#93c5fd', '#f9a8d4', '#fdba74']

export default function HighlightPicker({
  highlightMode = false,
  highlightColor = '#facc15',
  highlights = [],
  setHighlightMode,
  setHighlightColor,
  clearHighlights,
  btnBase,
}) {
  const [highlightPanelOpen, setHighlightPanelOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setHighlightMode(!highlightMode)
          setHighlightPanelOpen(true)
        }}
        className={`${btnBase} w-8 h-8 ${highlightMode ? 'text-amber-300 bg-amber-500/10' : ''}`}
        title={highlightMode ? 'Desactivar resaltador' : 'Activar resaltador'}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5h15M7.5 15.75l8.25-8.25 2.25 2.25-8.25 8.25H7.5v-2.25zM14.25 6l1.5-1.5a1.5 1.5 0 012.121 0l1.629 1.629a1.5 1.5 0 010 2.121L18 9.75" />
        </svg>
      </button>

      {highlightPanelOpen && (
        <div className="absolute left-0 top-10 z-40 w-48 rounded-lg border border-white/10 bg-[#16161f] p-3 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-300">Resaltador</span>
            <button
              type="button"
              onClick={() => setHighlightPanelOpen(false)}
              className={`${btnBase} h-6 w-6`}
              title="Cerrar"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {HIGHLIGHT_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  setHighlightColor(color)
                  setHighlightMode(true)
                }}
                className={`h-7 w-7 cursor-pointer rounded-full border-2 transition-transform hover:scale-105 ${highlightColor === color ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
                title={`Color ${color}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setHighlightMode(!highlightMode)}
            className={`mt-3 h-8 w-full cursor-pointer rounded-lg px-3 text-xs font-medium transition-colors ${highlightMode ? 'bg-amber-500/15 text-amber-200' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
          >
            {highlightMode ? 'Resaltador activo' : 'Activar resaltador'}
          </button>

          <button
            type="button"
            onClick={clearHighlights}
            disabled={highlights.length === 0}
            className="mt-2 h-8 w-full cursor-pointer rounded-lg px-3 text-xs text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Borrar resaltados
          </button>
        </div>
      )}
    </div>
  )
}
