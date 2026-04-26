import React, { useState, useRef } from "react";
import { fetchKeywords } from "../api";
import LOCATIONS from "../locations";

const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Arabic", value: "ar" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Italian", value: "it" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Chinese", value: "zh" },
  { label: "Korean", value: "ko" },
  { label: "Turkish", value: "tr" },
  { label: "Dutch", value: "nl" },
  { label: "Polish", value: "pl" },
  { label: "Hindi", value: "hi" },
];

// Derive unique countries from locations list
const COUNTRIES = [...new Set(
  LOCATIONS.map(l => l.value.split(",").pop().trim())
)].sort().map(c => ({ label: c, value: c }));

function Sparkline({ values, direction }) {
  if (!values || values.length === 0) return null;
  const w = 80, h = 28, pad = 2;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  const color = direction === "up" ? "#a3e635" : direction === "down" ? "#f87171" : "#38bdf8";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* End dot */}
      {(() => {
        const lastPt = pts.split(" ").pop().split(",");
        return <circle cx={lastPt[0]} cy={lastPt[1]} r="2.5" fill={color} />;
      })()}
    </svg>
  );
}

function CompetitionBadge({ level }) {
  const map = {
    low: { label: "Low", cls: "badge--low" },
    medium: { label: "Med", cls: "badge--med" },
    high: { label: "High", cls: "badge--high" },
  };
  const { label, cls } = map[level] || map.medium;
  return <span className={`badge ${cls}`}>{label}</span>;
}

function TrendArrow({ direction }) {
  if (direction === "up") return <span className="trend-arrow trend-arrow--up">↑</span>;
  if (direction === "down") return <span className="trend-arrow trend-arrow--down">↓</span>;
  return <span className="trend-arrow trend-arrow--flat">→</span>;
}

export default function KeywordTool() {
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("United States");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("default");
  const [filterDir, setFilterDir] = useState("all");
  const tableRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    setResults(null);
    setError(null);
    try {
      const data = await fetchKeywords({ keyword: keyword.trim(), country, language });
      setResults(data);
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    if (!results) return;
    const rows = [["Keyword", "Trend Direction", "Competition", "Source", ...Array.from({length:12},(_,i)=>`Month ${i+1}`)]];
    getFiltered().forEach(r => {
      rows.push([r.keyword, r.trend_direction, r.competition, r.source, ...r.trend]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keywords-${keyword}-${country}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    window.print();
  }

  function getFiltered() {
    if (!results) return [];
    let kws = [...results.keywords];
    if (filterDir !== "all") kws = kws.filter(k => k.trend_direction === filterDir);
    if (sortBy === "comp-asc") {
      const order = { low: 0, medium: 1, high: 2 };
      kws.sort((a, b) => order[a.competition] - order[b.competition]);
    } else if (sortBy === "comp-desc") {
      const order = { low: 0, medium: 1, high: 2 };
      kws.sort((a, b) => order[b.competition] - order[a.competition]);
    } else if (sortBy === "alpha") {
      kws.sort((a, b) => a.keyword.localeCompare(b.keyword));
    }
    return kws;
  }

  const filtered = getFiltered();

  return (
    <div className="keyword-tool">
      {/* Search card */}
      <div className="card">
        <form onSubmit={handleSubmit} className="kw-form">
          <div className="kw-form-row">
            <div className="form-group kw-form-seed">
              <label className="form-label">Seed Keyword</label>
              <input
                className="form-input"
                placeholder="e.g. coffee shop, python tutorial"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="form-group kw-form-lang">
              <label className="form-label">Language</label>
              <select
                className="form-input form-select"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                disabled={loading}
              >
                {LANGUAGES.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group kw-form-country">
              <label className="form-label">Country</label>
              <select
                className="form-input form-select"
                value={country}
                onChange={e => setCountry(e.target.value)}
                disabled={loading}
              >
                {COUNTRIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            <span className="btn-inner">
              {loading ? (
                <>
                  <svg className="spinner-svg" viewBox="0 0 24 24">
                    <circle className="spinner-track" cx="12" cy="12" r="10" fill="none" strokeWidth="3" stroke="currentColor"/>
                    <path className="spinner-head" fill="none" strokeWidth="3" stroke="currentColor" strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10"/>
                  </svg>
                  Fetching keywords… this takes ~30s
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  Research Keywords
                </>
              )}
            </span>
          </button>
        </form>
        <p className="form-hint" style={{marginTop:"0.75rem"}}>
          Returns up to 100 related keywords with trend data. Powered by Google Autocomplete + Google Trends.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="result-card result-card--error">
          <div className="result-icon result-icon--error">✕</div>
          <p className="result-title result-title--error">Request Failed</p>
          <p className="result-body">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="results-panel" ref={tableRef}>
          {/* Toolbar */}
          <div className="results-toolbar">
            <div className="results-meta-info">
              <span className="results-count">{filtered.length}</span>
              <span className="results-count-label"> keywords for </span>
              <span className="results-seed">"{results.seed}"</span>
              <span className="results-count-label"> · {results.country}</span>
            </div>
            <div className="toolbar-controls">
              <select
                className="form-input form-select toolbar-select"
                value={filterDir}
                onChange={e => setFilterDir(e.target.value)}
              >
                <option value="all">All Trends</option>
                <option value="up">↑ Trending Up</option>
                <option value="flat">→ Stable</option>
                <option value="down">↓ Trending Down</option>
              </select>
              <select
                className="form-input form-select toolbar-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="default">Default Order</option>
                <option value="alpha">A → Z</option>
                <option value="comp-asc">Competition: Low first</option>
                <option value="comp-desc">Competition: High first</option>
              </select>
              <button className="export-btn export-btn--csv" onClick={exportCSV} title="Export CSV">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                CSV
              </button>
              <button className="export-btn export-btn--pdf print-hide" onClick={exportPDF} title="Print / Save PDF">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                </svg>
                PDF
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <table className="kw-table">
              <thead>
                <tr>
                  <th className="col-num">#</th>
                  <th className="col-keyword">Keyword</th>
                  <th className="col-trend">12-Month Trend</th>
                  <th className="col-dir">Direction</th>
                  <th className="col-comp">Competition</th>
                  <th className="col-src print-hide">Source</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.keyword} className="kw-row">
                    <td className="col-num cell-num">{i + 1}</td>
                    <td className="col-keyword cell-keyword">
                      <span className="kw-text">{row.keyword}</span>
                    </td>
                    <td className="col-trend cell-trend print-hide">
                      <Sparkline values={row.trend} direction={row.trend_direction} />
                    </td>
                    <td className="col-dir cell-dir">
                      <TrendArrow direction={row.trend_direction} />
                    </td>
                    <td className="col-comp cell-comp">
                      <CompetitionBadge level={row.competition} />
                    </td>
                    <td className="col-src cell-src print-hide">
                      <span className="source-tag">{row.source}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
