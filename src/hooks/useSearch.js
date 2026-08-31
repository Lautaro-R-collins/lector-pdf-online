import { useCallback } from 'react'
import { pdfjs } from '../lib/pdfWorker'
import { usePDFContext } from './usePDFContext'
import { escapeRegex } from '../utils/pdfUtils'

export function useSearch() {
  const { activeTab, setSearch, setSearchResults, setSearchIndex, setPageNumber } = usePDFContext()

  const search = useCallback(async (query) => {
    if (!activeTab?.url || !query.trim()) {
      setSearch('')
      setSearchResults([])
      return
    }

    setSearch(query)

    let pdfDoc = null
    try {
      const loadingTask = pdfjs.getDocument(activeTab.url)
      pdfDoc = await loadingTask.promise
      const results = []
      const regex = new RegExp(escapeRegex(query), 'gi')

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const content = await page.getTextContent()
        let pageMatchIndex = 0

        content.items.forEach((item, itemIndex) => {
          const text = item.str ?? ''
          const matches = text.match(regex) ?? []

          matches.forEach((_, itemMatchIndex) => {
            results.push({
              pageNumber: i,
              pageMatchIndex,
              itemIndex,
              itemMatchIndex,
            })
            pageMatchIndex += 1
          })
        })
      }

      setSearchResults(results)
      if (results.length > 0) {
        setPageNumber(results[0].pageNumber)
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
  }, [activeTab, setSearch, setSearchResults, setPageNumber, setSearchIndex])

  const goToResult = useCallback((direction) => {
    if (!activeTab?.searchResults?.length) return
    const total = activeTab.searchResults.length
    const next = (activeTab.searchIndex + direction + total) % total
    const nextResult = activeTab.searchResults[next]
    setSearchIndex(next)
    setPageNumber(typeof nextResult === 'number' ? nextResult : nextResult.pageNumber)
  }, [activeTab, setSearchIndex, setPageNumber])

  return { search, goToResult }
}
