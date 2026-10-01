const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3]

export default function ZoomControls({ scale = 1.2, setScale, invertedColors = false, setInvertedColors, btnBase }) {
  const zoomIn = () => {
    const next = ZOOM_STEPS.find(s => s > scale)
    if (next) setScale(next)
  }

  const zoomOut = () => {
    const prev = [...ZOOM_STEPS].reverse().find(s => s < scale)
    if (prev) setScale(prev)
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={zoomOut}
        disabled={scale <= ZOOM_STEPS[0]}
        className={`${btnBase} w-8 h-8`}
        title="Alejar"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
        </svg>
      </button>

      <span className="text-xs text-slate-500 w-10 text-center">{Math.round(scale * 100)}%</span>

      <button
        type="button"
        onClick={zoomIn}
        disabled={scale >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
        className={`${btnBase} w-8 h-8`}
        title="Acercar"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => setInvertedColors(!invertedColors)}
        className={`${btnBase} w-8 h-8 ${invertedColors ? 'text-indigo-400 bg-indigo-500/10' : ''}`}
        title={invertedColors ? 'Restaurar colores del PDF' : 'Invertir colores del PDF'}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75v16.5m0 0a8.25 8.25 0 000-16.5m0 16.5a8.25 8.25 0 010-16.5m0 0c4.556 0 8.25 3.694 8.25 8.25S16.556 20.25 12 20.25" />
        </svg>
      </button>
    </div>
  )
}
