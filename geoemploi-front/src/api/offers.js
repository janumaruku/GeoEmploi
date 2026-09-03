import { apiRequest } from './client.js'

export function getOffers() {
  return apiRequest('/offers?status_filter=approved')
}
