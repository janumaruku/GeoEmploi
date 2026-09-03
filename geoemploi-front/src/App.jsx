import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { createApplication } from './api/applications.js'
import { login } from './api/auth.js'
import { getOffers } from './api/offers.js'
import LoginModal from './components/LoginModal.jsx'
import MapView from './components/MapView.jsx'
import OfferCard from './components/OfferCard.jsx'
import SearchLocation from './components/SearchLocation.jsx'
import StatusMessage from './components/StatusMessage.jsx'
import { distanceInKm } from './utils/distance.js'

const normalizeText = (value) => value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const hasCoordinates = (offer) => Number.isFinite(Number(offer.latitude)) && Number.isFinite(Number(offer.longitude))

const applicationErrorMessage = (error) => {
  if (error.status === 409) return 'Vous avez déjà candidaté à cette offre.'
  if (error.status === 403) return 'Seul un compte candidat peut envoyer une candidature.'
  if (error.status === 404) return 'Cette offre n’est plus disponible.'
  if (error.status === 401) return 'Votre session a expiré. Veuillez vous reconnecter.'
  return error.message
}

function App() {
  const [offers, setOffers] = useState([])
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const [locationMessage, setLocationMessage] = useState('')
  const [registrationMessage, setRegistrationMessage] = useState('')
  const [token, setToken] = useState(() => sessionStorage.getItem('geoemploi_token'))
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [pendingOffer, setPendingOffer] = useState(null)
  const [applicationState, setApplicationState] = useState({ status: 'idle', message: '' })

  useEffect(() => {
    getOffers().then((data) => {
      const validOffers = data.filter(hasCoordinates)
      setOffers(validOffers)
      setSelectedOffer(validOffers[0] ?? null)
      setLoadState(validOffers.length ? 'success' : 'empty')
    }).catch(() => setLoadState('error'))
  }, [])

  const visibleOffers = useMemo(() => {
    let result = offers
    if (activeQuery) {
      const normalizedQuery = normalizeText(activeQuery)
      result = result.filter((offer) => normalizeText(offer.address || '').includes(normalizedQuery))
    }
    if (userLocation) {
      result = result.map((offer) => ({
        ...offer,
        distanceKm: distanceInKm(userLocation, { latitude: Number(offer.latitude), longitude: Number(offer.longitude) }),
      })).sort((a, b) => a.distanceKm - b.distanceKm)
    }
    return result
  }, [activeQuery, offers, userLocation])

  const mapCenter = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : visibleOffers[0] ? [Number(visibleOffers[0].latitude), Number(visibleOffers[0].longitude)] : null

  const closeLogin = useCallback(() => {
    if (!isLoggingIn) { setIsLoginOpen(false); setLoginError(''); setPendingOffer(null) }
  }, [isLoggingIn])

  const selectOffer = (offer) => {
    setSelectedOffer(offer)
    setApplicationState({ status: 'idle', message: '' })
  }

  const handleSearch = () => {
    const cleanedQuery = query.trim().replace(/\s+/g, ' ')
    setActiveQuery(cleanedQuery)
    setUserLocation(null)
    setLocationMessage('')
    const firstMatch = offers.find((offer) => normalizeText(offer.address || '').includes(normalizeText(cleanedQuery)))
    setSelectedOffer(firstMatch ?? null)
  }

  const clearSearch = () => {
    setQuery('')
    setActiveQuery('')
    setSelectedOffer(offers[0] ?? null)
  }

  const useMyLocation = () => {
    setLocationMessage('Recherche de votre position…')
    if (!navigator.geolocation) {
      setLocationMessage('La géolocalisation n’est pas disponible. Vous pouvez rechercher une commune manuellement.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = { latitude: coords.latitude, longitude: coords.longitude }
        setUserLocation(position)
        setActiveQuery('')
        setQuery('')
        setLocationMessage('Les offres sont classées de la plus proche à la plus éloignée.')
        const closest = [...offers].sort((a, b) => distanceInKm(position, a) - distanceInKm(position, b))[0]
        setSelectedOffer(closest ?? null)
      },
      () => setLocationMessage('Position non utilisée. Vous pouvez rechercher une commune manuellement.'),
      { enableHighAccuracy: false, timeout: 10000 },
    )
  }

  const removeLocation = () => {
    setUserLocation(null)
    setLocationMessage('Position retirée.')
    setSelectedOffer(offers[0] ?? null)
  }

  const submitApplication = async (offer, accessToken) => {
    setApplicationState({ status: 'loading', message: 'Envoi de la candidature…' })
    try {
      await createApplication(offer.id, accessToken)
      setApplicationState({ status: 'success', message: 'Candidature envoyée avec succès.' })
    } catch (error) {
      if (error.status === 401) { sessionStorage.removeItem('geoemploi_token'); setToken(null) }
      setApplicationState({ status: 'error', message: applicationErrorMessage(error) })
    }
  }

  const handleApply = (offer) => {
    setApplicationState({ status: 'idle', message: '' })
    if (!token) { setPendingOffer(offer); setIsLoginOpen(true); return }
    submitApplication(offer, token)
  }

  const handleLogin = async ({ email, password }) => {
    setIsLoggingIn(true); setLoginError('')
    try {
      const result = await login(email, password)
      sessionStorage.setItem('geoemploi_token', result.access_token)
      setToken(result.access_token); setIsLoginOpen(false)
      const offerToApply = pendingOffer
      setPendingOffer(null)
      if (offerToApply) await submitApplication(offerToApply, result.access_token)
    } catch (error) {
      setLoginError(error.status === 401 ? 'Adresse e-mail ou mot de passe incorrect.' : error.message)
    } finally { setIsLoggingIn(false) }
  }

  const heading = userLocation ? 'Offres autour de vous' : activeQuery ? `Offres à ${activeQuery}` : 'Rechercher des offres'

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar-left">
          <div className="ministere" aria-label="Ministère du Job et Bonheur"><span>MINISTÈRE</span><span>DU JOB ET BONHEUR</span></div>
          <div className="separator" aria-hidden="true" /><h1 className="logo">GéoEmploi</h1>
        </div>
        <nav className="navbar-right" aria-label="Espace personnel">
          <button className="login-button" onClick={() => setIsLoginOpen(true)}>{token ? 'Connecté' : 'Se connecter'}</button>
          <button className="register-button" aria-describedby={registrationMessage ? 'registration-message' : undefined} onClick={() => setRegistrationMessage('L’inscription sera disponible prochainement.')}>S’enregistrer</button>
        </nav>
        {registrationMessage && <p id="registration-message" className="registration-message" role="status">{registrationMessage}</p>}
      </header>
      <main className="workspace">
        <section className="map-section" aria-labelledby="map-title">
          <SearchLocation query={query} onQueryChange={setQuery} onSearch={handleSearch} onClear={clearSearch} userLocation={userLocation} onUseLocation={useMyLocation} onRemoveLocation={removeLocation} locationMessage={locationMessage} />
          <div className="map-heading">
            <div><p className="eyebrow">Explorer les opportunités</p><h2 id="map-title">{heading}</h2></div>
            {loadState === 'success' && <p className="result-count"><strong>{visibleOffers.length}</strong> offre{visibleOffers.length !== 1 ? 's' : ''}</p>}
          </div>
          {loadState !== 'success' ? <div className="map-shell"><StatusMessage type={loadState} /></div>
            : visibleOffers.length === 0 ? <div className="map-shell"><StatusMessage type="search-empty" /></div>
              : <div className="map-shell"><MapView offers={visibleOffers} selectedOfferId={selectedOffer?.id} onSelectOffer={selectOffer} center={mapCenter} userLocation={userLocation} /></div>}
        </section>
        <aside className="offer-panel" aria-label="Détail de l’offre sélectionnée">
          <OfferCard offer={selectedOffer} onApply={handleApply} applicationState={applicationState} />
        </aside>
      </main>
      <LoginModal isOpen={isLoginOpen} onClose={closeLogin} onSubmit={handleLogin} isSubmitting={isLoggingIn} error={loginError} />
    </div>
  )
}

export default App
