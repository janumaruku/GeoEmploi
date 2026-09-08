import { apiRequest } from './client.js'

export function applyToOffer(offerId) {
  return apiRequest('/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offer_id: offerId }),
  })
}

// Paarcours de candidature complet
// Mes candidatures (candidat) : le backend déduit automatiquement
// applicant_id = utilisateur courant lorsque le rôle est job_seeker
// (backend/app/api/v1/applications.py), donc aucun paramètre à fournir ici.
export function getMyApplications() {
  return apiRequest('/applications')
}

// Candidatures reçues sur une offre (employeur) : le backend vérifie déjà
// que l'offre appartient à l'employeur courant (403 sinon).
export function getOfferApplications(offerId) {
  return apiRequest(`/applications?offer_id=${offerId}`)
}

// Accepter / refuser / marquer comme vue une candidature (employeur).
export function updateApplicationStatus(applicationId, statusValue) {
  return apiRequest(`/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: statusValue }),
  })
}
