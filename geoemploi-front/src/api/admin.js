import { apiRequest } from './client.js'

// Admin uniquement.
export function getMetrics() {
  return apiRequest('/admin/metrics')
}
