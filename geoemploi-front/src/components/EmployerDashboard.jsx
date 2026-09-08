import { useEffect, useState } from 'react'
import { createOffer, deleteOffer, getEmployerOffers } from '../api/offers.js'
import { getOfferApplications, updateApplicationStatus } from '../api/applications.js'
import { searchCommunes } from '../api/geocode.js'

const emptyForm = {
  title: '',
  description: '',
  commune: '',
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

  const [communeSuggestions, setCommuneSuggestions] = useState([])
  const [communeLoading, setCommuneLoading] = useState(false)
  const [communePicked, setCommunePicked] = useState(false)

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

  useEffect(() => {
    if (communePicked) return undefined

    let cancelled = false
    const timer = setTimeout(async () => {
      if (form.commune.trim().length < 2) {
        if (!cancelled) setCommuneSuggestions([])
        return
      }
      if (!cancelled) setCommuneLoading(true)
      try {
        const results = await searchCommunes(form.commune)
        if (!cancelled) setCommuneSuggestions(results)
      } catch {
        if (!cancelled) setCommuneSuggestions([])
      } finally {
        if (!cancelled) setCommuneLoading(false)
      }
    }, 300)

    return () => { cancelled = true; clearTimeout(timer) }
  }, [form.commune, communePicked])

  function selectCommune(suggestion) {
    setForm((previous) => ({
      ...previous,
      commune: suggestion.name,
      latitude: String(suggestion.latitude),
      longitude: String(suggestion.longitude),
    }))
    setCommuneSuggestions([])
    setCommunePicked(true)
  }

  function changeCommune(event) {
    const { value } = event.target
    setForm((previous) => ({ ...previous, commune: value, latitude: '', longitude: '' }))
    setCommunePicked(false)
  }

  async function submitOffer(event) {
    event.preventDefault()
    setCreateError('')
    // sans coordonnées, l'offre n'apparaîtrait nulle
    // part sur la carte. On bloque avant l'appel réseau plutôt que de
    // laisser le backend renvoyer une erreur obscure.
    if (!form.latitude || !form.longitude) {
      setCreateError('Choisissez une commune dans la liste de propositions.')
      return
    }
    setIsCreating(true)
    try {
      await createOffer({
        title: form.title,
        description: form.description || null,
        commune: form.commune,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        diffusion_radius_km: Number(form.diffusion_radius_km) || 10,
      })
      setForm(emptyForm)
      // ON remet aussi l'autocomplétion à zéro, sinon la prochaine
      // offre repartirait avec l'adresse précédente considérée comme choisie.
      setCommunePicked(false)
      setCommuneSuggestions([])
      setIsFormOpen(false)
      await loadOffers()
    } catch {
      setCreateError('Impossible de créer cette offre. Vérifiez la commune sélectionnée.')
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

          <label htmlFor="offer-commune">Commune du poste</label>
          <div className="address-field">
            <input
              id="offer-commune"
              name="commune"
              value={form.commune}
              onChange={changeCommune}
              placeholder="Ex. Paris ou 75000"
              autoComplete="off"
              required
            />
            {communeSuggestions.length > 0 && (
              <ul className="address-suggestions">
                {communeSuggestions.map((suggestion) => (
                  <li key={suggestion.code}>
                    <button type="button" onClick={() => selectCommune(suggestion)}>
                      <strong>{suggestion.name}</strong>
                      <span>{suggestion.context}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {communeLoading && <p className="dashboard-hint">Recherche de la commune…</p>}
          {communePicked && (
            <p className="address-confirmed" role="status">
              Commune sélectionnée : {form.commune}
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
                  <p className="dashboard-hint">{offer.commune}</p>
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
