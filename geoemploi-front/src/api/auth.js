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

export function logout() {
  clearToken()
}
