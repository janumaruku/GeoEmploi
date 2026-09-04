import { apiRequest } from './client.js'

export function getOffers(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/offers${query ? `?${query}` : ''}`)
}

export function getOffer(offerId) {
  return apiRequest(`/offers/${offerId}`)
}

// Nécessite un token employer (route protégée côté backend).
export function createOffer(data) {
  return apiRequest('/offers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

// Nécessite d'être l'employeur propriétaire de l'offre, ou admin.
export function updateOffer(offerId, data) {
  return apiRequest(`/offers/${offerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function deleteOffer(offerId) {
  return apiRequest(`/offers/${offerId}`, { method: 'DELETE' })
}

// Modération — admin uniquement.
export function updateOfferStatus(offerId, status) {
  return apiRequest(`/offers/${offerId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}
