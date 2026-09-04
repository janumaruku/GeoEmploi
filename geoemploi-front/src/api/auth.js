import { apiRequest } from './client.js'
import { clearToken } from './authToken.js'

export function login(email, password) {
  const form = new URLSearchParams({ username: email, password })
  return apiRequest('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  })
}

export function registerUser(data) {
  return apiRequest('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

// Purement local : le backend n'a pas de révocation de token (pas de
// blacklist/refresh token pour l'instant), donc "se déconnecter" ne fait
// qu'oublier le token côté client — il reste valide jusqu'à expiration.
export function logout() {
  clearToken()
}
