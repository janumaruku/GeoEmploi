import StatusMessage from './StatusMessage.jsx'

function OfferCard({ offer }) {
  if (!offer) return <StatusMessage type="empty" />

  return (
    <article className="offer-card">
      <h2>{offer.title}</h2>
      <p className="company">Référence offre n°{offer.id}</p>
      <dl className="offer-details">
        <div><span className="detail-icon" aria-hidden="true">⌖</span><dt>Adresse</dt><dd>{offer.address}</dd></div>
      </dl>
      <div className="offer-section">
        <h3>Description</h3>
        <p>{offer.description || 'Aucune description disponible.'}</p>
      </div>
    </article>
  )
}

export default OfferCard
