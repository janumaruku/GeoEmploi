import { useState } from 'react'
import StatusMessage from './StatusMessage.jsx'

function OfferCard({ offer, isAuthenticated, onLogin, onRegister }) {
  const [showAuthChoice, setShowAuthChoice] = useState(false)

  if (!offer) return <StatusMessage type="empty" />

  const handleApply = () => {
    if (!isAuthenticated) setShowAuthChoice(true)
  }

  return (
    <article className="offer-card">
      <h2>{offer.title}</h2>
      <p className="company">{offer.company}</p>
      <dl className="offer-details">
        <div>
          <span className="detail-icon" aria-hidden="true">⌖</span>
          <dt>Adresse</dt>
          <dd>{offer.address}</dd>
        </div>
        <div>
          <span className="detail-icon" aria-hidden="true">◷</span>
          <dt>Contrat</dt>
          <dd>{offer.contract}</dd>
        </div>
      </dl>
      <div className="offer-section">
        <h3>À propos du poste</h3>
        <p>{offer.description}</p>
        <h4>Missions principales</h4>
        <ul className="offer-missions">
          {offer.missions.map((mission) => (
            <li key={mission}>{mission}</li>
          ))}
        </ul>
        <h4>Profil recherché</h4>
        <p>{offer.profile}</p>
        <button type="button" className="apply-button" onClick={handleApply}>
          Postuler
        </button>
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
