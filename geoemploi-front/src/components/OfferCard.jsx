import { useState } from 'react'
import StatusMessage from './StatusMessage.jsx'

// Accepte en plus `userRole` afin de ne pas proposer de postuler à un compte
// employeur, qui ne peut de toute façon pas candidater (le backend renvoie
// déjà une 403 dans ce ca,  voir le message d'erreur existant plus bas).
function OfferCard({ offer, isAuthenticated, userRole, onApply, onLogin, onRegister }) {
  const [showAuthChoice, setShowAuthChoice] = useState(false)
  const [applicationLoading, setApplicationLoading] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState(null)

  if (!offer) return <StatusMessage type="empty" />

  const handleApply = async () => {
    if (!isAuthenticated) {
      setShowAuthChoice(true)
      return
    }

    setApplicationLoading(true)
    setApplicationMessage(null)
    try {
      await onApply(offer.id)
      setApplicationMessage({ ok: true, text: 'Votre candidature a bien été envoyée.' })
    } catch (error) {
      let text = 'Impossible d’envoyer votre candidature pour le moment.'
      if (error.status === 409) text = 'Vous avez déjà postulé à cette offre.'
      if (error.status === 403) text = 'Seul un compte candidat peut postuler à une offre.'
      if (error.status === 401) text = 'Votre session a expiré. Reconnectez-vous pour postuler.'
      setApplicationMessage({ ok: false, text })
    } finally {
      setApplicationLoading(false)
    }
  }

  return (
    <article className="offer-card">
      <h2>{offer.title}</h2>
      <p className="company">{offer.company}</p>
      <dl className="offer-details">
        <div>
          <span className="detail-icon" aria-hidden="true">⌖</span>
          <dt>Commune</dt>
          <dd>{offer.commune}</dd>
        </div>
      </dl>
      {/* Un champ "Contrat" affichait le texte fixe
          "Contrat à préciser" pour TOUTES les offres, sans exception : le
          formulaire de création d'offre (EmployerDashboard.jsx) ne
          collecte aucun type de contrat, donc cette valeur n'était jamais
          celle saisie par l'employeur.
      <dl className="offer-details">
        <div>
          <span className="detail-icon" aria-hidden="true">⌖</span>
          <dt>Commune</dt>
          <dd>{offer.commune}</dd>
        </div>
        <div>
          <span className="detail-icon" aria-hidden="true">◷</span>
          <dt>Contrat</dt>
          <dd>{offer.contract}</dd>
        </div>
      </dl>
*/}
      <div className="offer-section">
        <h3>À propos du poste</h3>
        {/*Deux sections affichaient un texte fixe, identique
            sur les 1000 offres, jamais tiré de ce que l'employeur a réellement
            écrit (le formulaire de création n'a pas de champs "missions" ni
            "profil recherché", seulement un champ "description" unique) :
        <p>{offer.description}</p>
        <h4>Missions principales</h4>
        <ul className="offer-missions">
          {offer.missions.map((mission) => (
            <li key={mission}>{mission}</li>
          ))}
        </ul>
        <h4>Profil recherché</h4>
        <p>{offer.profile}</p>
 */}
        {/*Seule la description réellement saisie par l'employeur
            à la création de l'offre est affichée, telle quelle. */}
        <p>{offer.description}</p>
        {/*Lebouton "Postuler" était toujours affiché
        <button type="button" className="apply-button" onClick={handleApply} disabled={applicationLoading}>
          {applicationLoading ? 'Envoi en cours…' : 'Postuler'}
        </button>
   */}
        {/* Compte employeur connecté ne peut pas postuler
            (candidature réservée aux candidats côté backend), on le
            prévient au lieu de lui proposer un bouton qui échouera. */}
        {userRole === 'employer' ? (
          <p className="dashboard-hint">Connecté en tant qu’employeur : la candidature est réservée aux comptes candidat.</p>
        ) : (
          <button type="button" className="apply-button" onClick={handleApply} disabled={applicationLoading}>
            {applicationLoading ? 'Envoi en cours…' : 'Postuler'}
          </button>
        )}
        {applicationMessage && (
          <p
            className={`application-message ${applicationMessage.ok ? 'is-success' : 'is-error'}`}
            role="status"
          >
            {applicationMessage.text}
          </p>
        )}
        {showAuthChoice && !isAuthenticated && (
          <div className="apply-auth" role="status">
            <p>Connectez-vous ou créez un compte pour postuler.</p>
            <div>
              <button type="button" onClick={() => { setShowAuthChoice(false); onLogin() }}>
                Se connecter
              </button>
              <button type="button" onClick={() => { setShowAuthChoice(false); onRegister() }}>
                S’inscrire
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

export default OfferCard
