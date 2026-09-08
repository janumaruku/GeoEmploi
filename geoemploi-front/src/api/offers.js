import { apiRequest } from './client.js'

export function getOffers() {
  return apiRequest('/offers?status_filter=approved&limit=1000')
}

// dashboard employeur
// Renvoie TOUTES les offres d'un employeur (en attente, approuvée,
// rejetée), contrairement à getOffers() ci-dessus qui ne renvoie que les
// offres approuvées destinées au grand public. S'appuie sur le filtre
// ?employer_id= déjà supporté par GET /offers côté backend ; aucun
// status_filter n'est passé ici, donc aucune offre n'est cachée à son
// propriétaire.
export function getEmployerOffers(employerId) {
  return apiRequest(`/offers?employer_id=${employerId}&limit=1000`)
}

export function createOffer(data) {
  return apiRequest('/offers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

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
