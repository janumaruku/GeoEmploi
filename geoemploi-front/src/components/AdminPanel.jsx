import { useEffect, useState } from 'react'
import {
  getAdminMetrics,
  getAdminOffers,
  getAdminUsers,
  updateAdminOfferStatus,
  updateAdminUserStatus,
} from '../api/admin.js'

const tabs = [
  { id: 'overview', label: 'Vue d’ensemble' },
  { id: 'offers', label: 'Offres' },
  { id: 'users', label: 'Utilisateurs' },
]

const metricLabels = {
  total_users: 'Utilisateurs',
  total_employers: 'Employeurs',
  total_job_seekers: 'Demandeurs d’emploi',
  total_offers: 'Offres',
  total_applications: 'Candidatures',
  offers_pending_moderation: 'Offres à modérer',
}

const statusLabels = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Refusée',
  active: 'Actif',
  suspended: 'Suspendu',
  pending_verification: 'À vérifier',
}

const roleLabels = {
  admin: 'Administrateur',
  employer: 'Employeur',
  job_seeker: 'Demandeur d’emploi',
}

function formatDate(value) {
  if (!value) return 'Non renseignée'
  return new Intl.DateTimeFormat('fr-FR').format(new Date(value))
}

function getUserName(user) {
  if (user.job_seeker_profile) {
    return `${user.job_seeker_profile.first_name} ${user.job_seeker_profile.last_name}`.trim()
  }
  if (user.employer_profile?.company_name) return user.employer_profile.company_name
  return user.role === 'admin' ? 'Administrateur' : 'Non renseigné'
}

function AdminPanel({ onSessionExpired }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [metrics, setMetrics] = useState(null)
  const [offers, setOffers] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pendingAction, setPendingAction] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadAdminData() {
      setLoading(true)
      setError('')
      try {
        const [metricsData, offersData, usersData] = await Promise.all([
          getAdminMetrics(),
          getAdminOffers(),
          getAdminUsers(),
        ])
        if (!cancelled) {
          setMetrics(metricsData)
          setOffers(Array.isArray(offersData) ? offersData : [])
          setUsers(Array.isArray(usersData) ? usersData : [])
        }
      } catch (apiError) {
        if (!cancelled) {
          if (apiError.status === 401 || apiError.status === 403) onSessionExpired()
          else setError('Impossible de charger les données administrateur.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadAdminData()
    return () => { cancelled = true }
  }, [onSessionExpired])

  async function changeOfferStatus(offerId, status) {
    const actionId = `offer-${offerId}`
    setPendingAction(actionId)
    setError('')
    setSuccess('')
    try {
      const updatedOffer = await updateAdminOfferStatus(offerId, status)
      setOffers((current) => current.map((offer) => offer.id === offerId ? updatedOffer : offer))
      setMetrics(await getAdminMetrics())
      setSuccess(status === 'approved' ? 'L’offre a été approuvée.' : 'L’offre a été refusée.')
    } catch (apiError) {
      if (apiError.status === 401 || apiError.status === 403) onSessionExpired()
      else setError('La mise à jour de l’offre a échoué.')
    } finally {
      setPendingAction('')
    }
  }

  async function changeUserStatus(userId, status) {
    const actionId = `user-${userId}`
    setPendingAction(actionId)
    setError('')
    setSuccess('')
    try {
      const updatedUser = await updateAdminUserStatus(userId, status)
      setUsers((current) => current.map((user) => user.id === userId ? updatedUser : user))
      setSuccess(status === 'active' ? 'Le compte est maintenant actif.' : 'Le compte a été suspendu.')
    } catch (apiError) {
      if (apiError.status === 401 || apiError.status === 403) onSessionExpired()
      else setError('La mise à jour du compte a échoué.')
    } finally {
      setPendingAction('')
    }
  }

  return (
    <section className="admin-panel" aria-labelledby="admin-title">
      <div className="admin-heading">
        <p className="eyebrow">Administration</p>
        <h2 id="admin-title">Panel administrateur</h2>
      </div>

      <nav className="admin-tabs" aria-label="Sections du panel administrateur">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? 'is-active' : ''}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            onClick={() => { setActiveTab(tab.id); setError(''); setSuccess('') }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {error && <p className="admin-message is-error" role="alert">{error}</p>}
      {success && <p className="admin-message is-success" role="status">{success}</p>}

      {loading ? (
        <p className="admin-empty">Chargement des données…</p>
      ) : activeTab === 'overview' ? (
        <div className="admin-metrics">
          {metrics && Object.entries(metricLabels).map(([key, label]) => (
            <article className="admin-metric" key={key}>
              <strong>{metrics[key]}</strong>
              <span>{label}</span>
            </article>
          ))}
        </div>
      ) : activeTab === 'offers' ? (
        offers.length === 0 ? <p className="admin-empty">Aucune offre.</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Titre</th><th>Employeur</th><th>Commune</th><th>Statut</th><th>Créée le</th><th>Actions</th></tr></thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id}>
                    <td>{offer.title}</td>
                    <td>Employeur n°{offer.employer_id}</td>
                    <td>{offer.commune || 'Non renseignée'}</td>
                    <td><span className={`status-badge status-badge-${offer.status}`}>{statusLabels[offer.status] || offer.status}</span></td>
                    <td>{formatDate(offer.created_at)}</td>
                    <td className="admin-actions">
                      <button type="button" disabled={pendingAction === `offer-${offer.id}` || offer.status === 'approved'} onClick={() => changeOfferStatus(offer.id, 'approved')}>Approuver</button>
                      <button type="button" className="is-danger" disabled={pendingAction === `offer-${offer.id}` || offer.status === 'rejected'} onClick={() => changeOfferStatus(offer.id, 'rejected')}>Refuser</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : users.length === 0 ? <p className="admin-empty">Aucun utilisateur.</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Nom</th><th>E-mail</th><th>Rôle</th><th>Statut</th><th>Action</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{getUserName(user)}</td>
                  <td>{user.email}</td>
                  <td>{roleLabels[user.role] || user.role}</td>
                  <td><span className={`status-badge status-badge-${user.status}`}>{statusLabels[user.status] || user.status}</span></td>
                  <td className="admin-actions">
                    {user.status === 'active' ? (
                      <button type="button" className="is-danger" disabled={pendingAction === `user-${user.id}`} onClick={() => changeUserStatus(user.id, 'suspended')}>Suspendre</button>
                    ) : (
                      <button type="button" disabled={pendingAction === `user-${user.id}`} onClick={() => changeUserStatus(user.id, 'active')}>{user.status === 'suspended' ? 'Réactiver' : 'Activer'}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AdminPanel
