import { apiRequest } from './client.js'

// job_seeker uniquement (vérifié côté backend).
export function createApplication(offerId) {
  return apiRequest('/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offer_id: offerId }),
  })
}

// Filtre par offer_id (vue employeur) ou applicant_id (vue candidat) —
// le backend applique déjà l'autorisation correspondante.
export function getApplications(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/applications${query ? `?${query}` : ''}`)
}

export function getApplication(applicationId) {
  return apiRequest(`/applications/${applicationId}`)
}

// Employer propriétaire de l'offre, ou admin.
export function updateApplicationStatus(applicationId, status) {
  return apiRequest(`/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}
