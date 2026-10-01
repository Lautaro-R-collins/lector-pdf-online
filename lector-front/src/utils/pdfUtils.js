/**
 * Escapes regex special characters in a string for safe search matching.
 */
export function escapeRegex(str) {
  if (!str) return ''
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Escapes HTML-sensitive characters before inserting PDF text into markup.
 */
export function escapeHtml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Calculates percentage-based bounding rectangles relative to a PDF page element.
 */
export function calculateHighlightRects(selection, pageElement) {
  if (!selection || selection.rangeCount === 0 || !pageElement) return null

  const selectedText = selection.toString().trim()
  if (!selectedText) return null

  const pageBox = pageElement.getBoundingClientRect()
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

  if (rects.length === 0) return null

  return {
    text: selectedText,
    rects,
  }
}

/**
 * Clamps a numerical value within min and max boundaries.
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
