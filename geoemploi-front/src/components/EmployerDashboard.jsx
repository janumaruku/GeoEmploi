import { useEffect, useState } from 'react'
import { createOffer, deleteOffer, getEmployerOffers } from '../api/offers.js'
import { getOfferApplications, updateApplicationStatus } from '../api/applications.js'
// L'employeur ne saisit plus latitude/longitude à la main :
// il tape une adresse, la Base Adresse Nationale renvoie les coordonnées.
import { searchAddresses } from '../api/geocode.js'

const emptyForm = {
  title: '',
  description: '',
  address: '',
  // latitude/longitude restent dans l'état du formulaire, mais ne sont plus
  // tapées par l'employeur : elles sont remplies automatiquement quand il
  // choisit une adresse dans la liste de suggestions (voir selectAddress).
  latitude: '',
  longitude: '',
  diffusion_radius_km: '10',
}

const offerStatusLabels = {
  pending: 'En attente de modération',
  approved: 'Approuvée',
  rejected: 'Rejetée',
}

const applicationStatusLabels = {
  pending: 'En attente',
  viewed: 'Vue',
  accepted: 'Acceptée',
  rejected: 'Refusée',
}

// Tableau de bord employeur : liste des offres publiées par le
// compte connecté (tous statuts), création d'une nouvelle offre, et pour
// chaque offre, consultation + décision (accepter/refuser/marquer vue) sur
// les candidatures reçues. S'appuie uniquement sur des endpoints déjà
// existants côté backend (POST/GET/DELETE /offers, GET /applications,
// PATCH /applications/{id}/status), rien n'a été ajouté côté serveur.
function EmployerDashboard({ currentUser }) {
  const [offers, setOffers] = useState([])
  const [offersLoading, setOffersLoading] = useState(true)
  const [offersError, setOffersError] = useState(false)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const [expandedOfferId, setExpandedOfferId] = useState(null)
  const [applicationsByOffer, setApplicationsByOffer] = useState({})
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [applicationsError, setApplicationsError] = useState(false)

  // Autocomplétion d'adresse
  // `addressSuggestions` : propositions renvoyées par la Base Adresse
  // Nationale. `addressPicked` : passe à true dès qu'une proposition est
  // choisie, tant qu'il vaut false, on refuse de publier, sinon on
  // enverrait une offre sans coordonnées (donc invisible sur la carte).
  const [addressSuggestions, setAddressSuggestions] = useState([])
  const [addressLoading, setAddressLoading] = useState(false)
  const [addressPicked, setAddressPicked] = useState(false)

  async function loadOffers() {
    setOffersLoading(true)
    setOffersError(false)
    try {
      const data = await getEmployerOffers(currentUser.id)
      setOffers(data)
    } catch {
      setOffersError(true)
    } finally {
      setOffersLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!cancelled) await loadOffers()
    }
    run()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id])

  function updateFormField(event) {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
  }

  // Recherche d'adresse, déclenchée à la frappe
  // On attend 300 ms après la dernière touche avant d'interroger la BAN
  // (« debounce ») : sans ça, on enverrait une requête par caractère tapé.
  useEffect(() => {
    // Une fois l'adresse choisie, plus rien à chercher : on ferme la liste.
    if (addressPicked) return undefined

    let cancelled = false
    const timer = setTimeout(async () => {
      // Moins de 3 caractères : la BAN refuse la requête, on vide la liste
      // sans appeler le réseau.
      if (form.address.trim().length < 3) {
        if (!cancelled) setAddressSuggestions([])
        return
      }
      if (!cancelled) setAddressLoading(true)
      try {
        const results = await searchAddresses(form.address)
        if (!cancelled) setAddressSuggestions(results)
      } catch {
        if (!cancelled) setAddressSuggestions([])
      } finally {
        if (!cancelled) setAddressLoading(false)
      }
    }, 300)

    return () => { cancelled = true; clearTimeout(timer) }
  }, [form.address, addressPicked])

  // L'employeur clique sur une proposition : on enregistre l'adresse
  // complète ET ses coordonnées, d'un seul coup.
  function selectAddress(suggestion) {
    setForm((previous) => ({
      ...previous,
      address: suggestion.label,
      latitude: String(suggestion.latitude),
      longitude: String(suggestion.longitude),
    }))
    setAddressSuggestions([])
    setAddressPicked(true)
  }

  // Si l'employeur remodifie l'adresse après avoir choisi, les anciennes
  // coordonnées ne correspondent plus : on les vide et on relance la
  // recherche, pour ne jamais publier une offre au mauvais endroit.
  function changeAddress(event) {
    const { value } = event.target
    setForm((previous) => ({ ...previous, address: value, latitude: '', longitude: '' }))
    setAddressPicked(false)
  }

  async function submitOffer(event) {
    event.preventDefault()
    setCreateError('')
    // sans coordonnées, l'offre n'apparaîtrait nulle
    // part sur la carte. On bloque avant l'appel réseau plutôt que de
    // laisser le backend renvoyer une erreur obscure.
    if (!form.latitude || !form.longitude) {
      setCreateError('Choisissez une adresse dans la liste de propositions pour localiser l’offre.')
      return
    }
    setIsCreating(true)
    try {
      await createOffer({
        title: form.title,
        description: form.description || null,
        address: form.address,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        diffusion_radius_km: Number(form.diffusion_radius_km) || 10,
      })
      setForm(emptyForm)
      // ON remet aussi l'autocomplétion à zéro, sinon la prochaine
      // offre repartirait avec l'adresse précédente considérée comme choisie.
      setAddressPicked(false)
      setAddressSuggestions([])
      setIsFormOpen(false)
      await loadOffers()
    } catch {
      setCreateError('Impossible de créer cette offre. Vérifiez les champs (notamment la latitude/longitude).')
    } finally {
      setIsCreating(false)
    }
  }

  async function removeOffer(offerId) {
    try {
      await deleteOffer(offerId)
      await loadOffers()
      if (expandedOfferId === offerId) setExpandedOfferId(null)
    } catch {
      setOffersError(true)
    }
  }

  async function toggleApplications(offerId) {
    if (expandedOfferId === offerId) {
      setExpandedOfferId(null)
      return
    }
    setExpandedOfferId(offerId)
    setApplicationsLoading(true)
    setApplicationsError(false)
    try {
      const data = await getOfferApplications(offerId)
      setApplicationsByOffer((previous) => ({ ...previous, [offerId]: data }))
    } catch {
      setApplicationsError(true)
    } finally {
      setApplicationsLoading(false)
    }
  }

  async function decideApplication(offerId, applicationId, nextStatus) {
    try {
      await updateApplicationStatus(applicationId, nextStatus)
      const refreshed = await getOfferApplications(offerId)
      setApplicationsByOffer((previous) => ({ ...previous, [offerId]: refreshed }))
    } catch {
      setApplicationsError(true)
    }
  }

  return (
    <section className="dashboard" aria-labelledby="dashboard-title">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Espace employeur</p>
          <h2 id="dashboard-title">Vos offres</h2>
        </div>
        <button type="button" className="dashboard-primary-button" onClick={() => setIsFormOpen((open) => !open)}>
          {isFormOpen ? 'Annuler' : 'Publier une offre'}
        </button>
      </div>

      {isFormOpen && (
        <form className="offer-form" onSubmit={submitOffer}>
          <label htmlFor="offer-title">Intitulé du poste</label>
          <input id="offer-title" name="title" value={form.title} onChange={updateFormField} required />

          <label htmlFor="offer-description">Description</label>
          <textarea id="offer-description" name="description" value={form.description} onChange={updateFormField} rows={3} />

          {/* Adresse libre + latitude/longitude tapées à la main.
              Conservé en commentaire : c'est ce que remplace l'autocomplétion
              ci-dessous. Les coordonnées sont désormais déduites de l'adresse.
          <label htmlFor="offer-address">Adresse</label>
          <input id="offer-address" name="address" value={form.address} onChange={updateFormField} required />

          <div className="offer-form-row">
            <div>
              <label htmlFor="offer-lat">Latitude</label>
              <input id="offer-lat" name="latitude" type="number" step="any" value={form.latitude} onChange={updateFormField} required />
            </div>
            <div>
              <label htmlFor="offer-lng">Longitude</label>
              <input id="offer-lng" name="longitude" type="number" step="any" value={form.longitude} onChange={updateFormField} required />
            </div>
            <div>
              <label htmlFor="offer-radius">Rayon de diffusion (km)</label>
              <input id="offer-radius" name="diffusion_radius_km" type="number" step="any" value={form.diffusion_radius_km} onChange={updateFormField} />
            </div>
          </div>
 */}

          {/* L'employeur tape une adresse (rue, ville, code postal,
              arrondissement…) et choisit dans la liste. La latitude et la
              longitude sont remplies automatiquement à partir de la Base
              Adresse Nationale : plus aucune coordonnée à saisir. */}
          <label htmlFor="offer-address">Adresse du poste</label>
          <div className="address-field">
            <input
              id="offer-address"
              name="address"
              value={form.address}
              onChange={changeAddress}
              placeholder="Ex. 12 rue de Rivoli, Paris"
              autoComplete="off"
              required
            />
            {addressSuggestions.length > 0 && (
              <ul className="address-suggestions">
                {addressSuggestions.map((suggestion) => (
                  <li key={`${suggestion.label}-${suggestion.latitude}`}>
                    <button type="button" onClick={() => selectAddress(suggestion)}>
                      <strong>{suggestion.label}</strong>
                      <span>{suggestion.context}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {addressLoading && <p className="dashboard-hint">Recherche de l’adresse…</p>}
          {addressPicked && (
            <p className="address-confirmed" role="status">
              Adresse localisée : {Number(form.latitude).toFixed(5)}, {Number(form.longitude).toFixed(5)}
            </p>
          )}

          <label htmlFor="offer-radius">Rayon de diffusion (km)</label>
          <input id="offer-radius" name="diffusion_radius_km" type="number" step="any" min="1" value={form.diffusion_radius_km} onChange={updateFormField} />

          {createError && <p className="form-error" role="alert">{createError}</p>}
          <button className="submit-login" type="submit" disabled={isCreating}>
            {isCreating ? 'Publication…' : 'Publier l’offre'}
          </button>
          <p className="dashboard-hint">
            L’offre est publiée avec le statut « en attente de modération » — elle n’apparaît pas encore dans
            la recherche publique tant qu’un administrateur ne l’a pas approuvée.
          </p>
        </form>
      )}

      {offersLoading ? (
        <p className="dashboard-hint">Chargement de vos offres…</p>
      ) : offersError ? (
        <p className="form-error" role="alert">Impossible de charger vos offres pour le moment.</p>
      ) : offers.length === 0 ? (
        <p className="dashboard-hint">Vous n’avez pas encore publié d’offre.</p>
      ) : (
        <ul className="dashboard-offer-list">
          {offers.map((offer) => (
            <li key={offer.id} className="dashboard-offer-row">
              <div className="dashboard-offer-main">
                <div>
                  <h3>{offer.title}</h3>
                  <p className="dashboard-hint">{offer.address}</p>
                </div>
                <span className={`status-badge status-badge-${offer.status}`}>
                  {offerStatusLabels[offer.status] ?? offer.status}
                </span>
              </div>
              <div className="dashboard-offer-meta">
                <span>{offer.views_count} vue{offer.views_count !== 1 ? 's' : ''}</span>
                <div className="dashboard-offer-actions">
                  <button type="button" onClick={() => toggleApplications(offer.id)}>
                    {expandedOfferId === offer.id ? 'Masquer les candidatures' : 'Voir les candidatures'}
                  </button>
                  <button type="button" className="dashboard-danger-button" onClick={() => removeOffer(offer.id)}>
                    Supprimer
                  </button>
                </div>
              </div>

              {expandedOfferId === offer.id && (
                <div className="applications-list">
                  {applicationsLoading ? (
                    <p className="dashboard-hint">Chargement des candidatures…</p>
                  ) : applicationsError ? (
                    <p className="form-error" role="alert">Impossible de charger les candidatures.</p>
                  ) : (applicationsByOffer[offer.id] ?? []).length === 0 ? (
                    <p className="dashboard-hint">Aucune candidature reçue pour cette offre.</p>
                  ) : (
                    (applicationsByOffer[offer.id] ?? []).map((application) => (
                      <div key={application.id} className="application-row">
                        <div>
                          <strong>Candidat n°{application.applicant_id}</strong>
                          <span className={`status-badge status-badge-${application.status}`}>
                            {applicationStatusLabels[application.status] ?? application.status}
                          </span>
                        </div>
                        <div className="application-row-actions">
                          <button type="button" onClick={() => decideApplication(offer.id, application.id, 'viewed')}>
                            Marquer comme vue
                          </button>
                          <button type="button" onClick={() => decideApplication(offer.id, application.id, 'accepted')}>
                            Accepter
                          </button>
                          <button type="button" className="dashboard-danger-button" onClick={() => decideApplication(offer.id, application.id, 'rejected')}>
                            Refuser
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default EmployerDashboard