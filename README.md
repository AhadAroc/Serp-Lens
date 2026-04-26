#  SERP Lens — Localized Keyword Rank Checker

> Find where your domain ranks on Google — as seen from any city in the world.

An open-source tool that queries Google as if the user is standing at a specific geographic location, then returns the target domain's **organic position** in those search results.

---

##  Project Structure

```
rank-checker/
├── backend/
│   ├── main.py            # FastAPI app, routes, Pydantic schemas
│   ├── scraper.py         # SERP scraping with stealth logic & HTML parser
│   ├── utils.py           # UULE encoder + country-code mapper
│   └── requirements.txt   # Python dependencies
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── SearchForm.jsx   # Keyword / domain / location inputs
    │   │   └── RankResult.jsx   # Result / error display
    │   ├── App.jsx              # Root component, top-level state
    │   ├── api.js               # Typed API client (fetch wrapper)
    │   ├── locations.js         # 50+ pre-filled canonical locations
    │   ├── index.js             # React entry point
    │   └── index.css            # Full custom design system
    └── package.json
```

---

##  How It Works

### 1. UULE Generation (`utils.py`)
Google's `uule` parameter geo-targets search results. It is constructed by:
1. Finding a secret byte from a 64-character lookup table using `len(location_bytes) % 64`.
2. Prepending that byte to the UTF-8-encoded location string.
3. Base64-encoding the combined bytes.
4. Prepending the static prefix `"w+CAIQICI"`.

### 2. Anti-Bot Stealth (`scraper.py`)
- **7 modern User-Agent strings** (Chrome, Firefox, Edge, Safari) rotated randomly per request.
- **Randomised sleep** of 2–5 seconds before every outbound request.
- **Full browser-like headers** (`Accept`, `Accept-Language`, `Sec-Fetch-*`, `DNT`).

### 3. SERP Parsing (`scraper.py`)
- Builds a URL with `uule`, `gl` (country code), `hl=en`, `num=100`.
- Parses `div.g` blocks with BeautifulSoup4.
- Normalises URLs (strips scheme + `www.`) before domain comparison.
- Gracefully handles HTTP 429 (rate-limit) with a clear user-facing error.

---

##  Running Locally

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**

---

### Backend (FastAPI)

```bash
pip install -r requirements.txt
playwright install chromium
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

### Frontend (React)

```bash
# 1. Navigate to the frontend directory
cd rank-checker/frontend

# 2. Install Node dependencies
npm install

# 3. Start the development server
npm start
```

The UI will open at `http://localhost:3000`.

---

## 🛠 API Reference

### `POST /api/rank`

Check the organic rank of a domain for a keyword at a specific location.

**Request body:**
```json
{
  "keyword": "best pizza delivery",
  "domain": "dominos.com",
  "location": "Chicago,Illinois,United States"
}
```

**Success response (`200`):**
```json
{
  "keyword": "best pizza delivery",
  "domain": "dominos.com",
  "location": "Chicago,Illinois,United States",
  "rank": 4,
  "found": true,
  "total_results_parsed": 97
}
```

**Domain not in top 100:**
```json
{
  "rank": null,
  "found": false,
  "total_results_parsed": 100
}
```

**Error responses:**
| Code | Meaning |
|------|---------|
| `422` | Validation error (missing/invalid fields) |
| `429` | Google rate-limited the server IP |
| `502` | Unexpected scraping failure |
| `503` | Network connectivity error |

---

### `GET /api/health`
```json
{ "status": "ok" }
```

---

##  Adding Custom Locations

Edit `frontend/src/locations.js` to add any location using Google's canonical format:

```js
{ label: "Austin, USA", value: "Austin,Texas,United States" }
```

The format is always: `"City,Region,Country"` — match how Google identifies the place.

---

## ⚠️ Ethical Usage & Disclaimer

This tool is intended for **SEO research, competitive analysis, and educational purposes**.

- Do not send rapid automated requests — the built-in delay exists for a reason.
- Google's Terms of Service prohibit automated scraping of search results. Use responsibly.
- If you need high-volume rank checking, consider using the [Google Search Console API](https://developers.google.com/webmaster-tools) or a paid SERP API provider.

---
<img width="1130" height="794" alt="image" src="https://github.com/user-attachments/assets/ee6aefec-631e-4611-8de6-a49d371066d7" />

##  License

MIT © 2024 — free to use, modify, and distribute.
