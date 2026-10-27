import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  getMatchDetails,
  getMatchCoaching,
} from "../services/valorantApi";

const TABS = [
  "Scoreboard",
  "Performance",
  "Economy",
  "Rounds",
  "Duels",
  "AI Coach",
];

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fmt(value, digits = 0) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";

  return value.toLocaleString("en-IN", {
    maximumFractionDigits: digits,
  });
}

function dateLabel(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function playerLabel(player) {
  if (!player) return "Unknown player";

  return `${player.name || "Unknown"}${
    player.tag ? `#${player.tag}` : ""
  }`;
}

function headshotPercentage(player) {
  const stats = player?.stats || {};
  const shots =
    number(stats.headshots) +
    number(stats.bodyshots) +
    number(stats.legshots);

  return shots > 0 ? (number(stats.headshots) / shots) * 100 : null;
}

function kdRatio(player) {
  const kills = number(player?.stats?.kills);
  const deaths = number(player?.stats?.deaths);

  return deaths > 0 ? kills / deaths : kills;
}

function StatCard({ label, value, suffix = "", digits = 0 }) {
  return (
    <article className="analyzer-stat">
      <span>{label}</span>
      <strong>
        {value === null || value === undefined || value === ""
          ? "—"
          : `${fmt(value, digits)}${suffix}`}
      </strong>
    </article>
  );
}

/* -------------------- SCOREBOARD -------------------- */

function ScoreboardTab({ players, teams, rounds, selectedPlayerId, onSelectPlayer }) {
  const roundCount = Math.max(rounds.length, 1);

  const firstBloods = {};

  rounds.forEach((round) => {
    const puuid = round.first_blood?.puuid;

    if (puuid) {
      firstBloods[puuid] = (firstBloods[puuid] || 0) + 1;
    }
  });

  const orderedTeams = ["Blue", "Red"]
    .map((id) => teams.find((team) => team.team_id === id))
    .filter(Boolean);

  teams.forEach((team) => {
    if (!orderedTeams.some((item) => item.team_id === team.team_id)) {
      orderedTeams.push(team);
    }
  });

  return (
    <div className="analyzer-panel">
      <div className="analyzer-section-title">
        <div>
          <p className="analyzer-kicker">MATCH STATISTICS</p>
          <h3>Full scoreboard</h3>
        </div>
        <span>
          {players.length} players · {rounds.length} rounds
        </span>
      </div>

      {orderedTeams.map((team) => (
        <section className="analyzer-stat-group" key={team.team_id}>
          <h4>
            {team.team_id} Team · {team.rounds?.won ?? "—"} rounds won
            {team.won ? " · WINNER" : ""}
          </h4>

          <div className="match-scoreboard-table-wrap">
            <table className="match-scoreboard-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Score/Round*</th>
                  <th>K</th>
                  <th>D</th>
                  <th>A</th>
                  <th>K/D</th>
                  <th>Damage/Round*</th>
                  <th>HS%</th>
                  <th>First Kills</th>
                  <th>Damage</th>
                </tr>
              </thead>

              <tbody>
                {players
                  .filter((player) => player.team_id === team.team_id)
                  .sort(
                    (a, b) =>
                      number(b.stats?.score) - number(a.stats?.score)
                  )
                  .map((player) => {
                    const stats = player.stats || {};
                    const hs = headshotPercentage(player);

                    return (
                      <tr
  key={player.puuid || playerLabel(player)}
  className={`scoreboard-player-row ${
    player.puuid === selectedPlayerId ? "selected-player-row" : ""
  }`}
  onClick={() => onSelectPlayer(player.puuid)}
  title={`View ${playerLabel(player)}'s performance`}
>
                        <td>
                          <span className="match-player-cell">
                            {player.agent?.name && (
                              <span className="match-agent-name">
                                {player.agent.name}
                              </span>
                            )}
                            <strong>{playerLabel(player)}</strong>
                          </span>
                        </td>

                        <td>{fmt(number(stats.score) / roundCount)}</td>
                        <td>{fmt(stats.kills)}</td>
                        <td>{fmt(stats.deaths)}</td>
                        <td>{fmt(stats.assists)}</td>
                        <td>{fmt(kdRatio(player), 2)}</td>
                        <td>
                          {fmt(number(stats.damage?.dealt) / roundCount)}
                        </td>
                        <td>{hs === null ? "—" : `${fmt(hs, 1)}%`}</td>
                        <td>{fmt(firstBloods[player.puuid] || 0)}</td>
                        <td>{fmt(stats.damage?.dealt)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <p className="analyzer-note">
        *Score per round and damage per round are calculated from the
        provider's score and damage totals. They may differ from Tracker.gg's
        ACS and ADR calculations. KAST is not included because it was not
        confirmed in the returned data.
      </p>
    </div>
  );
}

/* -------------------- PERFORMANCE -------------------- */

function PerformanceTab({ players, selectedPlayerId }) {
  const player =
    players.find((item) => item.puuid === selectedPlayerId) || players[0];

  if (!player) {
    return (
      <div className="analyzer-panel">
        <p className="analyzer-empty">No player statistics available.</p>
      </div>
    );
  }

  const stats = player.stats || {};
  const hs = headshotPercentage(player);

  const cards = [
    { label: "Combat Score", value: stats.score },
    { label: "Kills", value: stats.kills },
    { label: "Deaths", value: stats.deaths },
    { label: "Assists", value: stats.assists },
    { label: "K/D", value: kdRatio(player), digits: 2 },
    { label: "Damage Dealt", value: stats.damage?.dealt },
    { label: "Damage Received", value: stats.damage?.received },
    { label: "Headshots", value: stats.headshots },
    { label: "Body Shots", value: stats.bodyshots },
    { label: "Leg Shots", value: stats.legshots },
    {
      label: "Headshot %",
      value: hs,
      suffix: hs === null ? "" : "%",
      digits: 1,
    },
    { label: "Plants", value: stats.plants },
    { label: "Defuses", value: stats.defuses },
    { label: "Performance Rating", value: player.performance?.score },
    { label: "Rank", value: player.tier?.name },
  ];

  return (
    <div className="analyzer-panel">
      <div className="analyzer-player-strip">
        <div>
          <p className="analyzer-kicker">PLAYER PERFORMANCE</p>
          <h2>{playerLabel(player)}</h2>
          <span>
            {player.agent?.name || "Agent unavailable"} ·{" "}
            {player.tier?.name || "Rank unavailable"}
          </span>
        </div>

        <div className="analyzer-kda">
          <span>K / D / A</span>
          <strong>
            {number(stats.kills)} / {number(stats.deaths)} /{" "}
            {number(stats.assists)}
          </strong>
        </div>
      </div>

      <div className="analyzer-stats-grid">
        {cards
          .filter(
            (item) => item.value !== null && item.value !== undefined
          )
          .map((item) => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.value}
              suffix={item.suffix || ""}
              digits={item.digits || 0}
            />
          ))}
      </div>

      {player.performance?.breakdown && (
        <section className="analyzer-stat-group">
          <h4>Performance Breakdown</h4>

          <div className="analyzer-stats-grid">
            {Object.entries(player.performance.breakdown).map(
              ([key, value]) => (
                <StatCard
                  key={key}
                  label={key.replaceAll("_", " ")}
                  value={value}
                  digits={2}
                />
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* -------------------- ECONOMY -------------------- */


function EconomyTab({ rounds, selectedPlayerId }) {
  const rows = rounds.map((round, index) => {
    const playerRound = (round.stats || []).find(
      (item) => item.player?.puuid === selectedPlayerId
    );

    const economy = playerRound?.economy;
    const result = String(round.result || "").toLowerCase();

    let resultClass = "economy-result";

    if (result.includes("elimination")) {
      resultClass += " economy-result-elimination";
    } else if (result.includes("defuse")) {
      resultClass += " economy-result-defuse";
    } else if (result.includes("detonate")) {
      resultClass += " economy-result-detonate";
    }

    return {
      roundNumber:
        round.id != null && Number.isFinite(Number(round.id))
          ? Number(round.id) + 1
          : index + 1,
      winner: round.winning_team,
      result: round.result,
      resultClass,
      economy,
    };
  });

  if (!rows.length) {
    return (
      <div className="analyzer-panel">
        <p className="analyzer-empty">
          No economy round data was returned for this match.
        </p>
      </div>
    );
  }

  return (
    <div className="analyzer-panel">
      <div className="analyzer-section-title">
        <div>
          <p className="analyzer-kicker">ECONOMY ANALYSIS</p>
          <h3>Round-by-round loadout</h3>
        </div>
        <span>{rows.length} rounds</span>
      </div>

      <div className="match-scoreboard-table-wrap economy-table-wrap">
        <table className="match-scoreboard-table economy-table">
          <thead>
            <tr>
              <th>Round</th>
              <th>Winner</th>
              <th>Round Result</th>
              <th>Weapon</th>
              <th>Loadout Value</th>
              <th>Remaining Credits</th>
              <th>Armor</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.roundNumber}>
                <td>
                  <strong>{row.roundNumber}</strong>
                </td>

                <td>
                  <span
                    className={
                      row.winner
                        ? `economy-team economy-team-${String(
                            row.winner
                          ).toLowerCase()}`
                        : "economy-team"
                    }
                  >
                    {row.winner || "—"}
                  </span>
                </td>

                <td>
                  <span className={row.resultClass}>
                    {row.result || "Unavailable"}
                  </span>
                </td>

                <td>
                  <strong>
                    {row.economy?.weapon?.name || "—"}
                  </strong>
                </td>

                <td>
                  {row.economy?.loadout_value == null
                    ? "—"
                    : fmt(row.economy.loadout_value)}
                </td>

                <td>
                  {row.economy?.remaining == null
                    ? "—"
                    : fmt(row.economy.remaining)}
                </td>

                <td>
                  {row.economy?.armor?.name || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="analyzer-note">
        Economy data depends on the fields returned by the match provider.
        A dash means the corresponding value is unavailable.
      </p>
    </div>
  );
}


/* -------------------- ROUNDS -------------------- */


function RoundsTab({ rounds, selectedPlayerId }) {
  if (!rounds.length) {
    return (
      <div className="analyzer-panel">
        <p className="analyzer-empty">
          No round data was returned for this match.
        </p>
      </div>
    );
  }

  return (
    <div className="analyzer-panel">
      <div className="analyzer-section-title">
        <div>
          <p className="analyzer-kicker">ROUND ANALYSIS</p>
          <h3>Round Timeline</h3>
        </div>
        <span>{rounds.length} rounds</span>
      </div>

      <div className="match-round-list">
        {rounds.map((round, index) => {
          const playerRound = (round.stats || []).find(
            (item) => item.player?.puuid === selectedPlayerId
          );

          const firstBlood = round.first_blood;
          const roundNumber = Number.isFinite(Number(round.id))
            ? Number(round.id) + 1
            : index + 1;

          const winner = round.winning_team;
          const result = round.result;

          return (
            <article
              className="match-round-card"
              key={round.id ?? index}
            >
              <div className="match-round-heading">
                <strong>Round {roundNumber}</strong>

                <span
                  className={
                    winner
                      ? `round-winner round-winner-${String(winner).toLowerCase()}`
                      : "round-winner"
                  }
                >
                  {winner ? `${winner} Team Won` : "Winner unavailable"}
                </span>

                <span>{result || "Result unavailable"}</span>
              </div>

              <div className="match-round-details">
                <div className="round-detail-item">
                  <span className="round-detail-label">
                    First Blood
                  </span>
                  <strong>
                    {firstBlood
                      ? `${firstBlood.name || "Unknown"}${
                          firstBlood.tag ? `#${firstBlood.tag}` : ""
                        }`
                      : "Not recorded"}
                  </strong>
                </div>

                <div className="round-detail-item">
                  <span className="round-detail-label">
                    Spike Plant
                  </span>
                  <strong>
                    {round.plant
                      ? `${round.plant.site || "Site unknown"}${
                          round.plant.player?.name
                            ? ` · ${round.plant.player.name}`
                            : ""
                        }`
                      : "Not recorded"}
                  </strong>
                </div>

                <div className="round-detail-item">
                  <span className="round-detail-label">
                    Spike Defuse
                  </span>
                  <strong>
                    {round.defuse?.player?.name || "Not recorded"}
                  </strong>
                </div>

                <div className="round-detail-item">
                  <span className="round-detail-label">
                    Your Round Stats
                  </span>
                  <strong>
                    {playerRound
                      ? `${fmt(playerRound.stats?.kills)} Kills · ${fmt(
                          playerRound.stats?.headshots
                        )} Headshots`
                      : "Stats unavailable"}
                  </strong>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}


/* -------------------- DUELS -------------------- */

function DuelsTab({ rounds, players, selectedPlayerId }) {
  const selectedPlayer = players.find(
    (player) => player.puuid === selectedPlayerId
  );

  const selectedTeamId = selectedPlayer?.team_id;
  const totals = {};

  rounds.forEach((round) => {
    (round.stats || []).forEach((source) => {
      if (source.player?.puuid !== selectedPlayerId) return;

      (source.damage_events || []).forEach((event) => {
        const target = event.player;

        if (!target?.puuid) return;

        if (!totals[target.puuid]) {
          totals[target.puuid] = {
            puuid: target.puuid,
            name: playerLabel(target),
            team: target.team || "—",
            damage: 0,
            headshots: 0,
            bodyshots: 0,
            legshots: 0,
            roundIds: new Set(),
          };
        }

        const current = totals[target.puuid];

        current.damage += number(event.damage);
        current.headshots += number(event.headshots);
        current.bodyshots += number(event.bodyshots);
        current.legshots += number(event.legshots);
        current.roundIds.add(round.id);
      });
    });
  });

  const opponents = Object.values(totals)
    .map((item) => ({
      ...item,
      roundsInvolved: item.roundIds.size,
    }))
    .filter((item) => {
      const player = players.find(
        (candidate) => candidate.puuid === item.puuid
      );

      return player && player.team_id !== selectedTeamId;
    })
    .sort((a, b) => b.damage - a.damage);

  return (
    <div className="analyzer-panel">
      <div className="analyzer-section-title">
        <div>
          <p className="analyzer-kicker">DUEL ANALYSIS</p>
          <h3>Damage Against Opponents</h3>
        </div>
        <span>{opponents.length} opponents with recorded damage</span>
      </div>

      {opponents.length > 0 ? (
        <div className="match-scoreboard-table-wrap">
          <table className="match-scoreboard-table">
            <thead>
              <tr>
                <th>Opponent</th>
                <th>Team</th>
                <th>Damage</th>
                <th>Headshots</th>
                <th>Body Shots</th>
                <th>Leg Shots</th>
                <th>Rounds Involved</th>
              </tr>
            </thead>

            <tbody>
              {opponents.map((opponent) => (
                <tr key={opponent.puuid}>
                  <td>{opponent.name}</td>
                  <td>{opponent.team}</td>
                  <td>{fmt(opponent.damage)}</td>
                  <td>{fmt(opponent.headshots)}</td>
                  <td>{fmt(opponent.bodyshots)}</td>
                  <td>{fmt(opponent.legshots)}</td>
                  <td>{fmt(opponent.roundsInvolved)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="analyzer-empty">
          No opponent damage events were recorded for the selected player.
        </p>
      )}

      <p className="analyzer-note">
        This summarizes recorded damage events. It does not claim a duel win
        unless the provider explicitly supplies that event.
      </p>
    </div>
  );
}


/* -------------------- AI-Coach PAGE -------------------- */

function AICoachTab({
  matchId,
  affinity,
  selectedPlayer,
}) {
  const [report, setReport] = useState("");
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [coachError, setCoachError] = useState("");

  async function generateReport() {
    setLoadingCoach(true);
    setCoachError("");
    setReport("");

    try {
      const result = await getMatchCoaching(
        matchId,
        affinity,
        selectedPlayer?.puuid
      );

      setReport(
        result?.data?.coaching ||
        result?.coaching ||
        "The AI returned an empty report."
      );
    } catch (error) {
      setCoachError(
        error.message || "Could not generate coaching report."
      );
    } finally {
      setLoadingCoach(false);
    }
  }

  return (
    <div className="analyzer-panel ai-coach-panel">
      <div className="analyzer-section-title">
        <div>
          <p className="analyzer-kicker">GAMESENSE INTELLIGENCE</p>
          <h3>AI Match Coach</h3>
          <p>
            Get match insights and a personalized practice plan.
          </p>
        </div>
      </div>

      <div className="ai-coach-player">
        <span>Player to analyze</span>
        <strong>
          {selectedPlayer
            ? `${selectedPlayer.name || "Unknown"}${
                selectedPlayer.tag
                  ? `#${selectedPlayer.tag}`
                  : ""
              }`
            : "No player selected"}
        </strong>
        <span>
          {selectedPlayer?.agent?.name || "Agent unavailable"}
        </span>
      </div>

      <button
        type="button"
        className="ai-coach-generate-button"
        onClick={generateReport}
        disabled={loadingCoach || !selectedPlayer}
      >
        {loadingCoach
          ? "Analyzing match..."
          : report
          ? "Generate New Report"
          : "Generate Coaching Report"}
      </button>

      {loadingCoach && (
        <div className="message loading-message" role="status">
          <span className="spinner" />
          Reviewing match statistics and preparing coaching tips...
        </div>
      )}

      {coachError && (
        <div className="message error-message" role="alert">
          {coachError}
        </div>
      )}

      {report && !loadingCoach && (
        
<section className="ai-coach-report">
  <div className="ai-coach-report-header">
    <div>
      <p className="analyzer-kicker">PERSONALIZED ANALYSIS</p>
      <h3>Your Coaching Report</h3>
    </div>
    <span className="ai-coach-badge">AI GENERATED</span>
  </div>

  <div className="ai-coach-report-text">
    <ReactMarkdown>{report}</ReactMarkdown>
  </div>
</section>

      )}

      {!report && !loadingCoach && !coachError && (
        <p className="analyzer-empty">
          Generate a report to see match insights, strengths,
          improvement areas, and a practice plan.
        </p>
      )}

      <p className="analyzer-note">
        AI recommendations are based on the match data available
        to GameSense. Missing data may limit the analysis.
      </p>
    </div>
  );
}


/* -------------------- MAIN PAGE -------------------- */

export default function MatchDetailPage() {
  const { matchId } = useParams();
  const [searchParams] = useSearchParams();

  const playerId = searchParams.get("playerId") || "";
  const affinity = searchParams.get("affinity") || "ap";

  const [match, setMatch] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [activeTab, setActiveTab] = useState("Scoreboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMatch() {
      setLoading(true);
      setError("");
      setMatch(null);

      try {
        const response = await getMatchDetails(matchId, affinity);
        const payload = response?.data ?? response;

        if (!payload?.metadata || !Array.isArray(payload.players)) {
          throw new Error(
            "The match API response did not contain match metadata and players."
          );
        }

        if (cancelled) return;

        setMatch(payload);

        const matchingPlayer = payload.players.find(
          (player) =>
            `${player.name || ""}#${player.tag || ""}`.toLowerCase() ===
            playerId.toLowerCase()
        );

        const matchingName = payload.players.find(
          (player) =>
            player.name?.toLowerCase() === playerId.toLowerCase()
        );

        const defaultPlayer =
          matchingPlayer || matchingName || payload.players[0];

        setSelectedPlayerId(defaultPlayer?.puuid || "");
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError.message || "Could not load full match details."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!matchId) {
      setError("Match ID is missing from the URL.");
      setLoading(false);
    } else {
      loadMatch();
    }

    return () => {
      cancelled = true;
    };
  }, [matchId, playerId, affinity]);

  const players = match?.players || [];
  const teams = match?.teams || [];
  const rounds = match?.rounds || [];
  const metadata = match?.metadata || {};

  const selectedPlayer = useMemo(
    () =>
      players.find((player) => player.puuid === selectedPlayerId) ||
      players[0],
    [players, selectedPlayerId]
  );

  const selectedTeam = teams.find(
    (team) => team.team_id === selectedPlayer?.team_id
  );

  const won = selectedTeam?.won === true;
  const mapName = metadata.map?.name || "Unknown Map";

  const roundScore = teams.length
    ? teams.map((team) => team.rounds?.won ?? 0).join(" : ")
    : "—";

  return (
    <section className="match-analyzer">
      <Link className="analyzer-back-link" to="/">
        ← Back to GameSense
      </Link>

      {loading && (
        <div className="message loading-message" role="status">
          <span className="spinner" />
          Loading full match details...
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
            <div className="analyzer-match-main">
              <span className="analyzer-mode">
                {metadata.queue?.name || "VALORANT"} MATCH
              </span>

              <h1>{mapName}</h1>
              <span>{dateLabel(metadata.started_at)}</span>
            </div>

            <div className="analyzer-result-block">
              <span className={won ? "result-win" : "result-loss"}>
                {won ? "VICTORY" : "DEFEAT"}
              </span>
              <strong>{roundScore}</strong>
              <small>Team round wins</small>
            </div>

            <div className="analyzer-agent-block">
              <label htmlFor="match-player-select">
                Selected Player
              </label>

              <select
                id="match-player-select"
                value={selectedPlayerId}
                onChange={(event) =>
                  setSelectedPlayerId(event.target.value)
                }
              >
                {players.map((player) => (
                  <option
                    key={player.puuid}
                    value={player.puuid}
                  >
                    {playerLabel(player)} ·{" "}
                    {player.agent?.name || "Agent"}
                  </option>
                ))}
              </select>

              <strong>
                {selectedPlayer?.agent?.name || "Unknown Agent"}
              </strong>
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
    players={players}
    teams={teams}
    rounds={rounds}
    selectedPlayerId={selectedPlayerId}
    onSelectPlayer={(playerId) => {
      setSelectedPlayerId(playerId);
      setActiveTab("Performance");
    }}
  />
)}


          {activeTab === "Performance" && (
            <PerformanceTab
              players={players}
              selectedPlayerId={selectedPlayerId}
            />
          )}

          {activeTab === "Economy" && (
            <EconomyTab
              rounds={rounds}
              selectedPlayerId={selectedPlayerId}
            />
          )}

          {activeTab === "Rounds" && (
            <RoundsTab
              rounds={rounds}
              selectedPlayerId={selectedPlayerId}
            />
          )}

          {activeTab === "Duels" && (
            <DuelsTab
              rounds={rounds}
              players={players}
              selectedPlayerId={selectedPlayerId}
            />
          )}

          {activeTab === "AI Coach" && (
  <AICoachTab
    matchId={matchId}
    affinity={affinity}
    selectedPlayer={selectedPlayer}
  />
)}
        </>
      )}
    </section>
  );
}