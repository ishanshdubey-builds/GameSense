
const BASE_URL =
    "https://api.parse.bot/scraper/6517942a-644e-4cbc-9349-6e6d5ddaa622";

async function request(endpoint, params = {}) {
    const apiKey = process.env.PARSE_API_KEY;

    if (!apiKey) {
        throw new Error("PARSE_API_KEY is missing from .env.");
    }

    const query = new URLSearchParams(params);
    const url = `${BASE_URL}/${endpoint}?${query.toString()}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "X-API-Key": apiKey,
            Accept: "application/json",
        },
        signal: AbortSignal.timeout(15000),
    });

    const body = await response.json();

    if (!response.ok) {
        const error = new Error(
            body.error || `Provider returned HTTP ${response.status}.`
        );
        error.status = response.status;
        throw error;
    }

    return body;
}

async function getPlayerProfile(playerId) {
    return request("get_player_profile", { player_id: playerId });
}

async function getPlayerMatches(playerId) {
    return request("get_player_matches", { player_id: playerId });
}

module.exports = {
    getPlayerProfile,
    getPlayerMatches,
};
