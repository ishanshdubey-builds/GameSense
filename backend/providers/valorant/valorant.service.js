
const valorantClient = require("./valorant.client");

async function fetchPlayerProfile(playerId) {
    validatePlayerId(playerId);

    return valorantClient.getPlayerProfile(playerId);
}

async function fetchPlayerMatches(playerId) {
    validatePlayerId(playerId);

    return valorantClient.getPlayerMatches(playerId);
}


async function fetchMatchDetails(affinity, matchId) {
    if (typeof affinity !== "string" || !affinity.trim()) {
        const error = new Error("A match region/affinity is required.");
        error.status = 400;
        throw error;
    }

    if (typeof matchId !== "string" || !matchId.trim()) {
        const error = new Error("A match ID is required.");
        error.status = 400;
        throw error;
    }

    return valorantClient.getMatchDetails(
        affinity.trim().toLowerCase(),
        matchId.trim()
    );
}



function validatePlayerId(playerId) {
    if (typeof playerId !== "string") {
        const error = new Error(
            "Player ID must be a string in Name#Tag format."
        );
        error.status = 400;
        throw error;
    }

    const normalizedId = playerId.trim();
    const separator = normalizedId.lastIndexOf("#");

    if (
        separator <= 0 ||
        separator === normalizedId.length - 1
    ) {
        const error = new Error(
            "Enter a valid Riot ID in Name#Tag format."
        );
        error.status = 400;
        throw error;
    }
}



module.exports = {
    fetchPlayerProfile,
    fetchPlayerMatches,
    fetchMatchDetails,
};

