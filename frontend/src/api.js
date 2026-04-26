/**
 * api.js
 * ------
 * Thin client for the SERP Lens FastAPI backend.
 */

const API_BASE =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Rank check
// ---------------------------------------------------------------------------

export async function checkRank(payload) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/rank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Unable to reach the backend server. Make sure it's running on port 8000.");
  }

  let data;
  try { data = await response.json(); } catch {
    throw new Error(`Unexpected non-JSON response (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail.map(d => d.msg).join("; ")
      : data.detail ?? `HTTP ${response.status}`;
    throw new Error(detail);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Keyword research
// ---------------------------------------------------------------------------

/**
 * @param {{ keyword: string, country: string, language: string }} payload
 * @returns {Promise<{ seed, country, language, keywords: Array, total: number }>}
 */
export async function fetchKeywords(payload) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/keywords`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Unable to reach the backend server. Make sure it's running on port 8000.");
  }

  let data;
  try { data = await response.json(); } catch {
    throw new Error(`Unexpected non-JSON response (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail.map(d => d.msg).join("; ")
      : data.detail ?? `HTTP ${response.status}`;
    throw new Error(detail);
  }
  return data;
}
