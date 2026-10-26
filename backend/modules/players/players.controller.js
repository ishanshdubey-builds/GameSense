
const valorantService = require("../../providers/valorant/valorant.service");

async function getProfile(req, res) {
    try {
        const playerId = req.query.playerId;

        if (!playerId || !playerId.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a Riot ID using the playerId query parameter.",
            });
        }

        const raw = await valorantService.fetchPlayerProfile(playerId);

        // Unwrap the provider's response envelope safely.
        const profile = raw?.data?.data ?? raw?.data ?? raw;

        const platform = profile?.platformInfo ?? {};
        const account = profile?.userInfo ?? {};
        const metadata = profile?.metadata ?? {};

        const seasonSegment = (profile?.segments ?? []).find(
            (segment) =>
                segment.type === "season" &&
                segment.attributes?.playlist === "competitive" &&
                segment.attributes?.seasonId === metadata.defaultSeason
        );

        const stats = seasonSegment?.stats ?? {};
        const rank = stats.rank;

        return res.json({
            success: true,
            data: {
                player: {
                    riotId:
                        platform.platformUserHandle ??
                        platform.platformUserIdentifier ??
                        playerId,
                    avatarUrl: platform.avatarUrl ?? null,
                    platform: platform.platformSlug ?? null,
                    region: metadata.activeShard ?? null,
                    accountLevel: metadata.accountLevel ?? null,
                },
                season: seasonSegment?.metadata ?? null,
                rank: rank
                    ? {
                          name: rank.metadata?.tierName ?? null,
                          rating: rank.value ?? null,
                          displayValue: rank.displayValue ?? null,
                          iconUrl: rank.metadata?.iconUrl ?? null,
                      }
                    : null,
                stats: {
                    matchesPlayed: stats.matchesPlayed?.value ?? null,
                    wins: stats.matchesWon?.value ?? null,
                    losses: stats.matchesLost?.value ?? null,
                    winRate: stats.matchesWinPct?.value ?? null,
                    kills: stats.kills?.value ?? null,
                    deaths: stats.deaths?.value ?? null,
                    assists: stats.assists?.value ?? null,
                    kdRatio: stats.kDRatio?.value ?? null,
                    acs: stats.scorePerRound?.value ?? null,
                    headshotPercentage:
                        stats.headshotsPercentage?.value ?? null,
                },
                availableSegments: (profile?.segments ?? []).map(
                    (segment) => ({
                        type: segment.type,
                        name: segment.metadata?.name ?? null,
                    })
                ),
            },
        });
    } catch (error) {
        console.error("VALORANT profile lookup failed:", error.message);

        return res.status(error.status || 502).json({
            success: false,
            message:
                error.status === 400
                    ? error.message
                    : "Could not retrieve the player profile from the provider.",
        });
    }
}


async function getMatches(req, res) {
  try {
    const playerId = req.query.playerId;

    if (!playerId || !playerId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a Riot ID using the playerId query parameter.",
      });
    }

    const raw = await valorantService.fetchPlayerMatches(playerId);

    // Unwrap the provider response, following the profile controller's pattern.
    const payload = raw?.data?.data ?? raw?.data ?? raw;
    const matches = Array.isArray(payload?.matches)
      ? payload.matches
      : [];

    return res.json({
      success: true,
      data: {
        matches,
        count: payload?.count ?? matches.length,
        next: payload?.next ?? null,
        hasMore: payload?.has_more ?? false,
      },
    });
  } catch (error) {
    console.error("VALORANT match lookup failed:", error.message);

    return res.status(error.status || 502).json({
      success: false,
      message:
        error.status === 400
          ? error.message
          : "Could not retrieve match history from the provider.",
    });
  }
}


module.exports = {
    getProfile,
    getMatches,
};
