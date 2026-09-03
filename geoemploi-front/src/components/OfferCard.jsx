import StatusMessage from './StatusMessage.jsx'

function Icon({ children }) {
  return <span className="detail-icon" aria-hidden="true">{children}</span>
}

function OfferCard({ offer, onApply, applicationState }) {
  if (!offer) return <StatusMessage type="empty" />

  return (
    <article className="offer-card">
      <div className="offer-card-header">
        <span className="offer-badge">{offer.status === 'approved' ? 'Offre publiée' : offer.status}</span>
      </div>
      <h2>{offer.title}</h2>
      <p className="company">Référence offre n°{offer.id}</p>
      {Number.isFinite(offer.distanceKm) && <p className="offer-distance">À {offer.distanceKm.toFixed(1).replace('.', ',')} km de votre position</p>}
      <dl className="offer-details">
        <div><Icon>⌖</Icon><dt>Lieu</dt><dd>{offer.address}</dd></div>
        <div><Icon>◎</Icon><dt>Rayon</dt><dd>{offer.diffusion_radius_km} km</dd></div>
      </dl>
      <div className="offer-section"><h3>À propos du poste</h3><p>{offer.description || 'La description détaillée de cette offre sera bientôt disponible.'}</p></div>
      <button type="button" className="apply-button" disabled={applicationState.status === 'loading'} aria-describedby={applicationState.message ? 'application-message' : undefined} onClick={() => onApply(offer)}>
        {applicationState.status === 'loading' ? 'Envoi en cours…' : 'Candidater'} <span aria-hidden="true">→</span>
      </button>
      {applicationState.message && <p id="application-message" className={`application-message application-${applicationState.status}`} role={applicationState.status === 'error' ? 'alert' : 'status'}>{applicationState.message}</p>}
    </article>
  )
}

export default OfferCard
