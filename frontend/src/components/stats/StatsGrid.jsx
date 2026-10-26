
import StatCard from "./StatCard";
import { formatNumber } from "../../utils/formatNumber";

function StatsGrid({ stats }) {
  return (
    <div className="stats-grid">
      <StatCard
        label="MATCHES PLAYED"
        value={formatNumber(stats?.matchesPlayed)}
      />

      <StatCard
        label="WIN RATE"
        value={
          stats?.winRate == null
            ? "—"
            : `${formatNumber(stats.winRate, 1)}%`
        }
        detail={
          stats?.wins != null && stats?.losses != null
            ? `${formatNumber(stats.wins)}W — ${formatNumber(stats.losses)}L`
            : undefined
        }
      />

      <StatCard
        label="K/D RATIO"
        value={formatNumber(stats?.kdRatio, 2)}
      />

      <StatCard
        label="AVG. COMBAT SCORE"
        value={formatNumber(stats?.acs, 1)}
      />

      <StatCard
        label="TOTAL KILLS"
        value={formatNumber(stats?.kills)}
      />

      <StatCard
        label="HEADSHOT RATE"
        value={
          stats?.headshotPercentage == null
            ? "—"
            : `${formatNumber(stats.headshotPercentage, 1)}%`
        }
      />
    </div>
  );
}

export default StatsGrid;
