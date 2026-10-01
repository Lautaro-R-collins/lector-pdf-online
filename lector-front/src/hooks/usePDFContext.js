import { useContext } from 'react'
import { PDFContext } from '../context/PDFContextObject'

export function usePDFContext() {
  const ctx = useContext(PDFContext)
  if (!ctx) {
    throw new Error('usePDFContext must be used within PDFProvider')
  }
  return ctx
}
