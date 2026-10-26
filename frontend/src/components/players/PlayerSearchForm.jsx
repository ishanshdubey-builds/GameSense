
function PlayerSearchForm({ onSearch, loading }) {
  return (
    <form className="search-form" onSubmit={onSearch}>
      <span className="search-icon" aria-hidden="true">⌕</span>

      <input
        name="riotId"
        placeholder="Enter Riot ID (e.g. Name#Tag)"
        aria-label="Riot ID"
        autoComplete="off"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "SEARCHING..." : "SEARCH PLAYER"}
        {!loading && <span aria-hidden="true"> ↗</span>}
      </button>
    </form>
  );
}

export default PlayerSearchForm;
