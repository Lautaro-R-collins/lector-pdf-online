import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiGetMe,
  apiSyncLibrary,
} from '../services/backendSync'
import { getAllBooks } from '../services/libraryStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState('idle') // 'idle' | 'syncing' | 'synced' | 'error'
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const [authError, setAuthError] = useState(null)

  // Verify existing session on initial load via HttpOnly refresh cookie
  useEffect(() => {
    let isMounted = true

    async function checkAuth() {
      try {
        const res = await apiGetMe()
        if (isMounted && res.user) {
          setUser(res.user)
        }
      } catch {
        // Not authenticated or server offline - silently continue in local mode
        if (isMounted) setUser(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [])

  const syncNow = useCallback(async () => {
    if (!user) return

    setSyncStatus('syncing')
    try {
      const localBooks = await getAllBooks()
      // Exclude heavy Blobs from JSON sync payload, keep metadata
      const payload = localBooks.map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        genre: b.genre,
        priority: b.priority,
        rating: b.rating,
        coverColor: b.coverColor,
        currentPage: b.currentPage,
        numPages: b.numPages,
        fileName: b.fileName,
        createdAt: b.createdAt,
      }))

      await apiSyncLibrary(payload)
      setSyncStatus('synced')
      setLastSyncTime(new Date())
    } catch (err) {
      console.warn('[Sync] Error al sincronizar:', err.message)
      setSyncStatus('error')
    }
  }, [user])

  const login = useCallback(async (email, password) => {
    setAuthError(null)
    try {
      const res = await apiLogin(email, password)
      setUser(res.user)
      // Trigger initial sync after login
      setTimeout(() => {
        syncNow().catch(console.error)
      }, 500)
      return { success: true }
    } catch (err) {
      setAuthError(err.message)
      return { success: false, error: err.message }
    }
  }, [syncNow])

  const register = useCallback(async (name, email, password) => {
    setAuthError(null)
    try {
      const res = await apiRegister(name, email, password)
      setUser(res.user)
      setTimeout(() => {
        syncNow().catch(console.error)
      }, 500)
      return { success: true }
    } catch (err) {
      setAuthError(err.message)
      return { success: false, error: err.message }
    }
  }, [syncNow])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
    setSyncStatus('idle')
    setLastSyncTime(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        syncStatus,
        lastSyncTime,
        authError,
        setAuthError,
        login,
        register,
        logout,
        syncNow,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider')
  }
  return context
}
