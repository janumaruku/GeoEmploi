function SearchLocation({
  query,
  onQueryChange,
  onSearch,
  onClear,
  onUseLocation,
  geolocationLoading,
  geolocationMessage,
}) {
  function submitSearch(event) {
    event.preventDefault()
    onSearch()
  }

  return (
    <form className="location-search" onSubmit={submitSearch} role="search">
      <label htmlFor="location-query">Commune ou code postal</label>
      <div className="search-controls">
        <input
          id="location-query"
          type="search"
          placeholder="Ex. Paris, Lyon, 75013…"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <button type="submit">Rechercher</button>
        {query && (
          <button type="button" className="clear-search" onClick={onClear}>
            Effacer
          </button>
        )}
        <button type="button" onClick={onUseLocation} disabled={geolocationLoading}>
          {geolocationLoading ? 'Localisation…' : 'Utiliser ma position'}
        </button>
      </div>
      {geolocationMessage && (
        <p className="geolocation-message" role="status">{geolocationMessage}</p>
      )}
    </form>
  )
}

export default SearchLocation
