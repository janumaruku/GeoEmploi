import { useEffect, useState } from 'react'
import LegalModal from './LegalModal.jsx'

const initialForm = {
  firstName: '',
  lastName: '',
  companyName: '',
  siret: '',
  email: '',
  password: '',
  // Case à cocher obligatoire d'acceptation des CGU et de la
  // politique de confidentialité. Le compte ne peut pas être créé sans
  // (attribut `required` sur l'input, voir plus bas).
  consent: false,
}

// Textes des CGU / politique de confidentialité affichés dans une
// LegalModal. Ce sont des modèles de démonstration, pas des textes rédigés
// par un juriste.
const CGU_TEXT = (
  <>
    <p><em>Modèle de démonstration — à faire valider par un professionnel du droit avant mise en production.</em></p>
    <p>En créant un compte sur GéoEmploi, vous acceptez d'utiliser le service conformément à sa finalité : la mise en relation entre candidats et employeurs. Vous vous engagez à fournir des informations exactes et à ne pas publier de contenu illicite, trompeur ou portant atteinte aux droits d'autrui.</p>
    <p>GéoEmploi est actuellement un démonstrateur technique — voir la mention en pied de page. Il ne constitue pas un service public en exploitation et peut être interrompu ou modifié à tout moment.</p>
  </>
)

const PRIVACY_TEXT = (
  <>
    <p><em>Modèle de démonstration — à faire valider par un professionnel du droit avant mise en production.</em></p>
    <p>Les données que vous renseignez (e-mail, mot de passe, et selon le profil : nom, prénom ou raison sociale et SIRET) sont utilisées uniquement pour créer et gérer votre compte, et pour le fonctionnement du service (recherche d'offres, candidatures).</p>
    <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Ce démonstrateur technique n'a pas encore mis en place de procédure de contact dédiée pour exercer ces droits — c'est un point à traiter avant toute mise en production réelle.</p>
  </>
)

function RegisterModal({ isOpen, onClose, onSubmit, isSubmitting, message, onSwitchToLogin }) {
  const [role, setRole] = useState('job_seeker')
  const [form, setForm] = useState(initialForm)
  //  Etat d'ouverture des deux panneaux d'information légale.
  const [isCguOpen, setIsCguOpen] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)

  // ce composant reste monté même modale fermée, donc form.password (et
  // le reste du formulaire) restait en mémoire d'une ouverture à l'autre.
  // On réinitialise tout à la fermeture, via la fonction de nettoyage de
  // l'effet plutôt qu'un setState en plein corps d'effet.
  useEffect(() => {
    if (!isOpen) return undefined
    return () => {
      setForm(initialForm)
      setIsCguOpen(false)
      setIsPrivacyOpen(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  function updateField(event) {
    // Gère aussi les champs de type checkbox (form.consent), en
    // plus des champs texte déjà existants.
    const { name, value, type, checked } = event.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
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

          {/* Case à cocher obligatoire, avec liens vers les deux
              panneaux d'information légale. */}
          <label className="consent-field" htmlFor="register-consent">
            <input
              id="register-consent"
              name="consent"
              type="checkbox"
              checked={form.consent}
              onChange={updateField}
              required
            />
            <span>
              J’accepte les{' '}
              <button type="button" className="inline-link" onClick={() => setIsCguOpen(true)}>
                Conditions Générales d’Utilisation
              </button>{' '}
              et je confirme avoir lu la{' '}
              <button type="button" className="inline-link" onClick={() => setIsPrivacyOpen(true)}>
                politique de confidentialité
              </button>.
            </span>
          </label>

          {message && <p className={message.ok ? 'form-success' : 'form-error'} role="status">{message.text}</p>}
          <button className="submit-login" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Création…' : 'Créer le compte'}
          </button>
        </form>
        {/* Passerelle vers la connexion, pour éviter d'avoir à
            fermer la modale puis rouvrir "Se connecter" séparément. */}
        <p className="modal-switch">
          Déjà un compte ?{' '}
          <button type="button" className="inline-link" onClick={onSwitchToLogin}>
            Se connecter
          </button>
        </p>
      </section>

      <LegalModal isOpen={isCguOpen} onClose={() => setIsCguOpen(false)} title="Conditions Générales d’Utilisation">
        {CGU_TEXT}
      </LegalModal>
      <LegalModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} title="Politique de confidentialité">
        {PRIVACY_TEXT}
      </LegalModal>
    </div>
  )
}

export default RegisterModal
