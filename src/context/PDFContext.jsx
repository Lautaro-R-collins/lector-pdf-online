import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const PDFContext = createContext(null)
let _id = 0

export function PDFProvider({ children }) {
  const [tabs, setTabs] = useState([])
  const tabsRef = useRef([])
  const [activeTabId, setActiveTabId] = useState(null)
  const [darkMode, setDarkMode] = useState(true)

  const activeTab = tabs.find(t => t.id === activeTabId) ?? null

  const addTab = useCallback((url, name) => {
    const id = `tab-${++_id}`
    setTabs(prev => [...prev, { id, url, name, numPages: 0, pageNumber: 1, scale: 1.2, invertedColors: false, searchQuery: '', searchResults: [], searchIndex: 0 }])
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

  const setPageNumber  = useCallback((n) => activeTabId && updateTab(activeTabId, { pageNumber: n }), [activeTabId, updateTab])
  const setScale       = useCallback((s) => activeTabId && updateTab(activeTabId, { scale: s }), [activeTabId, updateTab])
  const setInvertedColors = useCallback((invertedColors) => activeTabId && updateTab(activeTabId, { invertedColors }), [activeTabId, updateTab])
  const setNumPages    = useCallback((n) => activeTabId && updateTab(activeTabId, { numPages: n }), [activeTabId, updateTab])
  const setSearch      = useCallback((q) => activeTabId && updateTab(activeTabId, { searchQuery: q, searchResults: [], searchIndex: 0 }), [activeTabId, updateTab])
  const setSearchResults = useCallback((r) => activeTabId && updateTab(activeTabId, { searchResults: r }), [activeTabId, updateTab])
  const setSearchIndex   = useCallback((i) => activeTabId && updateTab(activeTabId, { searchIndex: i }), [activeTabId, updateTab])

  return (
    <PDFContext.Provider value={{
      tabs, activeTabId, activeTab,
      addTab, closeTab, setActiveTabId,
      darkMode, setDarkMode,
      setPageNumber, setScale, setInvertedColors, setNumPages,
      setSearch, setSearchResults, setSearchIndex,
    }}>
      {children}
    </PDFContext.Provider>
  )
}

export const usePDFContext = () => {
  const ctx = useContext(PDFContext)
  if (!ctx) throw new Error('usePDFContext must be used within PDFProvider')
  return ctx
}
