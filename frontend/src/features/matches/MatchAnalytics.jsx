
function getOverview(match) {
  return match.segments?.find(
    (segment) => segment.type === "overview"
  );
}

function getStat(match, key) {
  const stats = getOverview(match)?.stats;
  const stat = stats?.[key];
  const value = stat?.value ?? stat?.displayValue;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function MatchAnalytics({ matches = [] }) {
  const completedMatches = matches.filter((match) => {
    const result = String(match.metadata?.result ?? "").toLowerCase();
    return result === "victory" || result === "defeat";
  });

  if (completedMatches.length === 0) {
    return (
      <section className="match-analytics">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PERFORMANCE INSIGHTS</p>
            <h2>Recent performance</h2>
          </div>
        </div>
        <div className="empty-state">
          <p>Search a player with available match history to see analytics.</p>
        </div>
      </section>
    );
  }

  const wins = completedMatches.filter(
    (match) =>
      String(match.metadata?.result).toLowerCase() === "victory"
  ).length;

  const losses = completedMatches.length - wins;
  const winRate = (wins / completedMatches.length) * 100;

  const killValues = completedMatches.map((match) =>
    getStat(match, "kills")
  );

  const deathValues = completedMatches.map((match) =>
    getStat(match, "deaths")
  );

  const kdValues = completedMatches.map((match) =>
    getStat(match, "kdRatio")
  );

  const average = (values) => {
    const valid = values.filter((value) => value !== null);
    if (valid.length === 0) return null;

    return valid.reduce((sum, value) => sum + value, 0) / valid.length;
  };

  const avgKills = average(killValues);
  const avgDeaths = average(deathValues);
  const avgKD = average(kdValues);

  // Display oldest to newest, limited to the 10 latest matches.
  const chartMatches = [...completedMatches]
    .slice(0, 10)
    .reverse();

  const chartKills = chartMatches.map((match) =>
    getStat(match, "kills")
  );

  const chartDeaths = chartMatches.map((match) =>
    getStat(match, "deaths")
  );

  const chartMax = Math.max(
    1,
    ...chartKills.filter((value) => value !== null),
    ...chartDeaths.filter((value) => value !== null)
  );

  const chartPoints = (values) =>
    values
      .map((value, index) => {
        if (value === null) return null;

        const x =
          chartMatches.length === 1
            ? 50
            : (index / (chartMatches.length - 1)) * 100;

        const y = 100 - (value / chartMax) * 100;

        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(" ");

  return (
    <section className="match-analytics">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PERFORMANCE INSIGHTS</p>
          <h2>Recent performance</h2>
        </div>
        <span className="section-tag">
          {completedMatches.length} MATCHES
        </span>
      </div>

      <div className="analytics-summary">
        <article className="analytics-card">
          <span>RECENT WIN RATE</span>
          <strong>{winRate.toFixed(1)}%</strong>
          <div className="win-rate-bar">
            <span style={{ width: `${winRate}%` }} />
          </div>
          <small>
            {wins} wins · {losses} losses
          </small>
        </article>

        <article className="analytics-card">
          <span>AVERAGE KILLS</span>
          <strong>
            {avgKills === null ? "—" : avgKills.toFixed(1)}
          </strong>
          <small>Per match with recorded kills</small>
        </article>

        <article className="analytics-card">
          <span>AVERAGE DEATHS</span>
          <strong>
            {avgDeaths === null ? "—" : avgDeaths.toFixed(1)}
          </strong>
          <small>Per match with recorded deaths</small>
        </article>

        <article className="analytics-card">
          <span>AVERAGE K/D</span>
          <strong>
            {avgKD === null ? "—" : avgKD.toFixed(2)}
          </strong>
          <small>Provider-reported match K/D</small>
        </article>
      </div>

      <div className="performance-chart-card">
        <div className="chart-heading">
          <div>
            <h3>Kills vs. deaths</h3>
            <p>Latest {chartMatches.length} matches, oldest to newest</p>
          </div>
          <div className="chart-legend">
            <span><i className="legend-kills" /> Kills</span>
            <span><i className="legend-deaths" /> Deaths</span>
          </div>
        </div>

        <div className="performance-chart">
          <div className="chart-y-labels">
            <span>{chartMax}</span>
            <span>{Math.round(chartMax / 2)}</span>
            <span>0</span>
          </div>

          <div className="chart-plot">
            <div className="chart-grid-line chart-grid-top" />
            <div className="chart-grid-line chart-grid-middle" />
            <div className="chart-grid-line chart-grid-bottom" />

            <svg
              className="chart-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              role="img"
              aria-label="Kills and deaths across recent matches"
            >
              <polyline
                points={chartPoints(chartKills)}
                className="chart-line chart-line-kills"
              />
              <polyline
                points={chartPoints(chartDeaths)}
                className="chart-line chart-line-deaths"
              />
            </svg>
          </div>
        </div>

        <div className="chart-x-labels">
          <span>Older</span>
          <span>More recent</span>
        </div>
      </div>

      <p className="data-note">
        Analytics are calculated from the matches currently loaded.
        They may not represent the player's entire season.
      </p>
    </section>
  );
}

export default MatchAnalytics;
