import { apiRequest } from './client.js'

export function applyToOffer(offerId) {
  return apiRequest('/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offer_id: offerId }),
  })
}
