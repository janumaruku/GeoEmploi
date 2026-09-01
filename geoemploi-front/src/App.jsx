import './App.css'

function App() {
  return (
    <div className="app">
      <header className="navbar">

        <div className="navbar-left">
          <div className="ministere">
            <span>MINISTÈRE</span>
            <span>DU JOB ET BONHEUR</span>
          </div>

          <div className="separator"></div>

          <h1 className="logo">GéoEmploi</h1>
        </div>

        <nav className="navbar-right">
          <button className="login-button">
            Se connecter
          </button>

          <button className="register-button">
            S’enregistrer
          </button>
        </nav>

      </header>

      <main className="map-container">

        <div className="fake-map">

          <div className="map-label">
            Carte des offres
          </div>

          <button
            className="marker marker-1"
            aria-label="Offre d'emploi"
          ></button>

          <button
            className="marker marker-2"
            aria-label="Offre d'emploi"
          ></button>

          <button
            className="marker marker-3"
            aria-label="Offre d'emploi"
          ></button>

          <button
            className="marker marker-4"
            aria-label="Offre d'emploi"
          ></button>

        </div>

      </main>
    </div>
  )
}

export default App