import { useEffect, useRef, useState } from 'react'

function LoginModal({ isOpen, onClose, onSubmit, isSubmitting, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const emailRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined
    emailRef.current?.focus()
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({ email, password })
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer la connexion">×</button>
        <p className="eyebrow">Espace personnel</p>
        <h2 id="login-title">Se connecter</h2>
        <p className="modal-intro">Connectez-vous avec votre adresse e-mail.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Adresse e-mail</label>
          <input ref={emailRef} id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="password">Mot de passe</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="submit-login" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Connexion…' : 'Se connecter'}</button>
        </form>
      </section>
    </div>
  )
}

export default LoginModal
