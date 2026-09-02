const DB_NAME = 'LectorPDF_LibraryDB'
const DB_VERSION = 1
const STORE_NAME = 'books'

/**
 * Initializes and returns the IndexedDB database instance.
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt', { unique: false })
        store.createIndex('genre', 'genre', { unique: false })
        store.createIndex('priority', 'priority', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Retrieves all books stored in the library.
 */
export async function getAllBooks() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

/**
 * Adds a new book and its PDF blob to IndexedDB.
 */
export async function addBook({ title, author, genre, priority, rating, file }) {
  const db = await openDB()
  const id = `book-${crypto.randomUUID?.() ?? Date.now()}`
  const GRADIENTS = [
    'from-indigo-600 to-purple-800',
    'from-blue-600 to-cyan-800',
    'from-emerald-600 to-teal-800',
    'from-rose-600 to-pink-800',
    'from-amber-600 to-orange-800',
    'from-violet-600 to-indigo-900',
  ]
  const coverColor = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]

  const bookData = {
    id,
    title: title.trim() || file.name.replace(/\.pdf$/i, ''),
    author: author.trim() || 'Desconocido',
    genre: genre || 'Otro',
    priority: priority || 'Media',
    rating: Number(rating) || 0,
    currentPage: 1,
    numPages: 0,
    coverColor,
    fileName: file.name,
    pdfBlob: file,
    createdAt: new Date().toISOString(),
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.add(bookData)

    request.onsuccess = () => resolve(bookData)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Updates metadata or progress of an existing book.
 */
export async function updateBook(id, updates) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const getReq = store.get(id)

    getReq.onsuccess = () => {
      const existing = getReq.result
      if (!existing) {
        reject(new Error('Libro no encontrado'))
        return
      }
      const updated = { ...existing, ...updates }
      const putReq = store.put(updated)
      putReq.onsuccess = () => resolve(updated)
      putReq.onerror = () => reject(putReq.error)
    }
    getReq.onerror = () => reject(getReq.error)
  })
}

/**
 * Deletes a book by ID from IndexedDB.
 */
export async function deleteBook(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => resolve(id)
    request.onerror = () => reject(request.error)
  })
}
