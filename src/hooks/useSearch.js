import { useCallback } from 'react'
import { pdfjs } from '../lib/pdfWorker'
import { usePDFContext } from './usePDFContext'

export function useSearch() {
  const { activeTab, setSearchResults, setSearchIndex, setPageNumber } = usePDFContext()

  const search = useCallback(async (query) => {
    if (!activeTab?.url || !query.trim()) {
      setSearchResults([])
      return
    }

    let pdfDoc = null
    try {
      const loadingTask = pdfjs.getDocument(activeTab.url)
      pdfDoc = await loadingTask.promise
      const results = []

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const content = await page.getTextContent()
        const text = content.items.map(item => item.str).join(' ')

        if (text.toLowerCase().includes(query.toLowerCase())) {
          results.push(i)
        }
      }

      setSearchResults(results)
      if (results.length > 0) {
        setPageNumber(results[0])
        setSearchIndex(0)
      }
    } catch (err) {
      console.error('Error al realizar búsqueda en el PDF:', err)
      setSearchResults([])
    } finally {
      if (pdfDoc) {
        pdfDoc.destroy().catch(() => {})
      }
    }
  }, [activeTab, setSearchResults, setPageNumber, setSearchIndex])

  const goToResult = useCallback((direction) => {
    if (!activeTab?.searchResults?.length) return
    const total = activeTab.searchResults.length
    const next = (activeTab.searchIndex + direction + total) % total
    setSearchIndex(next)
    setPageNumber(activeTab.searchResults[next])
  }, [activeTab, setSearchIndex, setPageNumber])

  return { search, goToResult }
}
