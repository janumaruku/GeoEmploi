import { useState } from 'react'

const initialForm = { firstName: '', lastName: '', companyName: '', siret: '', email: '', password: '' }

function RegisterModal({ isOpen, onClose, onSubmit, isSubmitting, message }) {
  const [role, setRole] = useState('job_seeker')
  const [form, setForm] = useState(initialForm)

  if (!isOpen) return null
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="login-modal" role="dialog" aria-modal="true" aria-labelledby="register-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer l’inscription">×</button>
        <p className="eyebrow">Inscription</p>
        <h2 id="register-title">Créer un compte</h2>
        <div className="role-tabs">
          <button type="button" className={role === 'job_seeker' ? 'active' : ''} onClick={() => setRole('job_seeker')}>Candidat</button>
          <button type="button" className={role === 'employer' ? 'active' : ''} onClick={() => setRole('employer')}>Employeur</button>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); onSubmit(role, form) }}>
          {role === 'job_seeker' ? <>
            <label htmlFor="first-name">Prénom</label><input id="first-name" value={form.firstName} onChange={update('firstName')} required />
            <label htmlFor="last-name">Nom</label><input id="last-name" value={form.lastName} onChange={update('lastName')} required />
          </> : <>
            <label htmlFor="company-name">Nom de l’entreprise</label><input id="company-name" value={form.companyName} onChange={update('companyName')} required />
            <label htmlFor="siret">SIRET</label><input id="siret" value={form.siret} onChange={update('siret')} required />
          </>}
          <label htmlFor="register-email">Adresse e-mail</label><input id="register-email" type="email" value={form.email} onChange={update('email')} required />
          <label htmlFor="register-password">Mot de passe</label><input id="register-password" type="password" minLength="6" value={form.password} onChange={update('password')} required />
          {message && <p className={message.ok ? 'form-success' : 'form-error'} role="status">{message.text}</p>}
          <button className="submit-login" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Création…' : 'Créer le compte'}</button>
        </form>
      </section>
    </div>
  )
}

export default RegisterModal
