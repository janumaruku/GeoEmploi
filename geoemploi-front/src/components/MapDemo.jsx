function MapDemo({ offers, selectedOfferId, onSelectOffer }) {
  return (
    <div className="map-demo">
      {/* Placeholder cartographique sans appel externe. Cette couche CSS sera remplacée par la carte servie par le backend/cache. */}
      <div className="map-terrain" aria-hidden="true">
        <span className="district district-centre">Nantes Centre</span>
        <span className="district district-erdre">Erdre</span>
        <span className="district district-loire">Île de Nantes</span>
        <span className="district district-reze">Rezé</span>
        <span className="river-label">La Loire</span>
      </div>
      <div className="map-legend" aria-hidden="true"><span className="legend-pin" /> Offre d’emploi</div>
      <div className="map-markers" aria-label="Offres disponibles sur la carte">
        {offers.map((offer, index) => {
          const isSelected = offer.id === selectedOfferId
          return (
            <button key={offer.id} type="button" className={`marker${isSelected ? ' marker-selected' : ''}`} style={{ top: `${offer.position.top}%`, left: `${offer.position.left}%` }} aria-label={`${offer.title}, ${offer.company}, ${offer.city}`} aria-pressed={isSelected} onClick={() => onSelectOffer(offer)}>
              <span>{index + 1}</span>
            </button>
          )
        })}
      </div>
      <div className="map-scale" aria-hidden="true"><span />2 km</div>
      <p className="map-notice">Aperçu cartographique de démonstration</p>
    </div>
  )
}

export default MapDemo
