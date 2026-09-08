const TOKEN_KEY = 'geoemploi_token'

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

// Nécessaire pour connaître le rôle du compte connecté
// Lit l'id utilisateur ("sub") dans le payload du token JWT, SANS vérifier
// sa signature : ce n'est pas grave côté front, on ne fait que lire une
// information publique (le payload JWT n'est pas chiffré, juste signé);
// la vérification de signature reste faite par le backend à chaque appel
// authentifié. Sert à appeler GET /users/{id} pour récupérer le profil
// complet (rôle candidat/employeur, etc.) après connexion, voir App.jsx.
export function getUserIdFromToken(token) {
  if (!token) return null
  try {
    const payloadBase64 = token.split('.')[1]
    const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')))
    return payload.sub ? Number(payload.sub) : null
  } catch {
    return null
  }
}