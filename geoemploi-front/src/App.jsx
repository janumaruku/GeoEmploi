import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // État pour l'écran de chargement
  const [isLoading, setIsLoading] = useState(true);

  //Afficher ou masquer la modale de connexion
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  // Gérer le type d'utilisateur sélectionné (Demandeur ou Entreprise)
  const [role, setRole] = useState('demandeur');

  // afficher ou masquer la modale d'inscription
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  // Gérer le type d'utilisateur sélectionné pour l'inscription
  const [registerRole, setRegisterRole] = useState('demandeur');

  // chargement (2 secondes)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // écran de chargement 
  if (isLoading) {
    return (
      <div className="loader-screen">
        <div className="loader-content">
          <div className="ministere">
            <span>MINISTÈRE</span>
            <span>DU JOB ET BONHEUR</span>
          </div>
           <div className="separator"></div>
          <h1 className="logo">ChomageGo</h1>
          <div className="loader-spinner"></div>
          <p className="loader-text">Chargement des données géolocalisées...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="logo">ChomageGo</h1>
        </div>

        <nav className="navbar-right">
          {/* isLoginOpen à true pour ouvrir la modale */}
          <button className="login-button" onClick={() => setIsLoginOpen(true)}>
            Se connecter
          </button>

          {/* modale d'inscription */}
          <button className="register-button" onClick={() => setIsRegisterOpen(true)}>
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
      {/* isLoginOpen est vrai, affiche la div qui se superpose à l'application */}
      {isLoginOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* fermer la modale (repasse isLoginOpen à false) */}
            <button className="close-btn" onClick={() => setIsLoginOpen(false)}>X</button>
            
            <h2>Connexion</h2>

            {/* rôle */}
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

            {/* form de connexion */}
            <form className="login-form">
              <div className="input-group">
                <label>
                  {role === 'demandeur' 
                    ? "Email, Nom d'utilisateur ou N° de téléphone" 
                    : "Email professionnel"}
                </label>
                <input 
                  type={role === 'entreprise' ? 'email' : 'text'} 
                  placeholder={
                    role === 'demandeur' 
                      ? "identifiant..." 
                      : "prenom.nom@entreprise.com"
                  } 
                  required 
                />
              </div>

              <div className="input-group">
                <label>Mot de passe</label>
                <input type="password" placeholder="mot de passe..." required />
              </div>

              <button type="submit" className="submit-btn">
                Se connecter en tant que {role === 'demandeur' ? 'Candidat' : 'Employeur'}
              </button>
            </form>

            {/*<div className="divider">OU</div>*/}

            {/* Connexion Google }
            <button className="google-btn">
              Se connecter avec Google
            </button>
      */}
          </div>
        </div>
      )}

      {/* MODALE D'INSCRIPTION */}
      {/* Si isRegisterOpen est vrai, on affiche cette modale */}
      {isRegisterOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/*fermer la modale d'inscription */}
            <button className="close-btn" onClick={() => setIsRegisterOpen(false)}>X</button>
            
            <h2>Créer un compte</h2>

            {/* rôle pour l'inscription */}
            <div className="role-tabs">
              <button 
                className={registerRole === 'demandeur' ? 'active' : ''} 
                onClick={() => setRegisterRole('demandeur')}
              >
                Candidat
              </button>
              <button 
                className={registerRole === 'entreprise' ? 'active' : ''} 
                onClick={() => setRegisterRole('entreprise')}
              >
                Recruteur
              </button>
            </div>

            {/* form d'inscription dynamique */}
            <form className="login-form">
              
              {/* Affichage conditionnel des champs selon le rôle */}
              {registerRole === 'demandeur' ? (
                <>
                  {/* Champs Demandeur d'emploi */}
                  <div className="input-group">
                    <label>Prénom</label>
                    <input type="text" placeholder="prénom..." required />
                  </div>
                  <div className="input-group">
                    <label>Nom</label>
                    <input type="text" placeholder="nom..." required />
                  </div>
                  <div className="input-group">
                    <label>Email</label>
                    <input type="email" placeholder="adresse email..." required />
                  </div>
                </>
              ) : (
                <>
                  {/* Champs Entreprise */}
                  <div className="input-group">
                    <label>Nom de l'entreprise</label>
                    <input type="text" placeholder="Raison sociale de l'entreprise..." required />
                  </div>
                  <div className="input-group">
                    <label>Email professionnel</label>
                    <input type="email" placeholder="prenom.nom@entreprise.com" required />
                  </div>
                  <div className="input-group">
                    <label>Numéro SIRET (Optionnel)</label>
                    <input type="text" placeholder="Ex: 123 456 789 00012" />
                  </div>
                </>
              )}

              {/* Champ commun aux deux (Mot de passe) */}
              <div className="input-group">
                <label>Créer un mot de passe</label>
                <input type="password" placeholder="Choisis un mot de passe sécurisé..." required />
              </div>

              <button type="submit" className="submit-btn">
                S'inscrire en tant que {registerRole === 'demandeur' ? 'Candidat' : 'Employeur'}
              </button>
            </form>

            {/*<div className="divider">OU</div>*/}

            {/* Inscription Google}
            <button className="google-btn">
              S'inscrire avec Google
            </button>
      */}
          </div>
        </div>
      )}

    </div>
  )
}

export default App;
