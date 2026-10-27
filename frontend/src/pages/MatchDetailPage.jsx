
import { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { getPlayerMatches } from "../services/valorantApi";

const TABS = ["Scoreboard", "Performance", "Economy", "Rounds", "Duels"];

const SCOREBOARD_STATS = [
  { label: "KILLS", key: "kills" },
  { label: "DEATHS", key: "deaths" },
  { label: "ASSISTS", key: "assists" },
  { label: "ACS", key: "scorePerRound" },
  { label: "K/D", key: "kdRatio" },
  { label: "DAMAGE", key: "damage" },
  { label: "ADR", key: "damagePerRound" },
  { label: "HEADSHOT %", key: "headshotsPercentage" },
  { label: "KAST", key: "kast" },
  { label: "FIRST KILLS", key: "firstBloods" },
  { label: "FIRST DEATHS", key: "firstDeaths" },
  { label: "TRADES", key: "traded" },
  { label: "SURVIVED", key: "survived" },
  { label: "CLUTCHES", key: "clutches" },
  { label: "PLANTS", key: "plants" },
  { label: "DEFUSES", key: "defuses" },
  { label: "HEADSHOTS", key: "headshots" },
  { label: "BODY SHOTS", key: "shotsBody" },
  { label: "LEG SHOTS", key: "shotsLegs" },
  { label: "ECON RATING", key: "econRating" },
];

const TAB_INFO = {
  Economy: {
    title: "Economy analysis",
    description:
      "Round-by-round credits, purchases, loadout values and economy trends belong here.",
    required:
      "The current match-history response has not yet been verified to include round-level economy data.",
  },
  Rounds: {
    title: "Round-by-round breakdown",
    description:
      "Explore each round's outcome, attack and defense performance, and key events.",
    required:
      "Round results and event timelines are not available in the match data currently loaded by this page.",
  },
  Duels: {
    title: "Duel analysis",
    description:
      "Compare your encounters with individual opponents and identify difficult matchups.",
    required:
      "Opponent encounter records are needed. Your individual K/D/A alone cannot establish who you won or lost duels against.",
  },
};

function getOverview(match) {
  return match?.segments?.find(
    (segment) => segment.type === "overview"
  );
}

function getValue(stats, key) {
  const stat = stats?.[key];
  const value = stat?.displayValue ?? stat?.value;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number" && !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? value.toLocaleString("en-IN")
      : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
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

function StatCard({ label, value }) {
  return (
    <article className="analyzer-stat">
      <span>{label}</span>
      <strong>{formatValue(value)}</strong>
    </article>
  );
}

function ScoreboardTab({ stats, playerId, agentName }) {
  const availableStats = SCOREBOARD_STATS.filter(
    ({ key }) => getValue(stats, key) !== null
  );

  return (
    <div className="analyzer-panel">
      <div className="analyzer-player-strip">
        <div>
          <p className="analyzer-kicker">PLAYER PERFORMANCE</p>
          <h2>{playerId}</h2>
          <span>{agentName || "Agent unavailable"}</span>
        </div>

        <div className="analyzer-kda">
          <span>K / D / A</span>
          <strong>
            {formatValue(getValue(stats, "kills"))} /{" "}
            {formatValue(getValue(stats, "deaths"))} /{" "}
            {formatValue(getValue(stats, "assists"))}
          </strong>
        </div>
      </div>

      <div className="analyzer-section-title">
        <div>
          <p className="analyzer-kicker">MATCH STATISTICS</p>
          <h3>Your scoreboard</h3>
        </div>
        <span>{availableStats.length} stats available</span>
      </div>

      {availableStats.length > 0 ? (
        <div className="analyzer-stats-grid">
          {availableStats.map(({ label, key }) => (
            <StatCard
              key={key}
              label={label}
              value={getValue(stats, key)}
            />
          ))}
        </div>
      ) : (
        <p className="analyzer-empty">
          No individual statistics were returned for this match.
        </p>
      )}

      <p className="analyzer-note">
        This is your individual scoreboard, not the complete ten-player
        scoreboard. Team rows require match-wide player statistics from
        the provider.
      </p>
    </div>
  );
}

function PerformanceTab({ stats }) {
  const groups = [
    {
      title: "Combat",
      keys: ["kills", "deaths", "assists", "kdRatio", "scorePerRound"],
    },
    {
      title: "Accuracy and damage",
      keys: [
        "headshots",
        "headshotsPercentage",
        "shotsBody",
        "shotsLegs",
        "damage",
        "damagePerRound",
        "damageReceived",
        "damageDelta",
        "damageDeltaPerRound",
      ],
    },
    {
      title: "Round impact",
      keys: [
        "kast",
        "firstBloods",
        "firstDeaths",
        "traded",
        "survived",
        "clutches",
        "clutchLosses",
        "plants",
        "defuses",
        "ultimateCasts",
      ],
    },
  ];

  const labels = {
    kills: "Kills",
    deaths: "Deaths",
    assists: "Assists",
    kdRatio: "K/D ratio",
    scorePerRound: "Score per round",
    headshots: "Headshots",
    headshotsPercentage: "Headshot %",
    shotsBody: "Body shots",
    shotsLegs: "Leg shots",
    damage: "Damage dealt",
    damagePerRound: "Damage per round",
    damageReceived: "Damage received",
    damageDelta: "Damage delta",
    damageDeltaPerRound: "Damage delta per round",
    kast: "KAST",
    firstBloods: "First kills",
    firstDeaths: "First deaths",
    traded: "Kills traded",
    survived: "Rounds survived",
    clutches: "Clutches won",
    clutchLosses: "Clutches lost",
    plants: "Spike plants",
    defuses: "Spike defuses",
    ultimateCasts: "Ultimate casts",
  };

  return (
    <div className="analyzer-panel">
      <div className="analyzer-section-title">
        <div>
          <p className="analyzer-kicker">PERFORMANCE REPORT</p>
          <h3>Combat breakdown</h3>
        </div>
      </div>

      {groups.map((group) => {
        const available = group.keys.filter(
          (key) => getValue(stats, key) !== null
        );

        if (available.length === 0) return null;

        return (
          <section className="analyzer-stat-group" key={group.title}>
            <h4>{group.title}</h4>
            <div className="analyzer-stats-grid">
              {available.map((key) => (
                <StatCard
                  key={key}
                  label={labels[key] || key}
                  value={getValue(stats, key)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <p className="analyzer-note">
        Missing provider statistics are omitted. Percentages and values
        are displayed using the provider's reported format.
      </p>
    </div>
  );
}

function UnavailableTab({ tab }) {
  const info = TAB_INFO[tab];

  return (
    <div className="analyzer-panel analyzer-unavailable">
      <div className="analyzer-unavailable-icon" aria-hidden="true">
        {tab === "Economy" ? "₵" : tab === "Rounds" ? "◷" : "⚔"}
      </div>
      <p className="analyzer-kicker">{tab.toUpperCase()} ANALYSIS</p>
      <h3>{info.title}</h3>
      <p>{info.description}</p>
      <div className="analyzer-data-requirement">
        <strong>Data needed</strong>
        <span>{info.required}</span>
      </div>
    </div>
  );
}

function MatchDetailPage() {
  const { matchId } = useParams();
  const [searchParams] = useSearchParams();
  const playerId = searchParams.get("playerId") || "";

  const [match, setMatch] = useState(null);
  const [activeTab, setActiveTab] = useState("Scoreboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMatch() {
      if (!playerId) {
        setError("Player ID is missing. Return to the profile and open a match.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setMatch(null);

      try {
        const data = await getPlayerMatches(playerId);
        const found = (data.matches ?? []).find(
          (item) => String(item.attributes?.id) === matchId
        );

        if (!found) {
          throw new Error(
            "This match was not found in the player's currently available match history."
          );
        }

        if (!cancelled) setMatch(found);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load match details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMatch();

    return () => {
      cancelled = true;
    };
  }, [matchId, playerId]);

  const overview = getOverview(match);
  const metadata = match?.metadata ?? {};
  const player = overview?.metadata ?? {};
  const stats = overview?.stats ?? {};
  const won = metadata.result === "victory";

  return (
    <section className="match-analyzer">
      <Link className="analyzer-back-link" to="/">
        ← Back to GameSense
      </Link>

      {loading && (
        <div className="message loading-message" role="status">
          <span className="spinner" />
          Loading match details...
        </div>
      )}

      {error && !loading && (
        <div className="message error-message" role="alert">
          {error}
        </div>
      )}

      {match && !loading && !error && (
        <>
          <header className="analyzer-match-header">
            {metadata.mapImageUrl && (
              <img
                className="analyzer-map-image"
                src={metadata.mapImageUrl}
                alt={metadata.mapName || "VALORANT map"}
              />
            )}

            <div className="analyzer-match-main">
              <span className="analyzer-mode">
                {metadata.modeName || "VALORANT"} MATCH
              </span>
              <h1>{metadata.mapName || "Unknown map"}</h1>
              <span>{formatMatchDate(metadata.timestamp)}</span>
            </div>

            <div className="analyzer-result-block">
              <span className={won ? "result-win" : "result-loss"}>
                {won ? "VICTORY" : "DEFEAT"}
              </span>
              <strong>
                {metadata.roundsWon ?? "—"} : {metadata.roundsLost ?? "—"}
              </strong>
              <small>Round score, if provided</small>
            </div>

            <div className="analyzer-agent-block">
              {player.agentImageUrl && (
                <img
                  src={player.agentImageUrl}
                  alt={player.agentName || "Agent"}
                />
              )}
              <strong>{player.agentName || "Unknown agent"}</strong>
            </div>
          </header>

          <nav className="analyzer-tabs" aria-label="Match analysis tabs">
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
                aria-pressed={activeTab === tab}
              >
                {tab}
              </button>
            ))}
          </nav>

          {activeTab === "Scoreboard" && (
            <ScoreboardTab
              stats={stats}
              playerId={playerId}
              agentName={player.agentName}
            />
          )}

          {activeTab === "Performance" && (
            <PerformanceTab stats={stats} />
          )}

          {TAB_INFO[activeTab] && (
            <UnavailableTab tab={activeTab} />
          )}
        </>
      )}
    </section>
  );
}

export default MatchDetailPage;
