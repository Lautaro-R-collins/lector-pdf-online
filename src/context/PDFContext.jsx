import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { PDFContext } from './PDFContextObject'
import { updateBook } from '../services/libraryStorage'

export function PDFProvider({ children }) {
  const [tabs, setTabs] = useState([])
  const tabsRef = useRef([])
  const [activeTabId, setActiveTabId] = useState(null)

  const activeTab = useMemo(
    () => tabs.find(t => t.id === activeTabId) ?? null,
    [tabs, activeTabId]
  )

  const addTab = useCallback((url, name, extraProps = {}) => {
    const id = extraProps.bookId ? `book-tab-${extraProps.bookId}` : `tab-${crypto.randomUUID?.() ?? Date.now()}`

    setTabs(prev => {
      const existing = prev.find(t => t.id === id)
      if (existing) {
        return prev
      }
      return [...prev, {
        id,
        url,
        name,
        numPages: extraProps.numPages || 0,
        pageNumber: extraProps.pageNumber || 1,
        scale: 1.2,
        invertedColors: false,
        highlightMode: false,
        highlightColor: '#facc15',
        highlights: extraProps.highlights || [],
        annotationMode: false,
        annotationColor: '#f59e0b',
        annotations: extraProps.annotations || [],
        activeAnnotationId: null,
        searchQuery: '',
        searchResults: [],
        searchIndex: 0,
        bookId: extraProps.bookId || null,
      }]
    })

    setActiveTabId(id)
    return id
  }, [])

  const openBookFromLibrary = useCallback((book) => {
    if (!book || !book.pdfBlob) return
    const url = URL.createObjectURL(book.pdfBlob)
    addTab(url, book.title, {
      bookId: book.id,
      numPages: book.numPages || 0,
      pageNumber: book.currentPage || 1,
      highlights: book.highlights || [],
      annotations: book.annotations || [],
    })
  }, [addTab])

  const closeTab = useCallback((id) => {
    setTabs(prev => {
      const tabToClose = prev.find(t => t.id === id)
      if (tabToClose?.url) URL.revokeObjectURL(tabToClose.url)
      const next = prev.filter(t => t.id !== id)
      setActiveTabId(cur => {
        if (cur !== id) return cur
        const idx = prev.findIndex(t => t.id === id)
        const remaining = prev.filter(t => t.id !== id)
        return remaining[Math.max(0, idx - 1)]?.id ?? remaining[0]?.id ?? null
      })
      return next
    })
  }, [])

  useEffect(() => {
    tabsRef.current = tabs
  }, [tabs])

  useEffect(() => {
    return () => {
      tabsRef.current.forEach(tab => {
        if (tab.url) URL.revokeObjectURL(tab.url)
      })
    }
  }, [])

  const updateTab = useCallback((id, updates) => {
    setTabs(prev => {
      const target = prev.find(t => t.id === id)
      if (target?.bookId) {
        const bookUpdates = {}
        if (updates.pageNumber !== undefined) bookUpdates.currentPage = updates.pageNumber
        if (updates.numPages !== undefined) bookUpdates.numPages = updates.numPages
        if (updates.highlights !== undefined) bookUpdates.highlights = updates.highlights
        if (updates.annotations !== undefined) bookUpdates.annotations = updates.annotations

        if (Object.keys(bookUpdates).length > 0) {
          updateBook(target.bookId, bookUpdates).catch(console.error)
        }
      }
      return prev.map(t => t.id === id ? { ...t, ...updates } : t)
    })
  }, [])

  const setPageNumber = useCallback(
    (n) => activeTabId && updateTab(activeTabId, { pageNumber: n }),
    [activeTabId, updateTab]
  )

  const setScale = useCallback(
    (s) => activeTabId && updateTab(activeTabId, { scale: s }),
    [activeTabId, updateTab]
  )

  const setInvertedColors = useCallback(
    (invertedColors) => activeTabId && updateTab(activeTabId, { invertedColors }),
    [activeTabId, updateTab]
  )

  const setHighlightMode = useCallback(
    (highlightMode) => activeTabId && updateTab(activeTabId, {
      highlightMode,
      ...(highlightMode ? { annotationMode: false } : {}),
    }),
    [activeTabId, updateTab]
  )

  const setHighlightColor = useCallback(
    (highlightColor) => activeTabId && updateTab(activeTabId, { highlightColor }),
    [activeTabId, updateTab]
  )

  const setAnnotationMode = useCallback(
    (annotationMode) => activeTabId && updateTab(activeTabId, {
      annotationMode,
      ...(annotationMode ? { highlightMode: false } : {}),
    }),
    [activeTabId, updateTab]
  )

  const setAnnotationColor = useCallback(
    (annotationColor) => activeTabId && updateTab(activeTabId, { annotationColor }),
    [activeTabId, updateTab]
  )

  const setActiveAnnotationId = useCallback(
    (activeAnnotationId) => activeTabId && updateTab(activeTabId, { activeAnnotationId }),
    [activeTabId, updateTab]
  )

  const addHighlight = useCallback((highlight) => {
    if (!activeTabId) return
    setTabs(prev => prev.map(t => {
      if (t.id !== activeTabId) return t
      const nextHighlights = [...(t.highlights ?? []), highlight]
      if (t.bookId) {
        updateBook(t.bookId, { highlights: nextHighlights }).catch(console.error)
      }
      return { ...t, highlights: nextHighlights }
    }))
  }, [activeTabId])

  const clearHighlights = useCallback(() => {
    if (!activeTabId) return
    updateTab(activeTabId, { highlights: [] })
  }, [activeTabId, updateTab])

  const addAnnotation = useCallback((annotation) => {
    if (!activeTabId) return
    setTabs(prev => prev.map(t => {
      if (t.id !== activeTabId) return t
      const nextAnnotations = [...(t.annotations ?? []), annotation]
      if (t.bookId) {
        updateBook(t.bookId, { annotations: nextAnnotations }).catch(console.error)
      }
      return { ...t, annotations: nextAnnotations }
    }))
  }, [activeTabId])

  const updateAnnotation = useCallback((annotationId, updates) => {
    if (!activeTabId) return
    setTabs(prev => prev.map(t => {
      if (t.id !== activeTabId) return t
      const nextAnnotations = (t.annotations ?? []).map(a =>
        a.id === annotationId ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      )
      if (t.bookId) {
        updateBook(t.bookId, { annotations: nextAnnotations }).catch(console.error)
      }
      return { ...t, annotations: nextAnnotations }
    }))
  }, [activeTabId])

  const deleteAnnotation = useCallback((annotationId) => {
    if (!activeTabId) return
    setTabs(prev => prev.map(t => {
      if (t.id !== activeTabId) return t
      const nextAnnotations = (t.annotations ?? []).filter(a => a.id !== annotationId)
      if (t.bookId) {
        updateBook(t.bookId, { annotations: nextAnnotations }).catch(console.error)
      }
      return { ...t, annotations: nextAnnotations }
    }))
  }, [activeTabId])

  const clearAnnotations = useCallback(() => {
    if (!activeTabId) return
    updateTab(activeTabId, { annotations: [] })
  }, [activeTabId, updateTab])

  const setNumPages = useCallback(
    (n) => activeTabId && updateTab(activeTabId, { numPages: n }),
    [activeTabId, updateTab]
  )

  const setSearch = useCallback(
    (q) => activeTabId && updateTab(activeTabId, { searchQuery: q, searchResults: [], searchIndex: 0 }),
    [activeTabId, updateTab]
  )

  const setSearchResults = useCallback(
    (r) => activeTabId && updateTab(activeTabId, { searchResults: r }),
    [activeTabId, updateTab]
  )

  const setSearchIndex = useCallback(
    (i) => activeTabId && updateTab(activeTabId, { searchIndex: i }),
    [activeTabId, updateTab]
  )

  const contextValue = useMemo(() => ({
    tabs,
    activeTabId,
    activeTab,
    addTab,
    openBookFromLibrary,
    closeTab,
    setActiveTabId,
    setPageNumber,
    setScale,
    setInvertedColors,
    setHighlightMode,
    setHighlightColor,
    setAnnotationMode,
    setAnnotationColor,
    setActiveAnnotationId,
    addHighlight,
    clearHighlights,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    clearAnnotations,
    setNumPages,
    setSearch,
    setSearchResults,
    setSearchIndex,
  }), [
    tabs,
    activeTabId,
    activeTab,
    addTab,
    openBookFromLibrary,
    closeTab,
    setActiveTabId,
    setPageNumber,
    setScale,
    setInvertedColors,
    setHighlightMode,
    setHighlightColor,
    setAnnotationMode,
    setAnnotationColor,
    setActiveAnnotationId,
    addHighlight,
    clearHighlights,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    clearAnnotations,
    setNumPages,
    setSearch,
    setSearchResults,
    setSearchIndex,
  ])

  return (
    <PDFContext.Provider value={contextValue}>
      {children}
    </PDFContext.Provider>
  )
}

