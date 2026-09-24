import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'
import '../lib/pdfWorker'
import { usePDFContext } from '../hooks/usePDFContext'
import { escapeHtml, escapeRegex, calculateHighlightRects } from '../utils/pdfUtils'
import AnnotationMarker from './annotation/AnnotationMarker'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

export default function PDFViewer() {
  const {
    activeTab,
    setNumPages,
    addHighlight,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    setActiveAnnotationId,
    setAnnotationMode,
  } = usePDFContext()
  const pageRef = useRef(null)
  const [searchHighlightRects, setSearchHighlightRects] = useState([])

  const {
    url,
    pageNumber = 1,
    scale = 1.2,
    invertedColors = false,
    highlightMode = false,
    highlightColor = '#facc15',
    highlights = [],
    annotationMode = false,
    annotationColor = '#f59e0b',
    annotations = [],
    activeAnnotationId = null,
    searchQuery = '',
    searchResults = [],
    searchIndex = 0,
  } = activeTab ?? {}

  const activeSearchResult = searchResults[searchIndex]
  const activeSearchPageNumber = typeof activeSearchResult === 'number'
    ? activeSearchResult
    : activeSearchResult?.pageNumber
  const activeSearchMatchIndex = typeof activeSearchResult === 'number'
    ? 0
    : activeSearchResult?.pageMatchIndex
  const activeSearchItemIndex = typeof activeSearchResult === 'number'
    ? undefined
    : activeSearchResult?.itemIndex
  const activeSearchItemMatchIndex = typeof activeSearchResult === 'number'
    ? undefined
    : activeSearchResult?.itemMatchIndex

  const customTextRenderer = useCallback(({ str, itemIndex }) => {
    if (!searchQuery?.trim()) return str
    const regex = new RegExp(`(${escapeRegex(searchQuery)})`, 'gi')
    let itemMatchIndex = 0

    return str.replace(regex, match => {
      const isActiveMatch = pageNumber === activeSearchPageNumber
        && (
          itemIndex === activeSearchItemIndex
          ? itemMatchIndex === activeSearchItemMatchIndex
          : activeSearchItemIndex === undefined && itemMatchIndex === activeSearchMatchIndex
        )
      const className = isActiveMatch ? 'pdf-highlight pdf-highlight-current' : 'pdf-highlight'
      itemMatchIndex += 1

      return `<mark class="${className}">${escapeHtml(match)}</mark>`
    })
  }, [
    activeSearchItemIndex,
    activeSearchItemMatchIndex,
    activeSearchMatchIndex,
    activeSearchPageNumber,
    pageNumber,
    searchQuery,
  ])

  const pageHighlights = useMemo(() => {
    return highlights.filter(highlight => highlight.pageNumber === pageNumber)
  }, [highlights, pageNumber])

  const pageAnnotations = useMemo(() => {
    return annotations.filter(annotation => annotation.pageNumber === pageNumber)
  }, [annotations, pageNumber])

  const updateSearchHighlightRects = useCallback(() => {
    if (!pageRef.current || !searchQuery?.trim()) {
      setSearchHighlightRects([])
      return
    }

    requestAnimationFrame(() => {
      if (!pageRef.current) return

      const pageBox = pageRef.current.getBoundingClientRect()
      const marks = Array.from(pageRef.current.querySelectorAll('.pdf-highlight'))

      setSearchHighlightRects(marks.flatMap(mark => (
        Array.from(mark.getClientRects()).map(rect => ({
          left: ((rect.left - pageBox.left) / pageBox.width) * 100,
          top: ((rect.top - pageBox.top) / pageBox.height) * 100,
          width: (rect.width / pageBox.width) * 100,
          height: (rect.height / pageBox.height) * 100,
          active: mark.classList.contains('pdf-highlight-current'),
        }))
      )))
    })
  }, [searchQuery])

  useEffect(() => {
    updateSearchHighlightRects()
  }, [pageNumber, scale, searchIndex, searchQuery, updateSearchHighlightRects])

  const handleMouseUp = useCallback(() => {
    if (!highlightMode || !pageRef.current) return

    const selection = window.getSelection()
    const result = calculateHighlightRects(selection, pageRef.current)
    if (!result) return

    addHighlight({
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      pageNumber,
      color: highlightColor,
      text: result.text,
      rects: result.rects,
    })

    selection?.removeAllRanges()
  }, [addHighlight, highlightColor, highlightMode, pageNumber])

  const handlePageClick = useCallback((e) => {
    if (!annotationMode || !pageRef.current) return

    // Prevent creating a note when clicking inside an existing annotation marker or popover
    if (e.target.closest('[data-annotation-element="true"]')) return

    const selection = window.getSelection()
    if (selection && selection.toString().trim().length > 0) return

    const pageBox = pageRef.current.getBoundingClientRect()
    const clickX = e.clientX - pageBox.left
    const clickY = e.clientY - pageBox.top

    const x = Math.max(3, Math.min(97, (clickX / pageBox.width) * 100))
    const y = Math.max(3, Math.min(97, (clickY / pageBox.height) * 100))

    const newId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    addAnnotation({
      id: newId,
      pageNumber,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      text: '',
      color: annotationColor || '#f59e0b',
      createdAt: new Date().toISOString(),
    })
    setActiveAnnotationId(newId)
  }, [addAnnotation, annotationColor, annotationMode, pageNumber, setActiveAnnotationId])

  if (!activeTab) return null

  return (
    <div className="flex-1 overflow-auto flex flex-col items-center p-8 min-h-0">
      {annotationMode && (
        <div className="sticky top-0 z-30 mb-4 flex items-center justify-between gap-4 rounded-full border border-amber-500/30 bg-[#161622]/90 px-4 py-1.5 text-xs text-amber-200 backdrop-blur-md shadow-lg shadow-black/50">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Modo anotación activo: hacé clic en cualquier parte de la página para añadir una nota</span>
          </div>
          <button
            type="button"
            onClick={() => setAnnotationMode(false)}
            className="cursor-pointer rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/30 transition-colors"
          >
            Finalizar
          </button>
        </div>
      )}

      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={
          <div className="flex flex-col items-center gap-4 mt-20 text-slate-500">
            <div className="w-10 h-10 border-2 border-indigo-500/40 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-sm">Cargando PDF...</span>
          </div>
        }
        error={
          <div className="flex flex-col items-center gap-3 mt-20 text-red-400">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm">No se pudo cargar el PDF.</p>
          </div>
        }
      >
        <div
          ref={pageRef}
          onClick={handlePageClick}
          onMouseUp={handleMouseUp}
          className={`relative ${highlightMode ? 'pdf-highlight-active' : ''} ${annotationMode ? 'cursor-crosshair' : ''}`}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            customTextRenderer={searchQuery?.trim() ? customTextRenderer : undefined}
            onRenderTextLayerSuccess={updateSearchHighlightRects}
            className={`shadow-2xl shadow-black/50 rounded-sm overflow-hidden ${invertedColors ? 'pdf-page-inverted' : ''}`}
            loading={
              <div className="flex items-center justify-center" style={{ minHeight: 600 }}>
                <div className="w-8 h-8 border-2 border-indigo-500/40 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            }
          />
          <div className="pdf-highlight-layer">
            {searchHighlightRects.map((rect, index) => (
              <span
                key={`search-${index}`}
                className={`pdf-search-highlight ${rect.active ? 'pdf-search-highlight-current' : ''}`}
                style={{
                  left: `${rect.left}%`,
                  top: `${rect.top}%`,
                  width: `${rect.width}%`,
                  height: `${rect.height}%`,
                }}
              />
            ))}
            {pageHighlights.map(highlight => (
              highlight.rects.map((rect, index) => (
                <span
                  key={`${highlight.id}-${index}`}
                  className="pdf-user-highlight"
                  title={highlight.text}
                  style={{
                    left: `${rect.left}%`,
                    top: `${rect.top}%`,
                    width: `${rect.width}%`,
                    height: `${rect.height}%`,
                    backgroundColor: highlight.color,
                  }}
                />
              ))
            ))}
          </div>

          {/* Annotations Layer */}
          <div className="pdf-annotation-layer absolute inset-0 pointer-events-none z-20">
            {pageAnnotations.map(annotation => (
              <AnnotationMarker
                key={annotation.id}
                annotation={annotation}
                isOpen={activeAnnotationId === annotation.id}
                onOpen={(id) => setActiveAnnotationId(id)}
                onClose={() => setActiveAnnotationId(null)}
                onUpdate={(updates) => updateAnnotation(annotation.id, updates)}
                onDelete={(id) => deleteAnnotation(id)}
              />
            ))}
          </div>
        </div>
      </Document>
    </div>
  )
}
