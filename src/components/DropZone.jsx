import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { usePDF } from '../hooks/usePDF'

export default function DropZone() {
  const { loadFile } = usePDF()

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach(loadFile)
  }, [loadFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  })

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div
        {...getRootProps()}
        className={`
          relative w-full max-w-lg p-16 rounded-3xl border-2 border-dashed cursor-pointer
          transition-all duration-300 group text-center
          ${isDragActive
            ? 'border-indigo-500 bg-indigo-500/10 scale-105'
            : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5'
          }
        `}
      >
        <input {...getInputProps()} />

        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-3xl transition-opacity duration-300 ${isDragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
          style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
        />

        {/* PDF Icon */}
        <div className={`relative mx-auto mb-6 w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragActive ? 'bg-indigo-500/30 scale-110' : 'bg-white/5 group-hover:bg-indigo-500/20'}`}>
          <svg className={`w-10 h-10 transition-colors duration-300 ${isDragActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>

        <h2 className="relative text-xl font-semibold text-slate-200 mb-2">
          {isDragActive ? '¡Soltá aquí tu PDF!' : 'Abrí un PDF para empezar'}
        </h2>
        <p className="relative text-sm text-slate-500 mb-8">
          Arrastrá y soltá uno o más archivos PDF, o hacé clic para seleccionarlos
        </p>

        <div className={`relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200
          ${isDragActive ? 'bg-indigo-500 text-white' : 'bg-indigo-600/80 text-white hover:bg-indigo-500'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Seleccionar archivo
        </div>

        <p className="relative mt-4 text-xs text-slate-600">Solo archivos .pdf</p>
      </div>

    </div>
  )
}
