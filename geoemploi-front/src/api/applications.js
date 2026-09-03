import { apiRequest } from './client.js'

export function createApplication(offerId, token) {
  return apiRequest('/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ offer_id: offerId }),
  })
}
