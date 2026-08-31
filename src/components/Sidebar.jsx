import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'
import '../lib/pdfWorker'
import { usePDFContext } from '../hooks/usePDFContext'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

const THUMBNAIL_WIDTH = 124
const THUMBNAIL_ROW_HEIGHT = 190
const OVERSCAN = 4

export default function Sidebar({ open }) {
  const { activeTab, setPageNumber } = usePDFContext()
  const scrollRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  const { url, numPages = 0, pageNumber = 1 } = activeTab ?? {}

  const handleScroll = useCallback((event) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return undefined

    const updateHeight = () => setViewportHeight(element.clientHeight)
    updateHeight()

    if (!window.ResizeObserver) {
      window.addEventListener('resize', updateHeight)
      return () => window.removeEventListener('resize', updateHeight)
    }

    const observer = new ResizeObserver(updateHeight)
    observer.observe(element)
    return () => observer.disconnect()
  }, [open, activeTab?.id])

  useEffect(() => {
    const element = scrollRef.current
    if (!element || !numPages) return

    const pageTop = (pageNumber - 1) * THUMBNAIL_ROW_HEIGHT
    const pageBottom = pageTop + THUMBNAIL_ROW_HEIGHT
    const visibleTop = element.scrollTop
    const visibleBottom = visibleTop + element.clientHeight

    if (pageTop < visibleTop || pageBottom > visibleBottom) {
      element.scrollTo({
        top: Math.max(0, pageTop - THUMBNAIL_ROW_HEIGHT),
        behavior: 'smooth',
      })
    }
  }, [pageNumber, numPages])

  const visibleRange = useMemo(() => {
    if (!numPages || !viewportHeight) return { start: 0, end: Math.min(numPages, 8) }

    const start = Math.max(0, Math.floor(scrollTop / THUMBNAIL_ROW_HEIGHT) - OVERSCAN)
    const end = Math.min(
      numPages,
      Math.ceil((scrollTop + viewportHeight) / THUMBNAIL_ROW_HEIGHT) + OVERSCAN,
    )

    return { start, end }
  }, [numPages, scrollTop, viewportHeight])

  const visiblePages = useMemo(() => {
    return Array.from(
      { length: Math.max(0, visibleRange.end - visibleRange.start) },
      (_, i) => visibleRange.start + i + 1,
    )
  }, [visibleRange])

  if (!open || !activeTab) return null

  return (
    <aside
      ref={scrollRef}
      onScroll={handleScroll}
      className="w-40 shrink-0 overflow-y-auto border-r border-white/5 bg-[#0d0d14] py-3 px-2"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a3a transparent' }}
    >
      <Document file={url} loading={null}>
        <div style={{ height: visibleRange.start * THUMBNAIL_ROW_HEIGHT }} />
        <div className="flex flex-col gap-2">
          {visiblePages.map((pg) => {
            const isActive = pg === pageNumber

            return (
              <button
                key={pg}
                type="button"
                onClick={() => setPageNumber(pg)}
                className={`
                  group relative flex items-center justify-center rounded-lg overflow-hidden border-2 transition-all duration-150 shrink-0 bg-white/5
                  ${isActive ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-transparent hover:border-white/20'}
                `}
                style={{ height: THUMBNAIL_ROW_HEIGHT - 8 }}
                title={`Página ${pg}`}
              >
                <Page
                  pageNumber={pg}
                  width={THUMBNAIL_WIDTH}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={
                    <div className="w-31 h-44 bg-white/5 animate-pulse rounded" />
                  }
                />
                <div className={`absolute bottom-0 inset-x-0 text-center py-0.5 text-[10px] font-medium
                  ${isActive ? 'bg-indigo-500 text-white' : 'bg-black/60 text-slate-400 opacity-0 group-hover:opacity-100'}`}>
                  {pg}
                </div>
              </button>
            )
          })}
        </div>
        <div style={{ height: (numPages - visibleRange.end) * THUMBNAIL_ROW_HEIGHT }} />
      </Document>
    </aside>
  )
}
