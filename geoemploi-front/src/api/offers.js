import { apiRequest } from './client.js'

export function getOffers() {
  return apiRequest('/offers')
}
