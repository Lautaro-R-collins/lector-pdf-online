import { useRef, useEffect } from 'react'
import { Document, Page } from 'react-pdf'
import { usePDFContext } from '../context/PDFContext'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

export default function Sidebar({ open }) {
  const { activeTab, setPageNumber } = usePDFContext()
  const activeRef = useRef(null)

  const { url, numPages = 0, pageNumber = 1 } = activeTab ?? {}

  // Scroll active thumbnail into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [pageNumber])

  if (!open || !activeTab) return null

  return (
    <aside className="w-40 shrink-0 overflow-y-auto border-r border-white/5 bg-[#0d0d14] py-3 px-2 flex flex-col gap-2"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a3a transparent' }}>
      {Array.from({ length: numPages }, (_, i) => {
        const pg = i + 1
        const isActive = pg === pageNumber
        return (
          <button
            key={pg}
            ref={isActive ? activeRef : null}
            onClick={() => setPageNumber(pg)}
            className={`
              group relative rounded-lg overflow-hidden border-2 transition-all duration-150 shrink-0
              ${isActive ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-transparent hover:border-white/20'}
            `}
            title={`Página ${pg}`}
          >
            <Document file={url} loading={null}>
              <Page
                pageNumber={pg}
                width={133}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <div className="w-33 h-46.5 bg-white/5 animate-pulse rounded" />
                }
              />
            </Document>
            <div className={`absolute bottom-0 inset-x-0 text-center py-0.5 text-[10px] font-medium
              ${isActive ? 'bg-indigo-500 text-white' : 'bg-black/60 text-slate-400 opacity-0 group-hover:opacity-100'}`}>
              {pg}
            </div>
          </button>
        )
      })}
    </aside>
  )
}
