import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { PDFContext } from './PDFContextObject'

export function PDFProvider({ children }) {
  const [tabs, setTabs] = useState([])
  const tabsRef = useRef([])
  const [activeTabId, setActiveTabId] = useState(null)
  const [darkMode, setDarkMode] = useState(true)

  const activeTab = useMemo(
    () => tabs.find(t => t.id === activeTabId) ?? null,
    [tabs, activeTabId]
  )

  const addTab = useCallback((url, name) => {
    const id = `tab-${crypto.randomUUID?.() ?? Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    setTabs(prev => [...prev, {
      id,
      url,
      name,
      numPages: 0,
      pageNumber: 1,
      scale: 1.2,
      invertedColors: false,
      highlightMode: false,
      highlightColor: '#facc15',
      highlights: [],
      searchQuery: '',
      searchResults: [],
      searchIndex: 0,
    }])
    setActiveTabId(id)
    return id
  }, [])

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
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
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
    (highlightMode) => activeTabId && updateTab(activeTabId, { highlightMode }),
    [activeTabId, updateTab]
  )

  const setHighlightColor = useCallback(
    (highlightColor) => activeTabId && updateTab(activeTabId, { highlightColor }),
    [activeTabId, updateTab]
  )

  const addHighlight = useCallback((highlight) => {
    if (!activeTabId) return
    setTabs(prev => prev.map(t => (
      t.id === activeTabId ? { ...t, highlights: [...(t.highlights ?? []), highlight] } : t
    )))
  }, [activeTabId])

  const clearHighlights = useCallback(() => {
    if (!activeTabId) return
    updateTab(activeTabId, { highlights: [] })
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

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev)
  }, [])

  const contextValue = useMemo(() => ({
    tabs,
    activeTabId,
    activeTab,
    addTab,
    closeTab,
    setActiveTabId,
    darkMode,
    setDarkMode,
    toggleDarkMode,
    setPageNumber,
    setScale,
    setInvertedColors,
    setHighlightMode,
    setHighlightColor,
    addHighlight,
    clearHighlights,
    setNumPages,
    setSearch,
    setSearchResults,
    setSearchIndex,
  }), [
    tabs,
    activeTabId,
    activeTab,
    addTab,
    closeTab,
    setActiveTabId,
    darkMode,
    toggleDarkMode,
    setPageNumber,
    setScale,
    setInvertedColors,
    setHighlightMode,
    setHighlightColor,
    addHighlight,
    clearHighlights,
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
