import { getToken } from './authToken.js'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest(path, options = {}) {
  const token = getToken()
  const headers = { ...(options.headers || {}) }
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('Le service est momentanément indisponible. Vérifiez que le backend est démarré.')
  }

  if (!response.ok) {
    let detail
    try { detail = (await response.json()).detail } catch { detail = null }
    throw new ApiError(typeof detail === 'string' ? detail : 'Une erreur est survenue.', response.status)
  }

  if (response.status === 204) return null
  return response.json()
}
