
import { useState } from "react";
import PlayerSearchForm from "../components/players/PlayerSearchForm";
import PlayerOverview from "../components/players/PlayerOverview";
import StatsGrid from "../components/stats/StatsGrid";
import MatchHistory from "../features/matches/MatchHistory";
import {
  getPlayerProfile,
  getPlayerMatches,
} from "../services/valorantApi";
import MatchAnalytics from "../features/matches/MatchAnalytics";

function ValorantProfilePage() {
  const [riotId, setRiotId] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState("");

  async function searchPlayer(event) {
    event.preventDefault();

    const id = event.currentTarget.elements.riotId.value.trim();
    setRiotId(id);

    if (!id.includes("#") || id.startsWith("#") || id.endsWith("#")) {
      setError("Enter a Riot ID in Name#Tag format.");
      return;
    }

    // Reset the previous search results.
    setLoading(true);
    setMatchesLoading(true);
    setError("");
    setMatchesError("");
    setProfile(null);
    setMatches([]);

    // Fetch profile and match history independently.
    const profileRequest = getPlayerProfile(id)
      .then((data) => {
        setProfile(data);
      })
      .catch((err) => {
        setError(
          err.message === "Failed to fetch"
            ? "Could not connect to GameSense. Check that the backend is running."
            : err.message
        );
      })
      .finally(() => {
        setLoading(false);
      });

    const matchesRequest = getPlayerMatches(id)
      .then((data) => {
        setMatches(data.matches ?? []);
      })
      .catch((err) => {
        setMatchesError(
          err.message === "Failed to fetch"
            ? "Could not connect to GameSense to load match history."
            : err.message
        );
      })
      .finally(() => {
        setMatchesLoading(false);
      });

    await Promise.all([profileRequest, matchesRequest]);
  }

  const player = profile?.player;
  const stats = profile?.stats;
  const rank = profile?.rank;
  const season = profile?.season;

  return (
    <>
      <section className="hero">
        <p className="eyebrow">YOUR GAME. YOUR NUMBERS.</p>

        <h1>
          Know your <span>game.</span>
        </h1>

        <p className="hero-description">
          Track performance. Understand your stats. Find your next level.
        </p>

        <PlayerSearchForm
          onSearch={searchPlayer}
          loading={loading || matchesLoading}
        />

        <p className="search-hint">
          Search using the player's exact Riot ID, including the tag.
        </p>
      </section>

      {error && (
        <div className="message error-message" role="alert">
          <span>!</span> {error}
        </div>
      )}

      {loading && (
        <div className="message loading-message" role="status">
          <span className="spinner" /> Fetching player statistics...
        </div>
      )}

      {!profile && !loading && !error && (
        <section className="empty-state">
          <div className="crosshair">⌖</div>
          <h2>Your next match starts with data.</h2>
          <p>
            Search a VALORANT player to explore their competitive stats.
          </p>
        </section>
      )}

      {profile && (
        <section className="profile-section">
          <PlayerOverview
            player={player}
            rank={rank}
            season={season}
            riotId={riotId}
          />

          <div className="section-heading">
            <div>
              <p className="eyebrow">PERFORMANCE</p>
              <h2>Competitive statistics</h2>
            </div>

            <span className="section-tag">CURRENT SEASON</span>
          </div>

          <StatsGrid stats={stats} />

          <p className="data-note">
            Statistics are provided by the connected data provider.
            Available stats may vary by player, season, and playlist.
          </p>

          <MatchAnalytics matches={matches} />
          
          <MatchHistory
            matches={matches}
            loading={matchesLoading}
            error={matchesError}
          />
        </section>
      )}
    </>
  );
}

export default ValorantProfilePage;
