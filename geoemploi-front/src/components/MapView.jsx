import { useEffect, useState } from 'react'
import { divIcon } from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const PARIS = [48.8566, 2.3522]
const tileUrl = import.meta.env.VITE_MAP_TILE_URL || '/api/v1/map/tiles/{z}/{x}/{y}'

function RecenterMap({ offers, fitOffers }) {
  const map = useMap()
  useEffect(() => {
    const positions = offers.map((offer) => [Number(offer.latitude), Number(offer.longitude)])
    if (positions.length > 1) {
      map.fitBounds(positions, {
        padding: [35, 35],
        maxZoom: fitOffers ? 13 : 6,
      })
    } else if (positions.length === 1) {
      map.setView(positions[0], 13)
    } else {
      map.setView(PARIS, 11)
    }
  }, [fitOffers, map, offers])
  return null
}

const offerIcon = (selected) => divIcon({
  className: '',
  html: `<span class="leaflet-offer-marker${selected ? ' is-selected' : ''}" aria-hidden="true"></span>`,
  iconSize: [38, 46],
  iconAnchor: [19, 43],
})

function OffersFallback({ offers, selectedOfferId, onSelectOffer }) {
  return (
    <div className="map-fallback">
      <div className="map-unavailable" role="status">
        <span aria-hidden="true">⌖</span>
        <h3>Le fond cartographique est momentanément indisponible.</h3>
        <p>Les offres restent accessibles ci-dessous.</p>
      </div>
      <div className="fallback-offers" aria-label="Liste des offres">
        {offers.map((offer) => (
          <button key={offer.id} type="button" className={offer.id === selectedOfferId ? 'is-selected' : ''} onClick={() => onSelectOffer(offer)}>
            <strong>{offer.title}</strong><span>{offer.address}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function MapView({ offers, selectedOfferId, onSelectOffer, fitOffers }) {
  const [tileError, setTileError] = useState(false)
  const hasCoordinates = (offer) => {
    return Number.isFinite(Number(offer.latitude)) && Number.isFinite(Number(offer.longitude))
  }

  const mappableOffers = offers.filter(hasCoordinates)
  const unlocatedOffers = offers.filter((offer) => !hasCoordinates(offer))

  if (!tileUrl) {
    return (
      <OffersFallback
        offers={offers}
        selectedOfferId={selectedOfferId}
        onSelectOffer={onSelectOffer}
      />
    )
  }

  return (
    <>
      <MapContainer className="leaflet-map" center={PARIS} zoom={11} scrollWheelZoom>
        <TileLayer url={tileUrl} attribution="&copy; IGN Géoplateforme" eventHandlers={{ tileerror: () => setTileError(true), tileload: () => setTileError(false) }} />
        <RecenterMap offers={mappableOffers} fitOffers={fitOffers} />
        {mappableOffers.map((offer) => (
          <Marker key={offer.id} position={[Number(offer.latitude), Number(offer.longitude)]} icon={offerIcon(offer.id === selectedOfferId)} eventHandlers={{ click: () => onSelectOffer(offer) }} title={offer.title} />
        ))}
      </MapContainer>
      {tileError && <p className="tile-error" role="status">Le fond cartographique est momentanément indisponible. Les offres restent consultables.</p>}
      {unlocatedOffers.length > 0 && (
        <div className="unlocated-offers" aria-label="Offres sans coordonnées cartographiques">
          <strong>Autres offres</strong>
          {unlocatedOffers.map((offer) => <button key={offer.id} type="button" onClick={() => onSelectOffer(offer)}>{offer.title}</button>)}
        </div>
      )}
    </>
  )
}

export default MapView
