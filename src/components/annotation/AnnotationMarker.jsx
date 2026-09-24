import { useCallback, useEffect, useRef, useState } from 'react'

const ANNOTATION_COLORS = [
  '#f59e0b',
  '#10b981',
  '#0ea5e9',
  '#a855f7',
  '#f43f5e',
]

export default function AnnotationMarker({
  annotation,
  isOpen = false,
  onOpen,
  onClose,
  onUpdate,
  onDelete,
}) {
  const [prevAnnotationText, setPrevAnnotationText] = useState(annotation.text || '')
  const [text, setText] = useState(annotation.text || '')
  const [isEditing, setIsEditing] = useState(() => !annotation.text)
  const cardRef = useRef(null)
  const textareaRef = useRef(null)

  // Adjust local state if prop text changes externally
  if (annotation.text !== prevAnnotationText) {
    setPrevAnnotationText(annotation.text || '')
    setText(annotation.text || '')
  }

  const handleSave = useCallback(() => {
    const trimmed = text.trim()
    if (trimmed !== annotation.text) {
      onUpdate?.({ text: trimmed })
    }
    setIsEditing(false)
  }, [text, annotation.text, onUpdate])

  useEffect(() => {
    if (!isOpen) return undefined

    const timer = setTimeout(() => {
      textareaRef.current?.focus()
    }, 50)

    const handleOutsideClick = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        handleSave()
        onClose?.()
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSave()
        onClose?.()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleSave, onClose])

  const handleDelete = () => {
    onDelete?.(annotation.id)
  }

  const handleColorChange = (color) => {
    onUpdate?.({ color })
  }

  // Determine card positioning relative to pin so it stays within viewport
  const isRightHalf = annotation.x > 60
  const isBottomHalf = annotation.y > 65

  const timeString = annotation.createdAt
    ? new Date(annotation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div
      data-annotation-element="true"
      className="absolute z-20 pointer-events-auto"
      style={{
        left: `${annotation.x}%`,
        top: `${annotation.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Pin / Marker button */}
      <button
        type="button"
        onClick={() => {
          if (isOpen) {
            handleSave()
            onClose?.()
          } else {
            if (!annotation.text) {
              setIsEditing(true)
            }
            onOpen?.(annotation.id)
          }
        }}
        className={`group relative flex h-7 w-7 items-center justify-center rounded-full shadow-lg transition-all duration-150 cursor-pointer ${
          isOpen ? 'scale-125 ring-4 ring-white/30' : 'hover:scale-115'
        }`}
        style={{
          backgroundColor: annotation.color || '#f59e0b',
          boxShadow: `0 4px 14px ${annotation.color || '#f59e0b'}66`,
        }}
        title={`Nota: ${annotation.text || '(vacía)'}`}
      >
        <svg
          className="h-3.5 w-3.5 text-slate-950 transition-transform group-hover:rotate-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v5.518Z"
          />
        </svg>

        {/* Small pointer triangle on pin */}
        <span
          className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45"
          style={{ backgroundColor: annotation.color || '#f59e0b' }}
        />
      </button>

      {/* Popover / Sticky note card */}
      {isOpen && (
        <div
          ref={cardRef}
          className={`absolute z-50 w-72 rounded-xl border border-white/10 bg-[#161622] p-3.5 text-slate-200 shadow-2xl shadow-black/80 backdrop-blur-md animate-in fade-in duration-150 ${
            isRightHalf ? 'right-0' : 'left-0'
          } ${isBottomHalf ? 'bottom-9' : 'top-9'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full ring-2 ring-white/10"
                style={{ backgroundColor: annotation.color || '#f59e0b' }}
              />
              <span className="text-xs font-semibold text-slate-200">
                Pág. {annotation.pageNumber}
              </span>
              {timeString && (
                <span className="text-[10px] text-slate-400">· {timeString}</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDelete}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                title="Eliminar anotación"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSave()
                  onClose?.()
                }}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
                title="Cerrar"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="mt-2.5">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escribí una nota para esta página..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-white/10 bg-black/40 p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      handleSave()
                    }
                  }}
                />

                {/* Color swatches */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    {ANNOTATION_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleColorChange(c)}
                        className={`h-5 w-5 cursor-pointer rounded-full border transition-transform hover:scale-115 ${
                          annotation.color === c ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                        title="Cambiar color de nota"
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="cursor-pointer rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                className="group/text cursor-pointer rounded-lg bg-black/20 p-2 text-xs text-slate-300 hover:bg-black/30 hover:text-slate-100 transition-colors"
                title="Hacé clic para editar"
              >
                <p className="whitespace-pre-wrap leading-relaxed break-words">
                  {text || <span className="italic text-slate-500">Sin contenido. Hacé clic para escribir...</span>}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 group-hover/text:text-slate-400">
                  <span>Clic para editar</span>
                  <span>Ctrl+Enter para guardar</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
