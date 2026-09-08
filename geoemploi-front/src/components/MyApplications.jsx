import { useEffect, useState } from 'react'
import { getMyApplications } from '../api/applications.js'

const applicationStatusLabels = {
  pending: 'En attente',
  viewed: 'Vue par l’employeur',
  accepted: 'Acceptée',
  rejected: 'Refusée',
}

// Parcours de candidature complet, côté candidat : liste de
// toutes les candidatures envoyées par le compte connecté, avec leur
// statut. S'appuie sur GET /applications déjà existant côté backend, qui
// renvoie automatiquement les candidatures du candidat connecté.
// Le titre de l'offre est retrouvé dans la liste `offers` déjà chargée par
// App.jsx (offres publiques approuvées) ; si une offre n'y figure plus
// (ex. retirée depuis), on affiche un intitulé générique de repli.
function MyApplications({ offers }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(false)
      try {
        const data = await getMyApplications()
        if (!cancelled) setApplications(data)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <section className="dashboard" aria-labelledby="applications-title">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Espace candidat</p>
          <h2 id="applications-title">Mes candidatures</h2>
        </div>
      </div>

      {loading ? (
        <p className="dashboard-hint">Chargement de vos candidatures…</p>
      ) : error ? (
        <p className="form-error" role="alert">Impossible de charger vos candidatures pour le moment.</p>
      ) : applications.length === 0 ? (
        <p className="dashboard-hint">Vous n’avez pas encore postulé à une offre.</p>
      ) : (
        <ul className="dashboard-offer-list">
          {applications.map((application) => {
            const offer = offers.find((candidate) => candidate.id === application.offer_id)
            return (
              <li key={application.id} className="dashboard-offer-row">
                <div className="dashboard-offer-main">
                  <div>
                    <h3>{offer ? offer.title : `Offre n°${application.offer_id}`}</h3>
                    {offer && <p className="dashboard-hint">{offer.address}</p>}
                  </div>
                  <span className={`status-badge status-badge-${application.status}`}>
                    {applicationStatusLabels[application.status] ?? application.status}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default MyApplications
