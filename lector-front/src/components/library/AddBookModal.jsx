import { useState } from 'react'

const GENRES = ['Tecnología', 'Novela', 'Ciencia', 'Negocios', 'Estudio', 'Desarrollo Personal', 'Otro']
const PRIORITIES = ['Alta', 'Media', 'Baja']

export default function AddBookModal({ isOpen, onClose, onSave }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('Tecnología')
  const [priority, setPriority] = useState('Media')
  const [rating, setRating] = useState(0)
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected && selected.type === 'application/pdf') {
      setFile(selected)
      if (!title) {
        setTitle(selected.name.replace(/\.pdf$/i, ''))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    setSaving(true)
    await onSave({ file, title, author, genre, priority, rating })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#161622] p-6 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Agregar Libro a la Biblioteca
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Archivo PDF *
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              required
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/80 file:text-white hover:file:bg-indigo-500 cursor-pointer bg-white/5 rounded-xl border border-white/10 p-1"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Título del Libro
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej. Clean Code, Cien Años de Soledad..."
              required
              className="w-full text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Autor / Editorial
            </label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="Ej. Robert C. Martin..."
              className="w-full text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Genre & Priority Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Género / Categoría
              </label>
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="w-full text-xs bg-[#1a1a28] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {GENRES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Prioridad de Lectura
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full text-xs bg-[#1a1a28] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Valoración (Estrellas)
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star === rating ? 0 : star)}
                  className={`text-xl transition-transform hover:scale-125 cursor-pointer ${star <= rating ? 'text-amber-300' : 'text-slate-600'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!file || saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              {saving ? 'Guardando...' : 'Guardar Libro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
