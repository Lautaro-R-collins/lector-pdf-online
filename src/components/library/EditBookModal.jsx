import { useState } from 'react'

const GENRES = ['Tecnología', 'Novela', 'Ciencia', 'Negocios', 'Estudio', 'Desarrollo Personal', 'Otro']
const PRIORITIES = ['Alta', 'Media', 'Baja']

export default function EditBookModal({ book, isOpen, onClose, onSave }) {
  const [title, setTitle] = useState(book?.title || '')
  const [author, setAuthor] = useState(book?.author || '')
  const [genre, setGenre] = useState(book?.genre || 'Tecnología')
  const [priority, setPriority] = useState(book?.priority || 'Media')
  const [rating, setRating] = useState(book?.rating || 0)
  const [prevBookId, setPrevBookId] = useState(book?.id)

  // Derive form state during render when selected book changes
  if (book?.id !== prevBookId) {
    setPrevBookId(book?.id)
    setTitle(book?.title || '')
    setAuthor(book?.author || '')
    setGenre(book?.genre || 'Tecnología')
    setPriority(book?.priority || 'Media')
    setRating(book?.rating || 0)
  }

  if (!isOpen || !book) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(book.id, { title, author, genre, priority, rating })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#161622] p-6 shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Editar Libro
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
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Título del Libro
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Autor / Editorial
            </label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className="w-full text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
