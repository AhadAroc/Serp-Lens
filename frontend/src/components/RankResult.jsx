/**
 * RankResult.jsx
 * --------------
 * Displays the outcome of a rank-check API call.
 *
 * Three distinct states are rendered:
 *   • Found    – shows the integer rank with a trophy icon.
 *   • Not found – domain was not in the top 100 results.
 *   • Error    – surfaces the error message from the API or network layer.
 *
 * @param {Object}      props
 * @param {Object|null} props.result – Successful API response payload, or null.
 * @param {string|null} props.error  – Error message string, or null.
 */

import React from "react";

export default function RankResult({ result, error }) {
  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="result-card result-card--error" role="alert">
        <div className="result-icon result-icon--error" aria-hidden="true">
          ✕
        </div>
        <h2 className="result-title result-title--error">Request Failed</h2>
        <p className="result-body">{error}</p>
      </div>
    );
  }

  // ── No result yet (initial render) ────────────────────────────────────
  if (!result) return null;

  const { keyword, domain, location, rank, found, total_results_parsed } =
    result;

  // ── Not found in top 100 ──────────────────────────────────────────────
  if (!found) {
    return (
      <div className="result-card result-card--notfound">
        <div className="result-icon result-icon--notfound" aria-hidden="true">
          —
        </div>
        <h2 className="result-title result-title--notfound">Not Ranked</h2>
        <p className="result-body">
          <strong>{domain}</strong> was not found in the top{" "}
          {total_results_parsed} organic results for{" "}
          <em>"{keyword}"</em> in <strong>{location}</strong>.
        </p>
      </div>
    );
  }

  // ── Found ─────────────────────────────────────────────────────────────
  return (
    <div className="result-card result-card--found">
      <div className="result-icon result-icon--found" aria-hidden="true">
        🏆
      </div>

      <h2 className="result-title result-title--found">
        Position{" "}
        <span className="rank-badge">#{rank}</span>
      </h2>

      <p className="result-body">
        <strong>{domain}</strong> ranks <strong>#{rank}</strong> on Google for{" "}
        <em>"{keyword}"</em> when searching from{" "}
        <strong>{location}</strong>.
      </p>

      <dl className="result-meta">
        <div className="meta-row">
          <dt>Keyword</dt>
          <dd>{keyword}</dd>
        </div>
        <div className="meta-row">
          <dt>Domain</dt>
          <dd>{domain}</dd>
        </div>
        <div className="meta-row">
          <dt>Location</dt>
          <dd>{location}</dd>
        </div>
        <div className="meta-row">
          <dt>Results scanned</dt>
          <dd>{total_results_parsed}</dd>
        </div>
      </dl>
    </div>
  );
}
