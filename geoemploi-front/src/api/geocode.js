// L'API Découpage administratif fournit les communes et leur centroïde.
// Documentation : https://geo.api.gouv.fr/decoupage-administratif/communes

const COMMUNES_URL = 'https://geo.api.gouv.fr/communes'

// Recherche une commune et normalise son nom et son centroïde.
export async function searchCommunes(query, limit = 5) {
  const cleaned = query.trim()
  if (cleaned.length < 2) return []

  const parameter = /^\d{5}$/.test(cleaned) ? 'codePostal' : 'nom'
  const params = new URLSearchParams({
    [parameter]: cleaned,
    fields: 'nom,code,centre,departement,codesPostaux',
    boost: 'population',
    limit: String(limit),
  })

  let response
  try {
    response = await fetch(`${COMMUNES_URL}?${params}`)
  } catch {
    throw new Error('Le service des communes est momentanément indisponible.')
  }
  if (!response.ok) {
    throw new Error('Le service des communes est momentanément indisponible.')
  }

  const data = await response.json()
  return data
    .filter((commune) => commune.centre?.coordinates?.length === 2)
    .map((commune) => ({
      name: commune.nom,
      code: commune.code,
      postcodes: commune.codesPostaux ?? [],
      context: commune.departement
        ? `${commune.departement.code} · ${commune.departement.nom}`
        : `Code INSEE ${commune.code}`,
      longitude: commune.centre.coordinates[0],
      latitude: commune.centre.coordinates[1],
    }))
}
