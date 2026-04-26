/**
 * SearchForm.jsx
 * --------------
 * Controlled form component that collects keyword, domain, and location
 * inputs.  Emits the validated payload upward via the ``onSubmit`` callback.
 *
 * @param {Object}   props
 * @param {Function} props.onSubmit  – Called with ``{ keyword, domain, location }``
 * @param {boolean}  props.loading   – Disables the form while a request is in flight
 */

import React, { useId, useState } from "react";
import LOCATIONS from "../locations";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DATALIST_ID = "location-options";

/**
 * Resolve the canonical location value from a free-text input string.
 * If the text exactly matches a label in LOCATIONS, return its value;
 * otherwise pass the raw string through to the backend unchanged.
 *
 * @param {string} text
 * @returns {string}
 */
function resolveLocationValue(text) {
  const match = LOCATIONS.find(
    (l) => l.label.toLowerCase() === text.trim().toLowerCase()
  );
  return match ? match.value : text.trim();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SearchForm({ onSubmit, loading }) {
  const [keyword, setKeyword] = useState("");
  const [domain, setDomain] = useState("");
  const [locationText, setLocationText] = useState("");
  const [validationError, setValidationError] = useState("");

  const keywordId = useId();
  const domainId = useId();
  const locationId = useId();

  /** Basic client-side validation before firing the network request. */
  function validate() {
    if (!keyword.trim()) return "Please enter a keyword.";
    if (!domain.trim()) return "Please enter a target domain.";
    if (!locationText.trim()) return "Please select or enter a location.";
    return "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError("");
    onSubmit({
      keyword: keyword.trim(),
      domain: domain.trim(),
      location: resolveLocationValue(locationText),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* ── Keyword ───────────────────────────────────────────────────── */}
      <div className="form-group">
        <label htmlFor={keywordId} className="form-label">
          Keyword
        </label>
        <input
          id={keywordId}
          type="text"
          className="form-input"
          placeholder="e.g. best pizza delivery"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {/* ── Target Domain ─────────────────────────────────────────────── */}
      <div className="form-group">
        <label htmlFor={domainId} className="form-label">
          Target Domain
        </label>
        <input
          id={domainId}
          type="text"
          className="form-input"
          placeholder="e.g. dominos.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
        />
        <p className="form-hint">Enter the bare domain – no https:// needed.</p>
      </div>

      {/* ── Location ──────────────────────────────────────────────────── */}
      <div className="form-group">
        <label htmlFor={locationId} className="form-label">
          Location
        </label>
        <input
          id={locationId}
          type="text"
          list={DATALIST_ID}
          className="form-input"
          placeholder="Search a city or type a canonical location…"
          value={locationText}
          onChange={(e) => setLocationText(e.target.value)}
          disabled={loading}
          autoComplete="off"
        />
        {/* Datalist feeds autocomplete suggestions; value stored is the label */}
        <datalist id={DATALIST_ID}>
          {LOCATIONS.map((loc) => (
            <option key={loc.value} value={loc.label} />
          ))}
        </datalist>
        <p className="form-hint">
          Pick from the list or type a custom canonical string like{" "}
          <code className="code-inline">City,Region,Country</code>.
        </p>
      </div>

      {/* ── Validation error ──────────────────────────────────────────── */}
      {validationError && (
        <p role="alert" className="validation-error">
          {validationError}
        </p>
      )}

      {/* ── Submit ────────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={loading}
        className="submit-btn"
        aria-busy={loading}
      >
        {loading ? (
          <span className="btn-inner">
            <Spinner />
            Checking rank…
          </span>
        ) : (
          "Check Rank"
        )}
      </button>
    </form>
  );
}

/** Inline SVG spinner rendered inside the submit button during loading. */
function Spinner() {
  return (
    <svg
      className="spinner-svg"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="spinner-track"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="spinner-head"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
