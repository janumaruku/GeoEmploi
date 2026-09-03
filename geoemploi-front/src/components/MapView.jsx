import { useEffect, useMemo, useState } from 'react'
import { divIcon } from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const PARIS = [48.8566, 2.3522]
const tileUrl = import.meta.env.VITE_MAP_TILE_URL || '/api/v1/map/tiles/{z}/{x}/{y}'

function RecenterMap({ center, offers, fitOffers }) {
  const map = useMap()
  useEffect(() => {
    if (center && !fitOffers) {
      map.setView(center, 12)
      return
    }
    const positions = offers.map((offer) => [Number(offer.latitude), Number(offer.longitude)])
    if (fitOffers && positions.length > 1) map.fitBounds(positions, { padding: [35, 35], maxZoom: 13 })
    else if (fitOffers && positions.length === 1) map.setView(positions[0], 13)
    else map.setView(PARIS, 11)
  }, [center, fitOffers, map, offers])
  return null
}

const offerIcon = (number, selected) => divIcon({
  className: '',
  html: `<span class="leaflet-offer-marker${selected ? ' is-selected' : ''}"><b>${number}</b></span>`,
  iconSize: [38, 46],
  iconAnchor: [19, 43],
})

const userIcon = divIcon({
  className: '',
  html: '<span class="leaflet-user-marker" aria-hidden="true"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
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
            {Number.isFinite(offer.distanceKm) && <small>À {offer.distanceKm.toFixed(1).replace('.', ',')} km</small>}
          </button>
        ))}
      </div>
    </div>
  )
}

function MapView({ offers, selectedOfferId, onSelectOffer, center, userLocation, fitOffers }) {
  const [tileError, setTileError] = useState(false)
  const mappableOffers = useMemo(
    () => offers.filter((offer) => Number.isFinite(Number(offer.latitude)) && Number.isFinite(Number(offer.longitude))),
    [offers],
  )
  const unlocatedOffers = useMemo(
    () => offers.filter((offer) => !Number.isFinite(Number(offer.latitude)) || !Number.isFinite(Number(offer.longitude))),
    [offers],
  )

  if (!tileUrl) return <OffersFallback offers={offers} selectedOfferId={selectedOfferId} onSelectOffer={onSelectOffer} />

  return (
    <>
      <MapContainer className="leaflet-map" center={center || PARIS} zoom={11} scrollWheelZoom>
        <TileLayer url={tileUrl} attribution="&copy; IGN Géoplateforme" eventHandlers={{ tileerror: () => setTileError(true), tileload: () => setTileError(false) }} />
        <RecenterMap center={center} offers={mappableOffers} fitOffers={fitOffers} />
        {mappableOffers.map((offer, index) => (
          <Marker key={offer.id} position={[Number(offer.latitude), Number(offer.longitude)]} icon={offerIcon(index + 1, offer.id === selectedOfferId)} eventHandlers={{ click: () => onSelectOffer(offer) }} title={offer.title} />
        ))}
        {userLocation && <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon} title="Votre position" />}
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
