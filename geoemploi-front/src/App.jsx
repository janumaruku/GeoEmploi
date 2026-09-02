import { useState } from 'react';
import './App.css';

function App() {
  // État pour afficher ou masquer la modale de connexion
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  // (Demandeur d'emploi ou Entreprise)
  const [role, setRole] = useState('demandeur');

  return (
    <div className="app">
      {/* HEADER */}
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
          {/* qunad on clic sur ce bouton, on passe l'état isLoginOpen à true pour ouvrir la modale */}
          <button className="login-button" onClick={() => setIsLoginOpen(true)}>
            Se connecter
          </button>

          <button className="register-button">
            S’enregistrer
          </button>
        </nav>
      </header>

      {/* CARTE */}
      <main className="map-container">
        <div className="fake-map">
          <div className="map-label">
            Carte des offres
          </div>

          <button className="marker marker-1" aria-label="Offre d'emploi"></button>
          <button className="marker marker-2" aria-label="Offre d'emploi"></button>
          <button className="marker marker-3" aria-label="Offre d'emploi"></button>
          <button className="marker marker-4" aria-label="Offre d'emploi"></button>
        </div>
      </main>

      {/* MODALE DE CONNEXION */}
      {isLoginOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Bouton pour fermer la modale (repasse isLoginOpen à false) */}
            <button className="close-btn" onClick={() => setIsLoginOpen(false)}>X</button>
            
            <h2>Connexion</h2>

            {/* Onglets de sélection du rôle */}
            <div className="role-tabs">
              <button 
                className={role === 'demandeur' ? 'active' : ''} 
                onClick={() => setRole('demandeur')}
              >
                Recherche d'emploi
              </button>
              <button 
                className={role === 'entreprise' ? 'active' : ''} 
                onClick={() => setRole('entreprise')}
              >
                Entreprise
              </button>
            </div>

            {/* Formulaire de connexion */}
            <form className="login-form">
              <div className="input-group">
                {/* Le label s'adapte en fonction du rôle */}
                <label>
                  {role === 'demandeur' 
                    ? "Email, Nom d'utilisateur ou N° de téléphone" 
                    : "Email professionnel"}
                </label>
                <input 
                  type={role === 'entreprise' ? 'email' : 'text'} 
                  placeholder={
                    role === 'demandeur' 
                      ? "Ton identifiant..." 
                      : "prenom.nom@entreprise.com"
                  } 
                  required 
                />
              </div>

              <div className="input-group">
                <label>Mot de passe</label>
                <input type="password" placeholder="Ton mot de passe..." required />
              </div>

              <button type="submit" className="submit-btn">
                Se connecter en tant que {role === 'demandeur' ? 'Candidat' : 'Employeur'}
              </button>
            </form>

            <div className="divider">OU</div>

            {/* Connexion Google */}
            <button className="google-btn">
              Se connecter avec Google
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default App;
