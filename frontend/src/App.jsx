import React, { useState } from "react";
import KeywordTool from "./components/KeywordTool";
import RankChecker from "./components/RankChecker";
import "./index.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("keywords");

  return (
    <div className="page">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />

      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="logo-pill">
            <span className="logo-dot" />
            SERP LENS
          </div>
          <h1 className="heading">
            Keyword <span className="heading-accent">Research</span>
          </h1>
          <p className="subheading">
            Discover related keywords, trend signals, and competition data — powered by Google Autocomplete &amp; Trends.
          </p>
        </header>

        {/* Tab switcher */}
        <div className="tab-bar" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "keywords"}
            className={`tab-btn ${activeTab === "keywords" ? "tab-btn--active" : ""}`}
            onClick={() => setActiveTab("keywords")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Keyword Research
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "rank"}
            className={`tab-btn ${activeTab === "rank" ? "tab-btn--active" : ""}`}
            onClick={() => setActiveTab("rank")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Rank Checker
          </button>
        </div>

        {/* Tab panels */}
        <div className="tab-panel">
          {activeTab === "keywords" && <KeywordTool />}
          {activeTab === "rank" && <RankChecker />}
        </div>

        <footer className="footer">
          Open-source · MIT License ·{" "}
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="footer-link">
            View on GitHub
          </a>
        </footer>
      </main>
    </div>
  );
}
