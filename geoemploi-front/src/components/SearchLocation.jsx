function SearchLocation({ query, onQueryChange, onSearch, onClear }) {
  return (
    <form className="location-search" onSubmit={(event) => { event.preventDefault(); onSearch() }} role="search">
      <label htmlFor="location-query">Commune ou code postal</label>
      <div className="search-controls">
        <input id="location-query" type="search" placeholder="Ex. Paris, Lyon, 75013…" value={query} onChange={(event) => onQueryChange(event.target.value)} />
        <button type="submit">Rechercher</button>
        {query && <button type="button" className="clear-search" onClick={onClear}>Effacer</button>}
      </div>
    </form>
  )
}

export default SearchLocation
