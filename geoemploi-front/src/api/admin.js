import { apiRequest } from './client.js'

async function getAllPages(path) {
  const pageSize = 1000
  const results = []
  let skip = 0

  while (true) {
    const separator = path.includes('?') ? '&' : '?'
    const page = await apiRequest(`${path}${separator}skip=${skip}&limit=${pageSize}`)
    results.push(...page)
    if (page.length < pageSize) return results
    skip += pageSize
  }
}

export function getAdminMetrics() {
  return apiRequest('/admin/metrics')
}

export function getAdminOffers() {
  return getAllPages('/offers')
}

export function updateAdminOfferStatus(offerId, status) {
  return apiRequest(`/offers/${offerId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}

export function getAdminUsers() {
  return getAllPages('/users')
}

export function updateAdminUserStatus(userId, status) {
  return apiRequest(`/users/${userId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}
