import { useState } from 'react'
import { downloadHighlightedPdf, downloadOriginalPdf } from '../../utils/downloadPdf'

export default function DownloadMenu({ activeTab, btnBase }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const hasHighlights = (activeTab?.highlights?.length ?? 0) > 0
  const hasAnnotations = (activeTab?.annotations?.length ?? 0) > 0
  const hasChanges = hasHighlights || hasAnnotations

  const handleDownload = async (downloadFn) => {
    if (!activeTab || isExporting) return

    try {
      setIsExporting(true)
      await downloadFn(activeTab)
      setMenuOpen(false)
    } catch (error) {
      console.error(error)
      window.alert('No se pudo descargar el PDF. Probá nuevamente.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen(open => !open)}
        disabled={!activeTab || isExporting}
        className={`${btnBase} w-8 h-8 ${menuOpen ? 'text-indigo-300 bg-indigo-500/10' : ''}`}
        title="Descargar PDF"
      >
        {isExporting ? (
          <span className="h-4 w-4 rounded-full border-2 border-indigo-400/30 border-t-indigo-300 animate-spin" />
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4.5 19.5h15" />
          </svg>
        )}
      </button>

      {menuOpen && activeTab && (
        <div className="absolute right-0 top-10 z-40 w-56 rounded-lg border border-white/10 bg-[#16161f] p-1.5 shadow-2xl shadow-black/40">
          <button
            type="button"
            onClick={() => handleDownload(downloadOriginalPdf)}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-slate-100"
          >
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25v-5.25z" />
            </svg>
            Descargar original
          </button>

          <button
            type="button"
            onClick={() => handleDownload(downloadHighlightedPdf)}
            disabled={!hasChanges}
            className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-300"
          >
            <svg className="h-4 w-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5h15M7.5 15.75l8.25-8.25 2.25 2.25-8.25 8.25H7.5v-2.25zM14.25 6l1.5-1.5a1.5 1.5 0 012.121 0l1.629 1.629a1.5 1.5 0 010 2.121L18 9.75" />
            </svg>
            Descargar con cambios
          </button>
        </div>
      )}
    </div>
  )
}
