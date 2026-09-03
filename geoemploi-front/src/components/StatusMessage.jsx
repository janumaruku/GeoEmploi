const statusContent = {
  loading: { title: 'Chargement des offres…', description: 'Nous recherchons les opportunités disponibles dans cette zone.' },
  empty: { title: 'Aucune offre sélectionnée', description: 'Sélectionnez un marqueur sur la carte pour consulter le détail de l’offre.' },
  'search-empty': { title: 'Aucune offre trouvée dans cette commune.', description: 'Essayez une autre commune ou effacez votre recherche pour afficher toutes les offres.' },
  error: { title: 'Les offres sont momentanément indisponibles', description: 'Une erreur est survenue. Veuillez réessayer dans quelques instants.' },
}

function StatusMessage({ type = 'loading' }) {
  const content = statusContent[type] ?? statusContent.error
  return (
    <div className={`status-message status-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span className="status-icon" aria-hidden="true">{type === 'loading' ? '◌' : type === 'empty' ? '⌖' : '!'}</span>
      <h2>{content.title}</h2>
      <p>{content.description}</p>
    </div>
  )
}

export default StatusMessage
