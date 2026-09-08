import { apiRequest } from './client.js'

// Récupère le profil complet d'un utilisateur (rôle, statut,
// job_seeker_profile ou employer_profile) via l'endpoint déjà existant
// côté backend : GET /users/{id} (backend/app/api/v1/users.py). Utilisé
// juste après la connexion pour savoir "qui est connecté" et afficher le
// tableau de bord employeur ou l'espace candidat qui va avec.
export function getUser(userId) {
  return apiRequest(`/users/${userId}`)
}

export function getCurrentUser() {
  return apiRequest('/users/me')
}
