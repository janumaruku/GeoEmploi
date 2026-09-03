const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options)
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
