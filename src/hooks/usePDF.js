import { useCallback } from 'react'
import { usePDFContext } from './usePDFContext'

export function usePDF() {
  const { addTab } = usePDFContext()

  const loadFile = useCallback((file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      console.warn('El archivo seleccionado no es un PDF válido:', file.name)
      return
    }
    const url = URL.createObjectURL(file)
    addTab(url, file.name)
  }, [addTab])

  const openFilePicker = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/pdf'
    input.multiple = true
    input.onchange = (e) => {
      if (e.target.files) {
        Array.from(e.target.files).forEach(loadFile)
      }
    }
    input.click()
  }, [loadFile])

  return { loadFile, openFilePicker }
}
