import { useCallback, useMemo, useState } from 'react'
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

const normalizeText = (value) => value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

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

  const visibleOffers = useMemo(() => {
    if (!activeQuery) return demoOffers
    const searched = normalizeText(activeQuery)
    return demoOffers.filter((offer) => normalizeText(offer.address).includes(searched))
  }, [activeQuery])

  const closeLogin = useCallback(() => {
    if (!isSubmitting) { setIsLoginOpen(false); setLoginError('') }
  }, [isSubmitting])

  const handleSearch = () => {
    const cleanedQuery = query.trim().replace(/\s+/g, ' ')
    setActiveQuery(cleanedQuery)
    const firstMatch = demoOffers.find((offer) => normalizeText(offer.address).includes(normalizeText(cleanedQuery)))
    setSelectedOffer(firstMatch || null)
  }

  const clearSearch = () => {
    setQuery('')
    setActiveQuery('')
    setSelectedOffer(demoOffers[0])
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
      await registerUser({ email: form.email, password: form.password, role, ...profile })
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
          {token ? <button className="login-button" onClick={logout}>Se déconnecter</button> : <button className="login-button" onClick={() => setIsLoginOpen(true)}>Se connecter</button>}
          {!token && <button className="register-button" onClick={() => { setRegistrationMessage(null); setIsRegisterOpen(true) }}>S’enregistrer</button>}
        </nav>
      </header>

      <main>
        <div className="workspace">
          <section className="map-section" aria-labelledby="map-title">
            <SearchLocation query={query} onQueryChange={setQuery} onSearch={handleSearch} onClear={clearSearch} />
            <div className="map-heading">
              <div><p className="eyebrow">Offres géolocalisées</p><h2 id="map-title">{activeQuery ? `Offres à ${activeQuery}` : 'Rechercher des offres'}</h2></div>
              <p className="result-count"><strong>{visibleOffers.length}</strong> offre{visibleOffers.length !== 1 ? 's' : ''}</p>
            </div>
            {visibleOffers.length === 0 ? <div className="map-shell"><StatusMessage type="search-empty" /></div>
              : <div className="map-shell"><MapView offers={visibleOffers} selectedOfferId={selectedOffer?.id} onSelectOffer={setSelectedOffer} fitOffers={Boolean(activeQuery)} /></div>}
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

      <LoginModal isOpen={isLoginOpen} onClose={closeLogin} onSubmit={handleLogin} isSubmitting={isSubmitting} error={loginError} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => { if (!isSubmitting) setIsRegisterOpen(false) }} onSubmit={handleRegister} isSubmitting={isSubmitting} message={registrationMessage} />
    </div>
  )
}

export default App
