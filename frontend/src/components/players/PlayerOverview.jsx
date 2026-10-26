
import { formatNumber } from "../../utils/formatNumber";

function PlayerOverview({ player, rank, season, riotId }) {
  return (
    <>
      <div className="profile-header">
        <div className="player-identity">
          {player?.avatarUrl ? (
            <img
              className="player-avatar"
              src={player.avatarUrl}
              alt="Player card"
            />
          ) : (
            <div className="player-avatar avatar-fallback">G</div>
          )}

          <div className="player-info">
            <p className="eyebrow">PLAYER OVERVIEW</p>
            <h2>{player?.riotId || riotId}</h2>
            <p className="player-meta">
              {(player?.region || "Region unavailable").toUpperCase()}
              {" · "}
              {player?.platform || "Riot"}
              {player?.accountLevel != null &&
                ` · Level ${formatNumber(player.accountLevel)}`}
            </p>
          </div>
        </div>

        <div className="rank-panel">
          {rank?.iconUrl && (
            <img className="rank-icon" src={rank.iconUrl} alt="" />
          )}

          <div>
            <p className="stat-label">COMPETITIVE RANK</p>
            <h3>{rank?.name || "Rank unavailable"}</h3>
            {rank?.displayValue && (
              <p className="rank-rating">{rank.displayValue} RR</p>
            )}
          </div>
        </div>
      </div>

      {season && (
        <div className="season-banner">
          <span className="live-dot" />
          <span>{season.name || "Competitive season"}</span>
          <span className="season-playlist">
            {season.playlistName || "Competitive"}
          </span>
        </div>
      )}
    </>
  );
}

export default PlayerOverview;
