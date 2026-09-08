import { useEffect, useRef, useState } from 'react'
import LegalModal from './LegalModal.jsx'

// Modale de connexion existante : formulaire e-mail/mot de passe, focus
// automatique sur le champ e-mail à l'ouverture, fermeture au clavier (Échap)
// ou au clic sur le fond, et affichage d'une erreur de connexion le cas échéant.
function LoginModal({ isOpen, onClose, onSubmit, isSubmitting, error, onSwitchToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const emailRef = useRef(null)
  // Etat d'ouverture du panneau "mot de passe oublié".
  const [isForgotOpen, setIsForgotOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return undefined
    emailRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

    //On les vide dès que la modale se ferme, quelle
  // qu'en soit la raison (connexion réussie, annulation, Échap, clic hors
  // de la modale). Passe par la fonction de nettoyage de l'effet plutôt
  // que par un setState en plein corps d'effet.
  useEffect(() => {
    if (!isOpen) return undefined
    return () => {
      setEmail('')
      setPassword('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({ email, password })
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer la connexion">
          ×
        </button>
        <p className="eyebrow">Espace personnel</p>
        <h2 id="login-title">Se connecter</h2>
        <p className="modal-intro">Connectez-vous avec votre adresse e-mail.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Adresse e-mail</label>
          {/* autoComplete="off" sur les deux champs : le
              navigateur ne doit ni proposer ni réinjecter automatiquement
              une valeur enregistrée. Ces champs se ressaisissent
              manuellement à chaque connexion. */}
          <input
            ref={emailRef}
            id="email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            autoComplete="off"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {/* lien "mot de passe oublié". Ouvre un panneau
              d'information plutôt que de simuler un envoi d'e-mail : le
              backend n'a pas d'endpoint de réinitialisation pour l'instant
              (voir le contenu du panneau, et le point signalé dans le chat). */}
          <p className="forgot-password">
            <button type="button" className="inline-link" onClick={() => setIsForgotOpen(true)}>
              Mot de passe oublié ?
            </button>
          </p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="submit-login" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        {/* passerelle vers l'inscription. */}
        <p className="modal-switch">
          Pas encore de compte ?{' '}
          <button type="button" className="inline-link" onClick={onSwitchToRegister}>
            Créer un compte
          </button>
        </p>
      </section>

      <LegalModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} title="Mot de passe oublié">
        <p>
          La réinitialisation automatique par e-mail n’est pas encore disponible sur ce démonstrateur
          technique : elle nécessite un endpoint backend dédié (envoi d’un lien à usage unique), qui n’existe
          pas encore dans cette version.
        </p>
        <p>
          En attendant, si vous avez perdu l’accès à un compte de test, le plus simple est de créer un
          nouveau compte avec une autre adresse e-mail.
        </p>
      </LegalModal>
    </div>
  )
}

export default LoginModal