function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function normalizePdfFileName(fileName, suffix = '') {
  const cleanName = fileName?.trim() || 'documento.pdf'
  return cleanName.replace(/\.pdf$/i, `${suffix}.pdf`)
}

function hexToRgb(hex, rgb) {
  const normalized = hex.replace('#', '')
  const value = Number.parseInt(normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized, 16)

  return rgb(
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255
  )
}

async function getPdfBytes(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error('No se pudo leer el PDF')
  return response.arrayBuffer()
}

export async function downloadOriginalPdf(tab) {
  const pdfBytes = await getPdfBytes(tab.url)
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  downloadBlob(blob, normalizePdfFileName(tab.name))
}

export async function downloadHighlightedPdf(tab) {
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
  const pdfBytes = await getPdfBytes(tab.url)
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pageCount = pdfDoc.getPageCount()

  let font = null
  const annotations = tab.annotations ?? []
  if (annotations.some(a => a.text?.trim())) {
    try {
      font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    } catch (e) {
      console.warn('Could not embed Helvetica font for PDF annotations', e)
    }
  }

  for (const highlight of tab.highlights ?? []) {
    if (highlight.pageNumber < 1 || highlight.pageNumber > pageCount) continue
    const page = pdfDoc.getPage(highlight.pageNumber - 1)

    const { width: pageWidth, height: pageHeight } = page.getSize()
    const color = hexToRgb(highlight.color || '#facc15', rgb)

    for (const rect of highlight.rects ?? []) {
      const width = (rect.width / 100) * pageWidth
      const height = (rect.height / 100) * pageHeight
      const x = (rect.left / 100) * pageWidth
      const y = pageHeight - ((rect.top / 100) * pageHeight) - height

      page.drawRectangle({
        x,
        y,
        width,
        height,
        color,
        opacity: 0.35,
        borderOpacity: 0,
      })
    }
  }

  for (const annotation of annotations) {
    if (annotation.pageNumber < 1 || annotation.pageNumber > pageCount) continue
    const page = pdfDoc.getPage(annotation.pageNumber - 1)
    const { width: pageWidth, height: pageHeight } = page.getSize()
    const color = hexToRgb(annotation.color || '#f59e0b', rgb)

    const x = (annotation.x / 100) * pageWidth
    const y = pageHeight - ((annotation.y / 100) * pageHeight)

    // Draw pin circle
    page.drawCircle({
      x,
      y,
      size: 7,
      color,
      opacity: 0.9,
    })

    if (annotation.text?.trim() && font) {
      // Clean non-standard chars for standard Helvetica font safe rendering
      const cleanText = annotation.text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\x20-\x7E]/g, ' ')
        .trim()

      if (cleanText) {
        const textSnippet = cleanText.length > 45 ? `${cleanText.slice(0, 42)}...` : cleanText
        const textWidth = font.widthOfTextAtSize(textSnippet, 7)
        const boxX = Math.min(x + 10, Math.max(10, pageWidth - textWidth - 14))

        page.drawRectangle({
          x: boxX,
          y: y - 5,
          width: textWidth + 8,
          height: 12,
          color: rgb(0.1, 0.1, 0.15),
          opacity: 0.85,
        })

        page.drawText(textSnippet, {
          x: boxX + 4,
          y: y - 2,
          size: 7,
          font,
          color: rgb(1, 1, 1),
        })
      }
    }
  }

  const modifiedBytes = await pdfDoc.save()
  const blob = new Blob([modifiedBytes], { type: 'application/pdf' })
  downloadBlob(blob, normalizePdfFileName(tab.name, '-anotado'))
}
