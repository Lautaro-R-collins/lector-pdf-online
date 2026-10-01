import { useState } from 'react'

export default function PageNavigation({ pageNumber = 1, numPages = 0, setPageNumber, btnBase }) {
  const [pageInput, setPageInput] = useState(String(pageNumber))
  const [prevPageNumber, setPrevPageNumber] = useState(pageNumber)

  // Derive state during render when pageNumber changes externally without effect cascade
  if (prevPageNumber !== pageNumber) {
    setPrevPageNumber(pageNumber)
    setPageInput(String(pageNumber))
  }

  const handlePageInput = (e) => {
    if (e.key === 'Enter') {
      const n = parseInt(pageInput, 10)
      if (!isNaN(n) && n >= 1 && n <= numPages) {
        setPageNumber(n)
      } else {
        setPageInput(String(pageNumber))
      }
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
        disabled={pageNumber <= 1}
        className={`${btnBase} w-8 h-8`}
        title="Página anterior"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <input
          type="number"
          min={1}
          max={numPages}
          value={pageInput}
          onChange={e => setPageInput(e.target.value)}
          onKeyDown={handlePageInput}
          onBlur={() => setPageInput(String(pageNumber))}
          className="w-10 text-center bg-white/5 border border-white/10 rounded-md py-0.5 text-slate-200 focus:outline-none focus:border-indigo-500/60"
        />
        <span>/ {numPages}</span>
      </div>

      <button
        type="button"
        onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
        disabled={pageNumber >= numPages}
        className={`${btnBase} w-8 h-8`}
        title="Página siguiente"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  )
}
