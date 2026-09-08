import { useEffect, useState } from 'react'
import './App.css'
import { applyToOffer } from './api/applications.js'
import { login, logout as apiLogout, registerUser } from './api/auth.js'
import { getToken, getUserIdFromToken, setToken as storeToken } from './api/authToken.js'
import { getOffers } from './api/offers.js'
// connexion/enregistrement complets : il faut savoir QUI est
// connecté (candidat ou employeur) pour proposer le bon espace ensuite.
import { getUser } from './api/users.js'
import EmployerDashboard from './components/EmployerDashboard.jsx'
import LoginModal from './components/LoginModal.jsx'
import MapView from './components/MapView.jsx'
import MyApplications from './components/MyApplications.jsx'
import OfferCard from './components/OfferCard.jsx'
import RegisterModal from './components/RegisterModal.jsx'
import SearchLocation from './components/SearchLocation.jsx'
import StatusMessage from './components/StatusMessage.jsx'

function normalizeText(value) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function App() {
  const [offers, setOffers] = useState([])
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [offersLoading, setOffersLoading] = useState(true)
  const [offersError, setOffersError] = useState(false)
  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  // recherche par métier/mot-clé, en plus de la commune.
  // `keyword` = ce que l'utilisateur tape, `activeKeyword` = ce sur quoi on
  // filtre réellement (appliqué au clic sur « Rechercher », comme pour la
  // commune, pour ne pas refiltrer 1000 offres à chaque touche).
  const [keyword, setKeyword] = useState('')
  const [activeKeyword, setActiveKeyword] = useState('')
  const [token, setToken] = useState(() => getToken())
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [registrationMessage, setRegistrationMessage] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [geolocationLoading, setGeolocationLoading] = useState(false)
  const [geolocationMessage, setGeolocationMessage] = useState('')

  // connexion/enregistrement complets + dashboard employeur
  // + parcours de candidature
  // `currentUser` porte le profil complet (rôle, job_seeker_profile ou
  // employer_profile) une fois connecté. `view` bascule entre la recherche
  // d'offres (par défaut), le tableau de bord employeur, et l'espace
  // "Mes candidatures" du candidat.
  const [currentUser, setCurrentUser] = useState(null)
  const [view, setView] = useState('offers')

  useEffect(() => {
    let cancelled = false
    async function loadCurrentUser() {
      if (!token) {
        if (!cancelled) setCurrentUser(null)
        return
      }
      const userId = getUserIdFromToken(token)
      if (!userId) {
        // Token illisible : on nettoie une session invalide plutôt que de
        // rester bloqué avec un token qu'on ne peut pas exploiter.
        apiLogout()
        if (!cancelled) { setToken(null); setCurrentUser(null) }
        return
      }
      try {
        const user = await getUser(userId)
        if (!cancelled) setCurrentUser(user)
      } catch {
        if (!cancelled) setCurrentUser(null)
      }
    }
    loadCurrentUser()
    return () => { cancelled = true }
  }, [token])

  useEffect(() => {
    async function loadOffers() {
      try {
        const apiOffers = await getOffers()
        // Chaque offre recevait des valeurs fixes, jamais
        // tirées de ce que l'employeur avait réellement saisi à la création :
        // const formattedOffers = apiOffers.map((offer) => ({
        //   ...offer,
        //   company: `Employeur n°${offer.employer_id}`,
        //   contract: 'Contrat à préciser',
        //   description: offer.description || 'La description de cette offre sera bientôt disponible.',
        //   missions: ['Prendre connaissance des missions détaillées avec l’employeur.'],
        //   profile: 'Le profil recherché sera précisé lors des échanges avec l’employeur.',
        // }))
      
        // On garde uniquement `offer.description` telle que
        // renvoyée par le backend,  donc telle que tapée par l'employeur
        // dans le formulaire de création d'offre (EmployerDashboard.jsx).
        // `company` reste dérivé du vrai `employer_id` (pas une donnée
        // inventée), en attendant que le backend expose le nom réel de
        // l'entreprise.
        const formattedOffers = apiOffers.map((offer) => ({
          ...offer,
          company: `Employeur n°${offer.employer_id}`,
          description: offer.description || 'Aucune description n’a été renseignée par l’employeur pour cette offre.',
        }))
        setOffers(formattedOffers)
        setSelectedOffer(formattedOffers[0] || null)
      } catch {
        setOffersError(true)
      } finally {
        setOffersLoading(false)
      }
    }

    loadOffers()
  }, [])

  // Filtrage sur la commune uniquement 
  // const searchedCity = normalizeText(activeQuery)
  // const visibleOffers = activeQuery
  //   ? offers.filter((offer) => normalizeText(offer.address).includes(searchedCity))
  //   : offers

  //  On croise les deux critères (métier ET commune), chacun
  // facultatif, exactement comme sur un site d'emploi classique. Le
  // mot-clé cherche dans l'intitulé du poste et dans la description.
  const searchedCity = normalizeText(activeQuery)
  const searchedKeyword = normalizeText(activeKeyword)
  const visibleOffers = offers.filter((offer) => {
    const matchesCity = !activeQuery || normalizeText(offer.address).includes(searchedCity)
    const matchesKeyword = !activeKeyword
      || normalizeText(offer.title).includes(searchedKeyword)
      || normalizeText(offer.description).includes(searchedKeyword)
    return matchesCity && matchesKeyword
  })

  function closeLogin() {
    if (isSubmitting) return
    setIsLoginOpen(false)
    setLoginError('')
  }

  // Passerelles entre les modales de connexion et d'inscription,
  // pour ne pas obliger à fermer l'une avant de rouvrir l'autre.
  function switchToRegister() {
    setIsLoginOpen(false)
    setLoginError('')
    setRegistrationMessage(null)
    setIsRegisterOpen(true)
  }

  function switchToLogin() {
    setIsRegisterOpen(false)
    setRegistrationMessage(null)
    setLoginError('')
    setIsLoginOpen(true)
  }

  const handleSearch = () => {
    const cleanedQuery = query.trim().replace(/\s+/g, ' ')
    /// On applique aussi le mot-clé métier.
    const cleanedKeyword = keyword.trim().replace(/\s+/g, ' ')
    setActiveQuery(cleanedQuery)
    setActiveKeyword(cleanedKeyword)

    //  Sélection de la 1re offre sur le seul critère commune
    // const normalizedQuery = normalizeText(cleanedQuery)
    // const firstMatch = offers.find((offer) => {
    //   return normalizeText(offer.address).includes(normalizedQuery)
    // })
    // setSelectedOffer(firstMatch || null)
  
    // On sélectionne la 1re offre qui satisfait les DEUX critères,
    // sinon la liste de résultats et le détail affiché se contrediraient.
    const normalizedQuery = normalizeText(cleanedQuery)
    const normalizedKeyword = normalizeText(cleanedKeyword)
    const firstMatch = offers.find((offer) => {
      const matchesCity = !cleanedQuery || normalizeText(offer.address).includes(normalizedQuery)
      const matchesKeyword = !cleanedKeyword
        || normalizeText(offer.title).includes(normalizedKeyword)
        || normalizeText(offer.description).includes(normalizedKeyword)
      return matchesCity && matchesKeyword
    })
    setSelectedOffer(firstMatch || null)
  }

  const clearSearch = () => {
    setQuery('')
    setActiveQuery('')
    //On remet aussi le mot-clé à zéro.
    setKeyword('')
    setActiveKeyword('')
    setSelectedOffer(offers[0] || null)
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
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
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
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
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
    } catch (error) {
      //  AVANT :  message générique, quelle que soit la cause réelle :
      // } catch {
      //   setRegistrationMessage({ ok: false, text: 'Impossible de créer le compte.' })
      // }
    
      // NOUVEAU : on distingue au moins le cas le plus courant (adresse déjà
      // utilisée, 409 renvoyé par POST /users) du reste, pour ne pas laisser
      // la personne deviner pourquoi ça échoue.
    
      //  AVANT : confirmait explicitement qu'un compte existe pour
      // cette adresse (« Un compte existe déjà avec cette adresse
      // e-mail. ») : ça permet à n'importe qui de tester des adresses une
      // par une pour savoir lesquelles sont inscrites sur le site
      // (énumération de comptes), ne pratique déconseillée en
      // cybersécurité, même si elle reste courante sur beaucoup de sites.
  
    
      // NOUVEAU : on guide sans confirmer.
      let text = 'Impossible de créer le compte. Réessayez dans un instant.'
      if (error.status === 409) text = 'Cette inscription n’a pas pu aboutir. Si vous avez déjà un compte, connectez-vous plutôt.'
      setRegistrationMessage({ ok: false, text })
    } finally {
      setIsSubmitting(false)
    }
  }

  const logout = () => {
    apiLogout()
    setToken(null)
    // On revient à la recherche d'offres en quittant un espace
    // (dashboard employeur ou mes candidatures) qui n'a plus de sens une
    // fois déconnecté.
    setCurrentUser(null)
    setView('offers')
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar-left">
          <h1 className="logo">GéoEmploi</h1>
        </div>
        <nav className="navbar-right" aria-label="Espace personnel">
          {/* Bascule vers le tableau de bord employeur ou
              l'espace "Mes candidatures", selon le rôle du compte connecté.
              N'apparaît que lorsque le profil complet a été récupéré
              (currentUser), donc jamais pour un visiteur non connecté. */}
          {currentUser?.role === 'employer' && (
            <button
              className="login-button nav-view-button"
              aria-pressed={view === 'dashboard'}
              onClick={() => setView(view === 'dashboard' ? 'offers' : 'dashboard')}
            >
              {view === 'dashboard' ? 'Retour aux offres' : 'Tableau de bord'}
            </button>
          )}
          {currentUser?.role === 'job_seeker' && (
            <button
              className="login-button nav-view-button"
              aria-pressed={view === 'applications'}
              onClick={() => setView(view === 'applications' ? 'offers' : 'applications')}
            >
              {view === 'applications' ? 'Retour aux offres' : 'Mes candidatures'}
            </button>
          )}
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
        {/*Bascule d'affichage selon `view`. Le contenu de
            la branche "offers" ci-dessous est EXACTEMENT celui qui existait
            avant (recherche + carte + détail d'offre) : rien n'y a été
            supprimé, seulement enveloppé dans cette condition pour
            cohabiter avec le tableau de bord employeur et "Mes
            candidatures". */}
        {view === 'dashboard' && currentUser?.role === 'employer' ? (
          <EmployerDashboard currentUser={currentUser} />
        ) : view === 'applications' && currentUser?.role === 'job_seeker' ? (
          <MyApplications offers={offers} />
        ) : (
          <div className="workspace">
            <section className="map-section" aria-labelledby="map-title">
              <SearchLocation
                query={query}
                onQueryChange={setQuery}
                keyword={keyword}
                onKeywordChange={setKeyword}
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
                  {/* titre basé sur la seule commune
                  <h2 id="map-title">
                    {activeQuery ? `Offres à ${activeQuery}` : 'Rechercher des offres'}
                  </h2>
                */}
                  {/* NOUVEAU : le titre reflète les deux critères de recherche. */}
                  <h2 id="map-title">
                    {activeKeyword && activeQuery
                      ? `${activeKeyword} à ${activeQuery}`
                      : activeKeyword
                        ? `Offres « ${activeKeyword} »`
                        : activeQuery
                          ? `Offres à ${activeQuery}`
                          : 'Rechercher des offres'}
                  </h2>
                </div>
                <p className="result-count"><strong>{visibleOffers.length}</strong> offre{visibleOffers.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="map-shell">
                {offersLoading ? (
                  <StatusMessage type="loading" />
                ) : offersError ? (
                  <StatusMessage type="error" />
                ) : visibleOffers.length === 0 ? (
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
                key={selectedOffer?.id || 'empty'}
                offer={selectedOffer}
                isAuthenticated={Boolean(token)}
                userRole={currentUser?.role}
                onApply={applyToOffer}
                onLogin={() => setIsLoginOpen(true)}
                onRegister={() => { setRegistrationMessage(null); setIsRegisterOpen(true) }}
              />
            </aside>
          </div>
        )}
      </main>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={closeLogin}
        onSubmit={handleLogin}
        isSubmitting={isSubmitting}
        error={loginError}
        onSwitchToRegister={switchToRegister}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => {
          if (!isSubmitting) setIsRegisterOpen(false)
        }}
        onSubmit={handleRegister}
        isSubmitting={isSubmitting}
        message={registrationMessage}
        onSwitchToLogin={switchToLogin}
      />

      <footer className="site-footer">
        Démonstrateur technique, ne constitue pas un service public en exploitation.
      </footer>
    </div>
  )
}

export default App