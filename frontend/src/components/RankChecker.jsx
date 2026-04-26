import React, { useState } from "react";
import { checkRank } from "../api";
import LOCATIONS from "../locations";

export default function RankChecker() {
  const [keyword, setKeyword] = useState("");
  const [domain, setDomain] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const locationId = "location-list";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await checkRank({ keyword, domain, location });
      setResult(data);
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label className="form-label">Keyword</label>
            <input
              className="form-input"
              placeholder="e.g. python tutorial"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Domain</label>
            <input
              className="form-input"
              placeholder="e.g. docs.python.org"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              disabled={loading}
              required
            />
            <p className="form-hint">Enter the bare domain — no https:// needed.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              className="form-input"
              list={locationId}
              placeholder="e.g. New York,New York,United States"
              value={location}
              onChange={e => setLocation(e.target.value)}
              disabled={loading}
              required
            />
            <datalist id={locationId}>
              {LOCATIONS.map(l => (
                <option key={l.value} value={l.value} label={l.label} />
              ))}
            </datalist>
            <p className="form-hint">
              Pick from the list or type a custom canonical string like{" "}
              <code className="code-inline">City,Region,Country</code>.
            </p>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            <span className="btn-inner">
              {loading ? (
                <>
                  <svg className="spinner-svg" viewBox="0 0 24 24">
                    <circle className="spinner-track" cx="12" cy="12" r="10" fill="none" strokeWidth="3" stroke="currentColor"/>
                    <path className="spinner-head" fill="none" strokeWidth="3" stroke="currentColor" strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10"/>
                  </svg>
                  Checking rank…
                </>
              ) : "Check Rank"}
            </span>
          </button>
        </form>
      </div>

      {/* Result */}
      {(result || error) && (
        <div style={{ marginTop: "1.5rem" }} aria-live="polite">
          {error && (
            <div className="result-card result-card--error">
              <div className="result-icon result-icon--error">✕</div>
              <p className="result-title result-title--error">Request Failed</p>
              <p className="result-body">{error}</p>
            </div>
          )}
          {result && (
            <div className={`result-card ${result.found ? "result-card--found" : "result-card--notfound"}`}>
              <div className={`result-icon ${result.found ? "result-icon--found" : "result-icon--notfound"}`}>
                {result.found ? "✓" : "—"}
              </div>
              <p className={`result-title ${result.found ? "result-title--found" : "result-title--notfound"}`}>
                {result.found ? (
                  <>Ranked <span className="rank-badge">#{result.rank}</span></>
                ) : "Not Ranked"}
              </p>
              <p className="result-body">
                {result.found
                  ? <><strong>{result.domain}</strong> ranks #{result.rank} for <em>"{result.keyword}"</em> in {result.location}.</>
                  : <><strong>{result.domain}</strong> was not found in the top {result.total_results_parsed} organic results for <em>"{result.keyword}"</em> in {result.location}.</>
                }
              </p>
              <dl className="result-meta">
                <div className="meta-row">
                  <dt>Keyword</dt><dd>{result.keyword}</dd>
                </div>
                <div className="meta-row">
                  <dt>Domain</dt><dd>{result.domain}</dd>
                </div>
                <div className="meta-row">
                  <dt>Location</dt><dd>{result.location}</dd>
                </div>
                <div className="meta-row">
                  <dt>Results scanned</dt><dd>{result.total_results_parsed}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
