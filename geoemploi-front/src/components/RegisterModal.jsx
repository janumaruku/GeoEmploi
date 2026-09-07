import { useState } from 'react'

const initialForm = {
  firstName: '',
  lastName: '',
  companyName: '',
  siret: '',
  email: '',
  password: '',
}

function RegisterModal({ isOpen, onClose, onSubmit, isSubmitting, message }) {
  const [role, setRole] = useState('job_seeker')
  const [form, setForm] = useState(initialForm)

  if (!isOpen) return null
  function updateField(event) {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
  }

  function submitForm(event) {
    event.preventDefault()
    onSubmit(role, form)
  }

  function closeFromBackground(event) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div className="modal-backdrop" onMouseDown={closeFromBackground}>
      <section className="login-modal" role="dialog" aria-modal="true" aria-labelledby="register-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer l’inscription">×</button>
        <p className="eyebrow">Inscription</p>
        <h2 id="register-title">Créer un compte</h2>
        <div className="role-tabs">
          <button type="button" className={role === 'job_seeker' ? 'active' : ''} onClick={() => setRole('job_seeker')}>
            Candidat
          </button>
          <button type="button" className={role === 'employer' ? 'active' : ''} onClick={() => setRole('employer')}>
            Employeur
          </button>
        </div>
        <form onSubmit={submitForm}>
          {role === 'job_seeker' ? (
            <>
              <label htmlFor="first-name">Prénom</label>
              <input id="first-name" name="firstName" value={form.firstName} onChange={updateField} required />
              <label htmlFor="last-name">Nom</label>
              <input id="last-name" name="lastName" value={form.lastName} onChange={updateField} required />
            </>
          ) : (
            <>
              <label htmlFor="company-name">Nom de l’entreprise</label>
              <input id="company-name" name="companyName" value={form.companyName} onChange={updateField} required />
              <label htmlFor="siret">SIRET</label>
              <input id="siret" name="siret" value={form.siret} onChange={updateField} required />
            </>
          )}
          <label htmlFor="register-email">Adresse e-mail</label>
          <input id="register-email" name="email" type="email" value={form.email} onChange={updateField} required />
          <label htmlFor="register-password">Mot de passe</label>
          <input id="register-password" name="password" type="password" minLength="6" value={form.password} onChange={updateField} required />
          {message && <p className={message.ok ? 'form-success' : 'form-error'} role="status">{message.text}</p>}
          <button className="submit-login" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Création…' : 'Créer le compte'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default RegisterModal
