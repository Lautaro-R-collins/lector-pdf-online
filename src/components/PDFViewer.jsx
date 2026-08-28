import { useCallback, useMemo, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { usePDFContext } from '../context/PDFContext'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export default function PDFViewer() {
  const { activeTab, setNumPages, addHighlight } = usePDFContext()
  const pageRef = useRef(null)

  const {
    url,
    pageNumber = 1,
    scale = 1.2,
    invertedColors = false,
    highlightMode = false,
    highlightColor = '#facc15',
    highlights = [],
    searchQuery = '',
  } = activeTab ?? {}

  const customTextRenderer = useCallback(({ str }) => {
    if (!searchQuery?.trim()) return str
    const regex = new RegExp(`(${escapeRegex(searchQuery)})`, 'gi')
    return str.replace(regex, '<mark class="pdf-highlight">$1</mark>')
  }, [searchQuery])

  const pageHighlights = useMemo(() => {
    return highlights.filter(highlight => highlight.pageNumber === pageNumber)
  }, [highlights, pageNumber])

  const handleMouseUp = useCallback(() => {
    if (!highlightMode || !pageRef.current) return

    const selection = window.getSelection()
    const selectedText = selection?.toString().trim()
    if (!selection || selection.rangeCount === 0 || !selectedText) return

    const pageBox = pageRef.current.getBoundingClientRect()
    const range = selection.getRangeAt(0)
    const rects = Array.from(range.getClientRects())
      .map(rect => {
        const left = Math.max(rect.left, pageBox.left)
        const top = Math.max(rect.top, pageBox.top)
        const right = Math.min(rect.right, pageBox.right)
        const bottom = Math.min(rect.bottom, pageBox.bottom)

        if (right <= left || bottom <= top) return null

        return {
          left: ((left - pageBox.left) / pageBox.width) * 100,
          top: ((top - pageBox.top) / pageBox.height) * 100,
          width: ((right - left) / pageBox.width) * 100,
          height: ((bottom - top) / pageBox.height) * 100,
        }
      })
      .filter(Boolean)

    if (rects.length === 0) return

    addHighlight({
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      pageNumber,
      color: highlightColor,
      text: selectedText,
      rects,
    })

    selection.removeAllRanges()
  }, [addHighlight, highlightColor, highlightMode, pageNumber])

  if (!activeTab) return null

  return (
    <div className="flex-1 overflow-auto flex justify-center items-start p-8 min-h-0">
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
          onMouseUp={handleMouseUp}
          className={`relative ${highlightMode ? 'pdf-highlight-active' : ''}`}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            customTextRenderer={searchQuery?.trim() ? customTextRenderer : undefined}
            className={`shadow-2xl shadow-black/50 rounded-sm overflow-hidden ${invertedColors ? 'pdf-page-inverted' : ''}`}
            loading={
              <div className="flex items-center justify-center" style={{ minHeight: 600 }}>
                <div className="w-8 h-8 border-2 border-indigo-500/40 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            }
          />
          <div className="pdf-highlight-layer">
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
        </div>
      </Document>
    </div>
  )
}
