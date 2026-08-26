import { useCallback } from 'react'
import { pdfjs } from 'react-pdf'
import { usePDFContext } from '../context/PDFContext'

export function useSearch() {
  const { activeTab, setSearchResults, setSearchIndex, setPageNumber } = usePDFContext()

  const search = useCallback(async (query) => {
    if (!activeTab?.url || !query.trim()) {
      setSearchResults([])
      return
    }
    try {
      const pdf = await pdfjs.getDocument(activeTab.url).promise
      const results = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const text = content.items.map(item => item.str).join(' ')
        if (text.toLowerCase().includes(query.toLowerCase())) results.push(i)
      }
      setSearchResults(results)
      if (results.length > 0) {
        setPageNumber(results[0])
        setSearchIndex(0)
      }
    } catch (err) {
      console.error('Search error:', err)
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
