import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllBooks, addBook, updateBook, deleteBook } from '../services/libraryStorage'
import { usePDFContext } from '../hooks/usePDFContext'
import BookCard from '../components/library/BookCard'
import AddBookModal from '../components/library/AddBookModal'
import EditBookModal from '../components/library/EditBookModal'

const GENRES = ['Todos', 'Tecnología', 'Novela', 'Ciencia', 'Negocios', 'Estudio', 'Desarrollo Personal', 'Otro']
const PRIORITIES = ['Todas', 'Alta', 'Media', 'Baja']

export default function LibraryPage() {
  const navigate = useNavigate()
  const { openBookFromLibrary } = usePDFContext()

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('Todos')
  const [selectedPriority, setSelectedPriority] = useState('Todas')
  const [sortBy, setSortBy] = useState('recent')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null)

  // Fetch books from IndexedDB on mount
  useEffect(() => {
    let isMounted = true
    getAllBooks()
      .then(data => {
        if (isMounted) {
          setBooks(data)
          setLoading(false)
        }
      })
      .catch(err => {
        console.error('Error al cargar libros de la biblioteca:', err)
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    return books
      .filter(book => {
        const matchesQuery =
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesGenre = selectedGenre === 'Todos' || book.genre === selectedGenre
        const matchesPriority = selectedPriority === 'Todas' || book.priority === selectedPriority
        return matchesQuery && matchesGenre && matchesPriority
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title)
        if (sortBy === 'priority') {
          const weights = { Alta: 3, Media: 2, Baja: 1 }
          return (weights[b.priority] || 0) - (weights[a.priority] || 0)
        }
        if (sortBy === 'progress') {
          const progA = a.numPages ? a.currentPage / a.numPages : 0
          const progB = b.numPages ? b.currentPage / b.numPages : 0
          return progB - progA
        }
        // Default: recent
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
  }, [books, searchQuery, selectedGenre, selectedPriority, sortBy])

  const handleOpen = (book) => {
    if (!book.pdfBlob) return
    openBookFromLibrary(book)
    navigate('/reader')
  }

  const handleAddSave = async (data) => {
    const created = await addBook(data)
    setBooks(prev => [created, ...prev])
  }

  const handleEditSave = async (id, updates) => {
    const updated = await updateBook(id, updates)
    setBooks(prev => prev.map(b => b.id === id ? updated : b))
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este libro de la biblioteca?')) {
      await deleteBook(id)
      setBooks(prev => prev.filter(b => b.id !== id))
    }
  }

  const stats = useMemo(() => {
    const total = books.length
    const reading = books.filter(b => b.currentPage > 1).length
    const highPriority = books.filter(b => b.priority === 'Alta').length
    return { total, reading, highPriority }
  }, [books])

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a14] p-6 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Hero Banner Header */}
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-white/10 p-8 shadow-2xl overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Biblioteca
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all cursor-pointer shadow-xl shadow-indigo-600/30 shrink-0 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Agregar Libro
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10 max-w-lg">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 backdrop-blur-md">
              <span className="text-2xl font-bold text-slate-100">{stats.total}</span>
              <p className="text-[11px] font-medium text-slate-400">Total guardados</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 backdrop-blur-md">
              <span className="text-2xl font-bold text-emerald-400">{stats.reading}</span>
              <p className="text-[11px] font-medium text-slate-400">En lectura</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 backdrop-blur-md">
              <span className="text-2xl font-bold text-rose-400">{stats.highPriority}</span>
              <p className="text-[11px] font-medium text-slate-400">Prioridad Alta</p>
            </div>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#11111c] border border-white/10 rounded-2xl p-4 shadow-xl">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <svg className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por título o autor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filters & Sorting Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Genre Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Género:</span>
              <select
                value={selectedGenre}
                onChange={e => setSelectedGenre(e.target.value)}
                className="bg-[#1a1a28] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {GENRES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Prioridad:</span>
              <select
                value={selectedPriority}
                onChange={e => setSelectedPriority(e.target.value)}
                className="bg-[#1a1a28] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Ordenar:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-[#1a1a28] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="recent">Más Recientes</option>
                <option value="title">Título</option>
                <option value="priority">Mayor Prioridad</option>
                <option value="progress">Progreso de Lectura</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookshelf Grid Display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-10 h-10 border-2 border-indigo-500/40 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <span className="text-sm">Cargando biblioteca local...</span>
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onOpen={handleOpen}
                onEdit={setEditingBook}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl border-2 border-dashed border-white/10 bg-white/5 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">No se encontraron libros</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6">
              {books.length === 0
                ? 'Tu biblioteca aún está vacía. ¡Subí tus PDFs para organizarlos por géneros y prioridades!'
                : 'No hay libros que coincidan con los filtros seleccionados.'}
            </p>
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              + Agregar primer libro
            </button>
          </div>
        )}

        {/* Modals */}
        <AddBookModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSave={handleAddSave}
        />

        <EditBookModal
          book={editingBook}
          isOpen={!!editingBook}
          onClose={() => setEditingBook(null)}
          onSave={handleEditSave}
        />

      </div>
    </div>
  )
}
