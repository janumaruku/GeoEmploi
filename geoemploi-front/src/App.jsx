import { useState } from 'react'
import './App.css'
import { login, logout as apiLogout, registerUser } from './api/auth.js'
import { getToken, setToken as storeToken } from './api/authToken.js'
import LoginModal from './components/LoginModal.jsx'
import MapView from './components/MapView.jsx'
import OfferCard from './components/OfferCard.jsx'
import RegisterModal from './components/RegisterModal.jsx'
import SearchLocation from './components/SearchLocation.jsx'
import StatusMessage from './components/StatusMessage.jsx'
import { demoOffers } from './data/demoOffers.js'

function normalizeText(value) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function App() {
  const [selectedOffer, setSelectedOffer] = useState(demoOffers[0])
  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [token, setToken] = useState(() => getToken())
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [registrationMessage, setRegistrationMessage] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [geolocationLoading, setGeolocationLoading] = useState(false)
  const [geolocationMessage, setGeolocationMessage] = useState('')

  const searchedCity = normalizeText(activeQuery)
  const visibleOffers = activeQuery
    ? demoOffers.filter((offer) => normalizeText(offer.address).includes(searchedCity))
    : demoOffers

  function closeLogin() {
    if (isSubmitting) return
    setIsLoginOpen(false)
    setLoginError('')
  }

  const handleSearch = () => {
    const cleanedQuery = query.trim().replace(/\s+/g, ' ')
    setActiveQuery(cleanedQuery)
    const normalizedQuery = normalizeText(cleanedQuery)
    const firstMatch = demoOffers.find((offer) => {
      return normalizeText(offer.address).includes(normalizedQuery)
    })
    setSelectedOffer(firstMatch || null)
  }

  const clearSearch = () => {
    setQuery('')
    setActiveQuery('')
    setSelectedOffer(demoOffers[0])
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeolocationMessage('La géolocalisation n’est pas disponible. Vous pouvez rechercher une commune manuellement.')
      return
    }

    setGeolocationLoading(true)
    setGeolocationMessage('Recherche de votre position…')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setGeolocationLoading(false)
        setGeolocationMessage('Votre position est utilisée uniquement pour cette session et n’est pas enregistrée.')
      },
      (error) => {
        setGeolocationLoading(false)

        if (error.code === error.PERMISSION_DENIED) {
          setGeolocationMessage('La géolocalisation a été refusée. Vous pouvez rechercher une commune manuellement.')
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGeolocationMessage('Votre position est indisponible. Vous pouvez rechercher une commune manuellement.')
        } else if (error.code === error.TIMEOUT) {
          setGeolocationMessage('La recherche de votre position a expiré. Vous pouvez réessayer.')
        } else {
          setGeolocationMessage('Impossible de récupérer votre position. Vous pouvez rechercher une commune manuellement.')
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  const stopUsingLocation = () => {
    setUserLocation(null)
    setGeolocationLoading(false)
    setGeolocationMessage('')
  }

  const handleLogin = async ({ email, password }) => {
    setIsSubmitting(true)
    setLoginError('')
    try {
      const result = await login(email, password)
      storeToken(result.access_token)
      setToken(result.access_token)
      setIsLoginOpen(false)
    } catch {
      setLoginError('Connexion impossible.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (role, form) => {
    setIsSubmitting(true)
    setRegistrationMessage(null)
    const profile = role === 'job_seeker'
      ? { job_seeker_profile: { first_name: form.firstName, last_name: form.lastName } }
      : { employer_profile: { company_name: form.companyName, siret: form.siret } }
    try {
      await registerUser({
        email: form.email,
        password: form.password,
        role,
        ...profile,
      })
      setRegistrationMessage({ ok: true, text: role === 'employer' ? 'Compte employeur créé.' : 'Compte créé.' })
    } catch {
      setRegistrationMessage({ ok: false, text: 'Impossible de créer le compte.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const logout = () => {
    apiLogout()
    setToken(null)
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar-left">
          <div className="ministere" aria-label="Ministère du Job et Bonheur"><span>MINISTÈRE</span><span>DU JOB ET BONHEUR</span></div>
          <div className="separator" aria-hidden="true" />
          <h1 className="logo">GéoEmploi</h1>
        </div>
        <nav className="navbar-right" aria-label="Espace personnel">
          {token ? (
            <button className="login-button" onClick={logout}>Se déconnecter</button>
          ) : (
            <button className="login-button" onClick={() => setIsLoginOpen(true)}>Se connecter</button>
          )}
          {!token && (
            <button
              className="register-button"
              onClick={() => {
                setRegistrationMessage(null)
                setIsRegisterOpen(true)
              }}
            >
              S’enregistrer
            </button>
          )}
        </nav>
      </header>

      <main>
        <div className="workspace">
          <section className="map-section" aria-labelledby="map-title">
            <SearchLocation
              query={query}
              onQueryChange={setQuery}
              onSearch={handleSearch}
              onClear={clearSearch}
              onUseLocation={useMyLocation}
              onStopLocation={stopUsingLocation}
              isUsingLocation={Boolean(userLocation)}
              geolocationLoading={geolocationLoading}
              geolocationMessage={geolocationMessage}
            />
            <div className="map-heading">
              <div>
                <p className="eyebrow">Offres géolocalisées</p>
                <h2 id="map-title">
                  {activeQuery ? `Offres à ${activeQuery}` : 'Rechercher des offres'}
                </h2>
              </div>
              <p className="result-count"><strong>{visibleOffers.length}</strong> offre{visibleOffers.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="map-shell">
              {visibleOffers.length === 0 ? (
                <StatusMessage type="search-empty" />
              ) : (
                <MapView
                  offers={visibleOffers}
                  selectedOfferId={selectedOffer?.id}
                  onSelectOffer={setSelectedOffer}
                  fitOffers={Boolean(activeQuery)}
                  userLocation={userLocation}
                />
              )}
            </div>
          </section>
          <aside className="offer-panel" aria-label="Détail de l’offre sélectionnée">
            <OfferCard
              offer={selectedOffer}
              isAuthenticated={Boolean(token)}
              onLogin={() => setIsLoginOpen(true)}
              onRegister={() => { setRegistrationMessage(null); setIsRegisterOpen(true) }}
            />
          </aside>
        </div>
      </main>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={closeLogin}
        onSubmit={handleLogin}
        isSubmitting={isSubmitting}
        error={loginError}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => {
          if (!isSubmitting) setIsRegisterOpen(false)
        }}
        onSubmit={handleRegister}
        isSubmitting={isSubmitting}
        message={registrationMessage}
      />
    </div>
  )
}

export default App
