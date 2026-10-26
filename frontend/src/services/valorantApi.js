
const API_BASE = "/api/valorant";

async function request(endpoint, params = {}) {
  const url = new URL(
    `${API_BASE}/${endpoint}`,
    window.location.origin
  );

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "GameSense API request failed.");
  }

  return result.data;
}

export function getPlayerProfile(playerId) {
  return request("profile", { playerId });
}

export function getPlayerMatches(playerId) {
  return request("matches", { playerId });
}
