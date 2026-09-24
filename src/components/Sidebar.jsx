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
  const {
    activeTab,
    setPageNumber,
    setActiveAnnotationId,
    deleteAnnotation,
    setAnnotationMode,
  } = usePDFContext()
  const scrollRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  const [sidebarTab, setSidebarTab] = useState('thumbnails') // 'thumbnails' | 'annotations'

  const {
    url,
    numPages = 0,
    pageNumber = 1,
    annotations = [],
    activeAnnotationId = null,
  } = activeTab ?? {}

  const sortedAnnotations = useMemo(() => {
    return [...annotations].sort((a, b) => {
      if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber
      return (a.y ?? 0) - (b.y ?? 0)
    })
  }, [annotations])

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
  }, [open, activeTab?.id, sidebarTab])

  useEffect(() => {
    if (sidebarTab !== 'thumbnails') return
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
  }, [pageNumber, numPages, sidebarTab])

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
      className={`shrink-0 flex flex-col border-r border-white/5 bg-[#0d0d14] transition-all duration-200 ${
        sidebarTab === 'annotations' ? 'w-56' : 'w-40'
      }`}
    >
      {/* Sidebar header tabs */}
      <div className="flex items-center p-2 gap-1 border-b border-white/5 bg-[#09090f]">
        <button
          type="button"
          onClick={() => setSidebarTab('thumbnails')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            sidebarTab === 'thumbnails'
              ? 'bg-white/10 text-slate-100 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title="Ver miniaturas de páginas"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
          </svg>
          <span>Páginas</span>
        </button>

        <button
          type="button"
          onClick={() => setSidebarTab('annotations')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            sidebarTab === 'annotations'
              ? 'bg-amber-500/20 text-amber-200 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title="Ver notas y anotaciones"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v5.518Z" />
          </svg>
          <span>Notas</span>
          {annotations.length > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500/40 px-1 text-[10px] font-bold text-amber-200">
              {annotations.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Tab Content */}
      {sidebarTab === 'thumbnails' ? (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto py-3 px-2"
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
        </div>
      ) : (
        <div
          className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2a3a transparent' }}
        >
          {sortedAnnotations.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-4 mt-8 text-slate-400">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-300">Sin notas aún</p>
              <p className="text-[11px] text-slate-500 mt-1 mb-4 leading-relaxed">
                Podés crear notas en páginas específicas haciendo clic en el PDF.
              </p>
              <button
                type="button"
                onClick={() => setAnnotationMode(true)}
                className="cursor-pointer rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/25 transition-colors"
              >
                Crear una nota
              </button>
            </div>
          ) : (
            sortedAnnotations.map((annotation) => {
              const isCurrentPage = annotation.pageNumber === pageNumber
              const isSelected = annotation.id === activeAnnotationId

              return (
                <div
                  key={annotation.id}
                  onClick={() => {
                    setPageNumber(annotation.pageNumber)
                    setActiveAnnotationId(annotation.id)
                  }}
                  className={`group relative flex flex-col gap-1.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500/60 bg-amber-500/10 shadow-md shadow-black/40'
                      : isCurrentPage
                        ? 'border-white/20 bg-white/8 hover:border-white/30'
                        : 'border-white/5 bg-white/3 hover:border-white/15 hover:bg-white/6'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: annotation.color || '#f59e0b' }}
                      />
                      <span className="text-[11px] font-semibold text-slate-300">
                        Pág. {annotation.pageNumber}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteAnnotation(annotation.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Eliminar nota"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-snug break-words">
                    {annotation.text ? (
                      annotation.text
                    ) : (
                      <span className="italic text-slate-500">Nota sin texto</span>
                    )}
                  </p>

                  {annotation.createdAt && (
                    <span className="text-[10px] text-slate-500">
                      {new Date(annotation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </aside>
  )
}
