import { apiRequest, setAccessToken } from './api'

export async function apiRegister(name, email, password) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
  if (data.accessToken) {
    setAccessToken(data.accessToken)
  }
  return data
}

export async function apiLogin(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (data.accessToken) {
    setAccessToken(data.accessToken)
  }
  return data
}

export async function apiLogout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' })
  } catch (err) {
    console.warn('[Sync] Error al cerrar sesión en el servidor:', err.message)
  } finally {
    setAccessToken(null)
  }
}

export async function apiGetMe() {
  return await apiRequest('/auth/me')
}

export async function apiSyncLibrary(localBooks = []) {
  return await apiRequest('/documents/sync', {
    method: 'POST',
    body: JSON.stringify({ books: localBooks }),
  })
}

export async function apiUpdateProgress(documentIdOrLocalId, { currentPage, progress, numPages }) {
  if (!documentIdOrLocalId) return null
  try {
    return await apiRequest(`/documents/${documentIdOrLocalId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ currentPage, progress, numPages }),
    })
  } catch (err) {
    console.warn('[Sync] No se pudo sincronizar progreso en la nube:', err.message)
    return null
  }
}

export async function apiSyncAnnotations(documentIdOrLocalId, annotations = []) {
  if (!documentIdOrLocalId || !annotations.length) return null
  try {
    return await apiRequest(`/documents/${documentIdOrLocalId}/annotations/sync`, {
      method: 'POST',
      body: JSON.stringify({ annotations }),
    })
  } catch (err) {
    console.warn('[Sync] No se pudieron sincronizar anotaciones en la nube:', err.message)
    return null
  }
}
