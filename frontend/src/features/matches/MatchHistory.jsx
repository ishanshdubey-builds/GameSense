
function getOverview(match) {
  return match.segments?.find(
    (segment) => segment.type === "overview"
  );
}

function getStat(stats, key) {
  const stat = stats?.[key];

  if (!stat) return "—";

  const value = stat.displayValue ?? stat.value;

  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function formatMatchDate(timestamp) {
  if (!timestamp) return "Date unavailable";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MatchCard({ match }) {
  const overview = getOverview(match);
  const metadata = match.metadata ?? {};
  const player = overview?.metadata ?? {};
  const stats = overview?.stats ?? {};

  const won = metadata.result === "victory";

  return (
    <article className={`match-card ${won ? "match-win" : "match-loss"}`}>
      <div className="match-map-image">
        {metadata.mapImageUrl ? (
          <img
            src={metadata.mapImageUrl}
            alt={metadata.mapName ?? "VALORANT map"}
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="match-result">
        <span className={`result-label ${won ? "result-win" : "result-loss"}`}>
          {won ? "VICTORY" : "DEFEAT"}
        </span>
        <strong>{metadata.mapName ?? "Unknown map"}</strong>
        <span>{metadata.modeName ?? "Unknown mode"}</span>
        <small>{formatMatchDate(metadata.timestamp)}</small>
      </div>

      <div className="match-agent">
        {player.agentImageUrl ? (
          <img
            src={player.agentImageUrl}
            alt={player.agentName ?? "Agent"}
            loading="lazy"
          />
        ) : null}
        <span>{player.agentName ?? "Unknown agent"}</span>
      </div>

      <div className="match-kda">
        <strong>
          {getStat(stats, "kills")} / {getStat(stats, "deaths")} /{" "}
          {getStat(stats, "assists")}
        </strong>
        <span>K / D / A</span>
      </div>

      <div className="match-extra-stats">
        <div>
          <strong>{getStat(stats, "kdRatio")}</strong>
          <span>K/D</span>
        </div>
        <div>
          <strong>{getStat(stats, "scorePerRound")}</strong>
          <span>ACS*</span>
        </div>
        <div>
          <strong>{getStat(stats, "headshotsPercentage")}</strong>
          <span>HS%</span>
        </div>
      </div>
    </article>
  );
}

function MatchHistory({ matches = [], loading = false, error = "" }) {
  return (
    <section className="match-history">
      <div className="section-heading">
        <div>
          <p className="eyebrow">RECENT GAMES</p>
          <h2>Match history</h2>
        </div>

        <span className="section-tag">
          {matches.length} MATCHES
        </span>
      </div>

      {loading && (
        <div className="message loading-message" role="status">
          Fetching match history...
        </div>
      )}

      {error && (
        <div className="message error-message" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="empty-state">
          <h2>No matches to display</h2>
          <p>This player has no matches available in the returned history.</p>
        </div>
      )}

      {!loading && !error && matches.length > 0 && (
        <div className="match-list">
          {matches.map((match) => (
            <MatchCard
              key={match.attributes?.id}
              match={match}
            />
          ))}
        </div>
      )}

      <p className="data-note">
        Match data is provided by the connected data provider.
        ACS* uses the provider's score-per-round statistic.
      </p>
    </section>
  );
}

export default MatchHistory;
