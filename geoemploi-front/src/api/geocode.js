// Service utilisé : la Base Adresse Nationale (BAN), API publique et
// officielle française. Gratuite, sans clé d'API, et elle autorise les appels
// directs depuis le navigateur (CORS ouvert).
//   Doc : https://adresse.data.gouv.fr/api-doc/adresse

const BAN_SEARCH_URL = 'https://api-adresse.data.gouv.fr/search/'

// Recherche une adresse et renvoie une liste de propositions normalisées.
// Chaque proposition porte déjà les coordonnées, donc aucun second appel
// n'est nécessaire une fois que l'employeur a choisi dans la liste.
export async function searchAddresses(query, limit = 5) {
  const cleaned = query.trim()
  // La BAN renvoie une erreur en dessous de 3 caractères : on évite l'appel.
  if (cleaned.length < 3) return []

  const url = `${BAN_SEARCH_URL}?q=${encodeURIComponent(cleaned)}&limit=${limit}`

  let response
  try {
    response = await fetch(url)
  } catch {
    throw new Error('Le service d’adresses est momentanément indisponible.')
  }
  if (!response.ok) {
    throw new Error('Le service d’adresses est momentanément indisponible.')
  }

  const data = await response.json()
  return (data.features ?? []).map((feature) => ({
    // `label` = adresse complète lisible ("12 Rue de Rivoli 75004 Paris")
    label: feature.properties.label,
    city: feature.properties.city,
    postcode: feature.properties.postcode,
    context: feature.properties.context, // "75, Paris, Île-de-France"
    // GeoJSON renvoie [longitude, latitude] — dans cet ordre.
    longitude: feature.geometry.coordinates[0],
    latitude: feature.geometry.coordinates[1],
  }))
}
