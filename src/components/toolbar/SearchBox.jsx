import { useState, useRef, useEffect } from 'react'

export default function SearchBox({
  searchQuery = '',
  searchResults = [],
  searchIndex = 0,
  onSearch,
  onNavigateResult,
  btnBase,
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [prevQuery, setPrevQuery] = useState(searchQuery)
  const [searching, setSearching] = useState(false)
  const searchRef = useRef(null)

  // Synchronize query during render when tab changes or query updates externally
  if (prevQuery !== searchQuery) {
    setPrevQuery(searchQuery)
    setLocalQuery(searchQuery)
  }

  // Focus search input when search box is opened
  useEffect(() => {
    if (searchOpen) {
      searchRef.current?.focus()
    }
  }, [searchOpen])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!localQuery.trim()) return
    setSearching(true)
    await onSearch(localQuery)
    setSearching(false)
  }

  return (
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
          <button
            type="submit"
            disabled={searching}
            className={`${btnBase} w-8 h-8 ${searching ? 'animate-pulse' : ''}`}
            title="Buscar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
          {searchResults.length > 0 && (
            <>
              <span className="text-xs text-slate-500">{searchIndex + 1}/{searchResults.length}</span>
              <button
                type="button"
                onClick={() => onNavigateResult(-1)}
                className={`${btnBase} w-7 h-7`}
                title="Resultado anterior"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onNavigateResult(1)}
                className={`${btnBase} w-7 h-7`}
                title="Resultado siguiente"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}
          {localQuery && searchResults.length === 0 && !searching && (
            <span className="text-xs text-slate-600">Sin resultados</span>
          )}
        </form>
      )}

      <button
        type="button"
        onClick={() => {
          setSearchOpen(o => !o)
          if (searchOpen) setLocalQuery('')
        }}
        className={`${btnBase} w-8 h-8 ${searchOpen ? 'text-indigo-400 bg-indigo-500/10' : ''}`}
        title="Buscar texto"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </button>
    </div>
  )
}
