import { useEffect } from 'react'
import { divIcon } from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const PARIS = [48.8566, 2.3522]
const tileUrl = import.meta.env.VITE_MAP_TILE_URL

function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => { map.setView(center, 11) }, [center, map])
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

function MapView({ offers, selectedOfferId, onSelectOffer, center, userLocation }) {
  if (!tileUrl) return <OffersFallback offers={offers} selectedOfferId={selectedOfferId} onSelectOffer={onSelectOffer} />

  return (
    <MapContainer className="leaflet-map" center={center || PARIS} zoom={11} scrollWheelZoom>
      <TileLayer url={tileUrl} attribution="&copy; IGN Géoplateforme" />
      <RecenterMap center={center || PARIS} />
      {offers.map((offer, index) => (
        <Marker key={offer.id} position={[offer.latitude, offer.longitude]} icon={offerIcon(index + 1, offer.id === selectedOfferId)} eventHandlers={{ click: () => onSelectOffer(offer) }} title={offer.title} />
      ))}
      {userLocation && <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon} title="Votre position" />}
    </MapContainer>
  )
}

export default MapView
