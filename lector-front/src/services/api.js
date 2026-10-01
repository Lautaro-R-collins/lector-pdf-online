const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

let currentToken = null

export function setAccessToken(token) {
  currentToken = token
}

export function getAccessToken() {
  return currentToken
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (currentToken) {
    headers.Authorization = `Bearer ${currentToken}`
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include', // Includes HttpOnly cookies (refreshToken)
  }

  let response
  try {
    response = await fetch(url, fetchOptions)
  } catch (error) {
    console.warn(`[API] Error de red al consultar ${endpoint}:`, error.message)
    throw new Error('No se pudo conectar con el servidor backend')
  }

  // Handle Token Expiry & Automatic Refresh
  if (response.status === 401 && !endpoint.startsWith('/auth/refresh') && !endpoint.startsWith('/auth/login')) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        if (refreshData.accessToken) {
          setAccessToken(refreshData.accessToken)
          headers.Authorization = `Bearer ${refreshData.accessToken}`
          // Retry original request
          const retryRes = await fetch(url, { ...fetchOptions, headers })
          return await handleResponse(retryRes)
        }
      } else {
        setAccessToken(null)
      }
    } catch {
      setAccessToken(null)
    }
  }

  return handleResponse(response)
}

async function handleResponse(response) {
  if (response.status === 204) {
    return { success: true }
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMsg = data.message || `Error del servidor (${response.status})`
    const error = new Error(errorMsg)
    error.status = response.status
    error.details = data.details
    throw error
  }

  return data
}
