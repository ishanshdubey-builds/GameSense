
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function request(endpoint, params = {}) {
  const base = API_BASE
    ? `${API_BASE}/api/valorant`
    : "/api/valorant";

  const url = new URL(
    `${base}/${endpoint}`,
    window.location.origin
  );

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  let response;

  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      "Cannot connect to the GameSense API. Check that your backend is running."
    );
  }

  const body = await response.text();

  if (!body.trim()) {
    throw new Error(
      `The API returned an empty response (HTTP ${response.status}). Check the backend server.`
    );
  }

  let result;

  try {
    result = JSON.parse(body);
  } catch {
    throw new Error(
      `The API returned an invalid response (HTTP ${response.status}). Check the backend URL and server logs.`
    );
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || `GameSense API request failed (HTTP ${response.status}).`
    );
  }

  return result.data;
}

export function getPlayerProfile(playerId) {
  return request("profile", { playerId });
}

export function getPlayerMatches(playerId) {
  return request("matches", { playerId });
}

export function getMatchDetails(matchId, affinity = "ap") {
  return request(`match/${encodeURIComponent(matchId)}`, {
    affinity,
  });
}

export function getMatchCoaching(
  matchId,
  affinity = "ap",
  playerId
) {
  return request(
    `match/${encodeURIComponent(matchId)}/coach`,
    { affinity, playerId }
  );
}