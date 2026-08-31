import { pdfjs } from 'react-pdf'

// Configure PDF.js worker using ESM URL resolution supported by Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export { pdfjs }
