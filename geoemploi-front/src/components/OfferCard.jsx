import { useState } from 'react'
import StatusMessage from './StatusMessage.jsx'

function Icon({ children }) {
  return <span className="detail-icon" aria-hidden="true">{children}</span>
}

function OfferCard({ offer }) {
  const [messageOfferId, setMessageOfferId] = useState(null)

  if (!offer) return <StatusMessage type="empty" />

  const applicationMessage = messageOfferId === offer.id

  return (
    <article className="offer-card">
      <div className="offer-card-header">
        <span className="offer-badge">{offer.contract}</span>
        <p className="offer-distance">à {offer.distance}</p>
      </div>
      <h2>{offer.title}</h2>
      <p className="company">{offer.company}</p>
      <dl className="offer-details">
        <div><Icon>⌖</Icon><dt>Lieu</dt><dd>{offer.city}</dd></div>
        <div><Icon>◷</Icon><dt>Contrat</dt><dd>{offer.contract}</dd></div>
        <div><Icon>€</Icon><dt>Salaire</dt><dd>{offer.salary}</dd></div>
      </dl>
      <div className="offer-section"><h3>À propos du poste</h3><p>{offer.description}</p></div>
      <div className="offer-section">
        <h3>Compétences recherchées</h3>
        <ul className="skills">{offer.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
      </div>
      <button type="button" className="apply-button" aria-describedby={applicationMessage ? 'application-message' : undefined} onClick={() => setMessageOfferId(offer.id)}>
        Voir l’offre <span aria-hidden="true">→</span>
      </button>
      {applicationMessage && <p id="application-message" className="application-message" role="status">La candidature sera disponible après connexion.</p>}
      <p className="demo-disclaimer">Offre fictive présentée à des fins de démonstration.</p>
    </article>
  )
}

export default OfferCard
