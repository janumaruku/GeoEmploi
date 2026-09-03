import { apiRequest } from './client.js'

export function login(email, password) {
  const form = new URLSearchParams({ username: email, password })
  return apiRequest('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  })
}
