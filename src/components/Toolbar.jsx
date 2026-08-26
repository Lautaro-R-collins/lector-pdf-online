import { useState, useRef, useEffect } from 'react'
import { usePDFContext } from '../context/PDFContext'
import { usePDF } from '../hooks/usePDF'
import { useSearch } from '../hooks/useSearch'

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3]

export default function Toolbar({ sidebarOpen, onToggleSidebar }) {
  const { activeTab, setPageNumber, setScale, setInvertedColors, darkMode, setDarkMode } = usePDFContext()
  const { openFilePicker } = usePDF()
  const { search, goToResult } = useSearch()

  const [searchOpen, setSearchOpen] = useState(false)
  const [localQuery, setLocalQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [pageInput, setPageInput] = useState('')
  const searchRef = useRef(null)

  const { pageNumber = 1, numPages = 0, scale = 1.2, invertedColors = false, searchResults = [], searchIndex = 0, searchQuery = '' } = activeTab ?? {}

  // Sync page input with actual page
  useEffect(() => { setPageInput(String(pageNumber)) }, [pageNumber])

  // Sync search bar with tab's current query
  useEffect(() => { setLocalQuery(searchQuery) }, [searchQuery])

  // Focus search input when opened
  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!localQuery.trim()) return
    setSearching(true)
    await search(localQuery)
    setSearching(false)
  }

  const handlePageInput = (e) => {
    if (e.key === 'Enter') {
      const n = parseInt(pageInput)
      if (n >= 1 && n <= numPages) setPageNumber(n)
      else setPageInput(String(pageNumber))
    }
  }

  const zoomIn = () => {
    const next = ZOOM_STEPS.find(s => s > scale)
    if (next) setScale(next)
  }

  const zoomOut = () => {
    const prev = [...ZOOM_STEPS].reverse().find(s => s < scale)
    if (prev) setScale(prev)
  }

  const btnBase = 'flex items-center justify-center rounded-lg transition-all duration-150 text-slate-400 hover:text-slate-200 hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed'

  return (
    <header className="shrink-0 flex items-center gap-2 px-3 h-12 border-b border-white/5 bg-[#0d0d14]">

      {/* Sidebar toggle */}
      <button onClick={onToggleSidebar} className={`${btnBase} w-8 h-8 ${sidebarOpen ? 'text-indigo-400 bg-indigo-500/10' : ''}`} title="Alternar miniaturas">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
        </svg>
      </button>

      <div className="w-px h-5 bg-white/8 mx-1" />

      {/* Page navigation */}
      {activeTab && (
        <>
          <button onClick={() => setPageNumber(Math.max(1, pageNumber - 1))} disabled={pageNumber <= 1} className={`${btnBase} w-8 h-8`} title="Página anterior">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
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

          <button onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))} disabled={pageNumber >= numPages} className={`${btnBase} w-8 h-8`} title="Página siguiente">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>

          <div className="w-px h-5 bg-white/8 mx-1" />

          {/* Zoom */}
          <button onClick={zoomOut} disabled={scale <= ZOOM_STEPS[0]} className={`${btnBase} w-8 h-8`} title="Alejar">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" /></svg>
          </button>
          <span className="text-xs text-slate-500 w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} disabled={scale >= ZOOM_STEPS[ZOOM_STEPS.length - 1]} className={`${btnBase} w-8 h-8`} title="Acercar">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" /></svg>
          </button>

          <button
            onClick={() => setInvertedColors(!invertedColors)}
            className={`${btnBase} w-8 h-8 ${invertedColors ? 'text-indigo-400 bg-indigo-500/10' : ''}`}
            title={invertedColors ? 'Restaurar colores del PDF' : 'Invertir colores del PDF'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75v16.5m0 0a8.25 8.25 0 000-16.5m0 16.5a8.25 8.25 0 010-16.5m0 0c4.556 0 8.25 3.694 8.25 8.25S16.556 20.25 12 20.25" />
            </svg>
          </button>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      {activeTab && (
        <div className="flex items-center gap-1">
          {searchOpen && (
            <form onSubmit={handleSearch} className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar en el PDF..."
                value={localQuery}
                onChange={e => setLocalQuery(e.target.value)}
                className="w-48 text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60"
              />
              <button type="submit" disabled={searching} className={`${btnBase} w-8 h-8 ${searching ? 'animate-pulse' : ''}`} title="Buscar">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
              </button>
              {searchResults.length > 0 && (
                <>
                  <span className="text-xs text-slate-500">{searchIndex + 1}/{searchResults.length}</span>
                  <button type="button" onClick={() => goToResult(-1)} className={`${btnBase} w-7 h-7`}><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>
                  <button type="button" onClick={() => goToResult(1)} className={`${btnBase} w-7 h-7`}><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>
                </>
              )}
              {localQuery && searchResults.length === 0 && !searching && (
                <span className="text-xs text-slate-600">Sin resultados</span>
              )}
            </form>
          )}
          <button
            onClick={() => { setSearchOpen(o => !o); if (searchOpen) setLocalQuery('') }}
            className={`${btnBase} w-8 h-8 ${searchOpen ? 'text-indigo-400 bg-indigo-500/10' : ''}`}
            title="Buscar texto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          </button>
        </div>
      )}

      <div className="w-px h-5 bg-white/8 mx-1" />

      {/* Open file */}
      <button onClick={openFilePicker} className={`${btnBase} w-8 h-8`} title="Abrir PDF">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
      </button>

      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(d => !d)}
        className={`${btnBase} w-8 h-8`}
        title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {darkMode
          ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
          : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
        }
      </button>
    </header>
  )
}
