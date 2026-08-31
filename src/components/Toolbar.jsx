import { usePDFContext } from '../hooks/usePDFContext'
import { usePDF } from '../hooks/usePDF'
import { useSearch } from '../hooks/useSearch'
import PomodoroTimer from './PomodoroTimer'
import PageNavigation from './toolbar/PageNavigation'
import ZoomControls from './toolbar/ZoomControls'
import HighlightPicker from './toolbar/HighlightPicker'
import SearchBox from './toolbar/SearchBox'

export default function Toolbar({ sidebarOpen, onToggleSidebar }) {
  const {
    activeTab,
    setPageNumber,
    setScale,
    setInvertedColors,
    setHighlightMode,
    setHighlightColor,
    clearHighlights,
    darkMode,
    toggleDarkMode,
  } = usePDFContext()
  const { openFilePicker } = usePDF()
  const { search, goToResult } = useSearch()

  const {
    pageNumber = 1,
    numPages = 0,
    scale = 1.2,
    invertedColors = false,
    highlightMode = false,
    highlightColor = '#facc15',
    highlights = [],
    searchResults = [],
    searchIndex = 0,
    searchQuery = '',
  } = activeTab ?? {}

  const btnBase = 'flex items-center justify-center rounded-lg cursor-pointer transition-all duration-150 text-slate-400 hover:text-slate-200 hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed'

  return (
    <header className="shrink-0 flex items-center gap-2 px-3 h-12 border-b border-white/5 bg-[#0d0d14]">

      {/* Sidebar toggle */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className={`${btnBase} w-8 h-8 ${sidebarOpen ? 'text-indigo-400 bg-indigo-500/10' : ''}`}
        title="Alternar miniaturas"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
        </svg>
      </button>

      <div className="w-px h-5 bg-white/8 mx-1" />

      {activeTab && (
        <>
          {/* Page navigation */}
          <PageNavigation
            pageNumber={pageNumber}
            numPages={numPages}
            setPageNumber={setPageNumber}
            btnBase={btnBase}
          />

          <div className="w-px h-5 bg-white/8 mx-1" />

          {/* Zoom controls */}
          <ZoomControls
            scale={scale}
            setScale={setScale}
            invertedColors={invertedColors}
            setInvertedColors={setInvertedColors}
            btnBase={btnBase}
          />

          {/* Highlight picker */}
          <HighlightPicker
            highlightMode={highlightMode}
            highlightColor={highlightColor}
            highlights={highlights}
            setHighlightMode={setHighlightMode}
            setHighlightColor={setHighlightColor}
            clearHighlights={clearHighlights}
            btnBase={btnBase}
          />
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      {activeTab && (
        <SearchBox
          searchQuery={searchQuery}
          searchResults={searchResults}
          searchIndex={searchIndex}
          onSearch={search}
          onNavigateResult={goToResult}
          btnBase={btnBase}
        />
      )}

      <div className="w-px h-5 bg-white/8 mx-1" />

      {/* Pomodoro Timer */}
      <PomodoroTimer btnBase={btnBase} />

      <div className="w-px h-5 bg-white/8 mx-1" />

      {/* Dark mode toggle */}
      <button
        type="button"
        onClick={toggleDarkMode}
        className={`${btnBase} w-8 h-8`}
        title={darkMode ? 'Modo claro' : 'Modo oscuro'}
      >
        {darkMode ? (
          <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25m-13.5 0H3m15.364 6.364l-1.591-1.591M6.758 6.758L5.167 5.167m12.728 0l-1.591 1.591M6.758 17.242l-1.591 1.591M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        )}
      </button>

      {/* Open file */}
      <button
        type="button"
        onClick={openFilePicker}
        className={`${btnBase} w-8 h-8`}
        title="Abrir PDF"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

    </header>
  )
}
