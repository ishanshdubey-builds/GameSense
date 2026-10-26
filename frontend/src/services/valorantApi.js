
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

  const response = await fetch(url);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "GameSense API request failed."
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
