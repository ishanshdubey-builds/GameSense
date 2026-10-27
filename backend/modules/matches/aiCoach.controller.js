
const OpenAI = require("openai");
const {
    fetchMatchDetails,
} = require("../../providers/valorant/valorant.service");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "missing-api-key",
});

async function getMatchCoaching(req, res) {
    try {
        const matchId = String(req.params.matchId || "").trim();
        const affinity = String(req.query.affinity || "ap")
            .trim()
            .toLowerCase();
        const playerId = String(req.query.playerId || "").trim();

        // 1. Validate the request and API configuration
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                success: false,
                message:
                    "AI Coach is not configured. Add OPENAI_API_KEY to the backend environment.",
            });
        }

        if (!matchId) {
            return res.status(400).json({
                success: false,
                message: "A match ID is required.",
            });
        }

        if (!playerId) {
            return res.status(400).json({
                success: false,
                message:
                    "Select a player before generating the coaching report.",
            });
        }

        // 2. Fetch match details
        const matchResponse = await fetchMatchDetails(
            affinity,
            matchId
        );

        // Support wrapped and unwrapped match responses
        const match = matchResponse?.data ?? matchResponse;

        if (!match || !Array.isArray(match.players)) {
            console.error(
                "AI Coach: unexpected match response structure",
                Object.keys(match || {})
            );

            return res.status(502).json({
                success: false,
                message:
                    "The match provider returned an unexpected response. Please try again.",
            });
        }

        // 3. Find the exact player selected in the frontend
        const selectedPlayer = match.players.find(
            (player) => player.puuid === playerId
        );

        if (!selectedPlayer) {
            return res.status(404).json({
                success: false,
                message:
                    "The selected player was not found in this match. Refresh the match page and try again.",
            });
        }

        const stats = selectedPlayer.stats || {};
        const metadata = match.metadata || {};
        const rounds = Array.isArray(match.rounds)
            ? match.rounds
            : [];
        const teams = Array.isArray(match.teams)
            ? match.teams
            : [];

        const team = teams.find(
            (item) => item.team_id === selectedPlayer.team_id
        );

        // 4. Calculate headshot percentage when shot counts are available
        const headshots = Number(stats.headshots || 0);
        const bodyshots = Number(stats.bodyshots || 0);
        const legshots = Number(stats.legshots || 0);

        const totalShots = headshots + bodyshots + legshots;

        const headshotPercentage =
            totalShots > 0
                ? Number(
                      ((headshots / totalShots) * 100).toFixed(1)
                  )
                : null;

        // 5. Prepare data for the selected player only
        const playerData = {
            puuid: selectedPlayer.puuid,
            name: selectedPlayer.name || "Unknown",
            tag: selectedPlayer.tag || "",
            agent: selectedPlayer.agent?.name || "Unknown",
            team: selectedPlayer.team_id || "Unknown",
            rank: selectedPlayer.tier?.name || "Unavailable",

            teamResult: team
                ? {
                      roundsWon: team.rounds?.won ?? null,
                      roundsLost: team.rounds?.lost ?? null,
                      won: team.won ?? null,
                  }
                : null,

            stats: {
                kills: stats.kills ?? null,
                deaths: stats.deaths ?? null,
                assists: stats.assists ?? null,
                score: stats.score ?? null,
                damageDealt: stats.damage?.dealt ?? null,
                damageReceived: stats.damage?.received ?? null,
                headshots: stats.headshots ?? null,
                bodyshots: stats.bodyshots ?? null,
                legshots: stats.legshots ?? null,
                headshotPercentage,
            },

            performance: selectedPlayer.performance
                ? {
                      score:
                          selectedPlayer.performance.score ?? null,
                      ratings:
                          selectedPlayer.performance.ratings ?? null,
                  }
                : null,

            abilityCasts: selectedPlayer.ability_casts ?? null,

            economy: selectedPlayer.economy
                ? {
                      totalSpent:
                          selectedPlayer.economy.spent?.overall ?? null,
                      averageSpent:
                          selectedPlayer.economy.spent?.average ?? null,
                      averageLoadoutValue:
                          selectedPlayer.economy.loadout_value
                              ?.average ?? null,
                  }
                : null,
        };

        // 6. Build a compact match summary
        const matchData = {
            matchId,
            affinity,
            map: metadata.map?.name || "Unknown",
            mode: metadata.queue?.name || "Unknown",
            durationMs: metadata.game_length_in_ms ?? null,
            completed: metadata.is_completed ?? null,
            recordedRoundCount: rounds.length,
            selectedPlayer: playerData,
        };

        // 7. Generate the coaching report
        const response = await openai.responses.create({
            model: "gpt-4.1-mini",

            instructions: `
You are GameSense AI Coach, a careful VALORANT performance coach.

Analyze ONLY the supplied match data and coach the specifically
selected player in selectedPlayer.

STRICT ACCURACY RULES:
- Never attribute another player's statistics to the selected player.
- Use only facts and statistics present in the supplied data.
- Never invent kills, deaths, clutches, first bloods, round events,
  ability usage, economy, positioning, crosshair placement,
  communication, or gameplay decisions.
- Never describe a statistic as above or below average without
  a valid comparison benchmark in the supplied data.
- Scoreboard statistics alone do not prove poor aim, bad positioning,
  missed trades, or poor decision-making.
- Ability cast counts show frequency only; they do not prove
  that utility was used effectively or ineffectively.
- Do not claim an objective was planted, defused, or missed unless
  that specific event is provided.
- Do not assume missing statistics are zero.
- Do not call the player MVP unless the supplied data establishes it.
- Do not claim a rank unless it is supplied and identifiable.
- Do not recommend abilities belonging to another agent.
- Clearly distinguish measured facts from possible explanations.
- Present uncertain coaching ideas as suggestions to test,
  not as confirmed mistakes.
- If the available data cannot support a conclusion, say so briefly.
- Do not make unsupported claims about expected rank performance.

REPORT FORMAT:
Use Markdown headings exactly as shown below.
Do NOT format the section headings as a numbered list.

## 1. Match Overview
Summarize the map, mode, result, agent, and available statistics.

## 2. Strengths Backed by Statistics
Give 2-4 concise bullet points based on verifiable facts.
Do not invent strengths or benchmarks.

## 3. Areas to Improve
Give 2-4 concise bullet points.
Explain what the statistics show without claiming they prove
an unobserved gameplay mistake.

## 4. Practical Coaching Tips
Give 3-5 specific, constructive suggestions appropriate
for the selected agent and available evidence.

## 5. Three-Step Practice Plan
Give exactly three numbered steps.
Each step must include a practical exercise and suggested duration.
Clearly present durations as recommendations, not measured facts.

FORMATTING RULES:
- Use Markdown headings beginning with ## for all five sections.
- Use bullet points for strengths, improvement areas, and tips.
- Use a numbered list only for the three practice steps.
- Keep paragraphs short and avoid unnecessary blank lines.
- Avoid repeating the same observation in multiple sections.
- Keep the report concise, specific, and actionable.
- Do not include an unsupported overall grade or performance benchmark.
`,

            input: JSON.stringify({
                task:
                    "Analyze the selected player's VALORANT match performance and create an evidence-based coaching report.",
                matchData,
            }),
        });

        const coaching = response.output_text;

        if (!coaching || !coaching.trim()) {
            return res.status(502).json({
                success: false,
                message:
                    "The AI did not return a coaching report. Please try again.",
            });
        }

        // 8. Return the report and selected-player identity
        return res.json({
            success: true,
            data: {
                matchId,
                affinity,
                player: {
                    puuid: playerData.puuid,
                    name: playerData.name,
                    tag: playerData.tag,
                    agent: playerData.agent,
                },
                coaching,
            },
        });
    } catch (error) {
        console.error("AI Coach error:", error.message);

        const status =
            error.status || error.statusCode || 500;

        if (status === 401) {
            return res.status(500).json({
                success: false,
                message:
                    "The OpenAI API key is invalid or not accepted. Check the backend environment configuration.",
            });
        }

        if (status === 429) {
            return res.status(429).json({
                success: false,
                message:
                    "OpenAI API quota or rate limit reached. Check your API billing and usage.",
            });
        }

        if (status === 400) {
            return res.status(400).json({
                success: false,
                message:
                    error.message || "The AI request was invalid.",
            });
        }

        return res.status(
            status >= 400 && status < 600 ? status : 500
        ).json({
            success: false,
            message:
                error.message || "Unable to generate match coaching.",
        });
    }
}

module.exports = { getMatchCoaching };
