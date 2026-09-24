import { useEffect, useRef, useState } from 'react'

const ANNOTATION_COLORS = [
  { value: '#f59e0b', name: 'Ámbar' },
  { value: '#10b981', name: 'Esmeralda' },
  { value: '#0ea5e9', name: 'Cielo' },
  { value: '#a855f7', name: 'Púrpura' },
  { value: '#f43f5e', name: 'Rosa' },
]

export default function AnnotationPicker({
  annotationMode = false,
  annotationColor = '#f59e0b',
  annotations = [],
  pageNumber = 1,
  setAnnotationMode,
  setAnnotationColor,
  clearAnnotations,
  btnBase,
}) {
  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef(null)

  const pageAnnotations = annotations.filter(a => a.pageNumber === pageNumber)
  const totalCount = annotations.length

  useEffect(() => {
    if (!panelOpen) return

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setPanelOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [panelOpen])

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setAnnotationMode(!annotationMode)
          setPanelOpen(true)
        }}
        className={`${btnBase} relative w-8 h-8 ${annotationMode ? 'text-amber-400 bg-amber-500/15 ring-1 ring-amber-500/30' : ''}`}
        title={annotationMode ? 'Desactivar modo anotación' : 'Activar modo anotación'}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v5.518Z"
          />
        </svg>

        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-black shadow-sm">
            {totalCount}
          </span>
        )}
      </button>

      {panelOpen && (
        <div className="absolute left-0 top-10 z-40 w-52 rounded-xl border border-white/10 bg-[#16161f] p-3 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold text-slate-200">Anotaciones</span>
            </div>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className={`${btnBase} h-5 w-5 text-slate-400 hover:text-slate-200`}
              title="Cerrar"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-3">
            <span className="text-[11px] font-medium text-slate-400">Color del marcador</span>
            <div className="mt-2 flex items-center justify-between gap-1.5">
              {ANNOTATION_COLORS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => {
                    setAnnotationColor(color.value)
                    setAnnotationMode(true)
                  }}
                  className={`h-6 w-6 cursor-pointer rounded-full border-2 transition-transform hover:scale-110 ${
                    annotationColor === color.value ? 'border-white scale-105' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAnnotationMode(!annotationMode)}
            className={`mt-3 h-8 w-full cursor-pointer rounded-lg px-3 text-xs font-medium transition-all ${
              annotationMode
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {annotationMode ? 'Modo activo (clic en PDF)' : 'Activar modo anotación'}
          </button>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Pág. {pageNumber}: {pageAnnotations.length}</span>
            <span>Total: {totalCount}</span>
          </div>

          {totalCount > 0 && (
            <button
              type="button"
              onClick={clearAnnotations}
              className="mt-2 h-7 w-full cursor-pointer rounded-lg px-2 text-[11px] text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              Borrar todas las notas
            </button>
          )}
        </div>
      )}
    </div>
  )
}
