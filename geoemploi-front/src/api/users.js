import { apiRequest } from './client.js'

export function registerUser(data) {
  return apiRequest('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function getUser(userId) {
  return apiRequest(`/users/${userId}`)
}

// Admin uniquement.
export function getUsers() {
  return apiRequest('/users')
}

// Soi-même, ou admin.
export function updateUser(userId, data) {
  return apiRequest(`/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function deleteUser(userId) {
  return apiRequest(`/users/${userId}`, { method: 'DELETE' })
}

// Activation/suspension — admin uniquement.
export function updateUserStatus(userId, status) {
  return apiRequest(`/users/${userId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}
