import { useState } from 'react'
import './App.css'
import MapDemo from './components/MapDemo.jsx'
import OfferCard from './components/OfferCard.jsx'
import { demoOffers } from './data/demoOffers.js'

function App() {
  const [selectedOffer, setSelectedOffer] = useState(demoOffers[0])

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar-left">
          <div className="ministere" aria-label="Ministère du Job et Bonheur">
            <span>MINISTÈRE</span>
            <span>DU JOB ET BONHEUR</span>
          </div>
          <div className="separator" aria-hidden="true" />
          <h1 className="logo">GéoEmploi</h1>
        </div>

        <nav className="navbar-right" aria-label="Espace personnel">
          <button className="login-button">Se connecter</button>
          <button className="register-button">S’enregistrer</button>
        </nav>
      </header>

      <main className="workspace">
        <section className="map-section" aria-labelledby="map-title">
          <div className="map-heading">
            <div>
              <p className="eyebrow">Explorer les opportunités</p>
              <h2 id="map-title">Les offres autour de vous</h2>
            </div>
            <p className="result-count"><strong>{demoOffers.length}</strong> offres disponibles</p>
          </div>
          <MapDemo offers={demoOffers} selectedOfferId={selectedOffer?.id} onSelectOffer={setSelectedOffer} />
        </section>

        <aside className="offer-panel" aria-label="Détail de l’offre sélectionnée">
          <OfferCard offer={selectedOffer} />
        </aside>
      </main>
    </div>
  )
}

export default App
