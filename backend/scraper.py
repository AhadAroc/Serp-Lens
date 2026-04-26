"""
scraper.py
----------
Google SERP scraper using Playwright async API (required inside FastAPI).
"""

import asyncio
import logging
import random
import re
import time
from dataclasses import dataclass
from urllib.parse import quote_plus, urlparse

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from bs4 import BeautifulSoup

from utils import extract_country_code, generate_uule

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

_DELAY_MIN: float = 1.5
_DELAY_MAX: float = 3.5
_GOOGLE_SEARCH_URL: str = "https://www.google.com/search"
_NAV_TIMEOUT: int = 30_000

_VIEWPORTS = [
    {"width": 1920, "height": 1080},
    {"width": 1440, "height": 900},
    {"width": 1366, "height": 768},
    {"width": 1536, "height": 864},
]

_USER_AGENTS: list[str] = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
]

_GOOGLE_INTERNAL_DOMAINS: tuple[str, ...] = (
    "google.com", "google.", "googleapis.com", "gstatic.com",
    "youtube.com", "accounts.google", "support.google",
    "policies.google", "maps.google",
)

_BOT_PHRASES: tuple[str, ...] = (
    "our systems have detected unusual traffic",
    "press & hold",
    "i'm not a robot",
    "captcha",
    "verify you are human",
)


# ---------------------------------------------------------------------------
# Result type
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class RankResult:
    keyword: str
    domain: str
    location: str
    rank: int | None
    found: bool
    total_results_parsed: int


# ---------------------------------------------------------------------------
# Public API  (async — called with await from FastAPI endpoints)
# ---------------------------------------------------------------------------

async def check_rank(keyword: str, domain: str, canonical_location: str) -> RankResult:
    """
    Launch headless Chromium, navigate to a geo-targeted Google SERP,
    wait for JS rendering, then parse and return the domain's rank.
    """
    url = _build_search_url(keyword, canonical_location)
    gl  = extract_country_code(canonical_location)
    ua  = random.choice(_USER_AGENTS)
    vp  = random.choice(_VIEWPORTS)

    logger.info("Fetching SERP | keyword=%r | domain=%r | location=%r",
                keyword, domain, canonical_location)
    logger.debug("URL: %s", url)

    delay = random.uniform(_DELAY_MIN, _DELAY_MAX)
    logger.debug("Stealth delay: %.2fs", delay)
    await asyncio.sleep(delay)

    html = await _fetch_with_playwright(url, ua, vp, gl)
    rank, total = _parse_serp(html, domain)

    logger.info("Parse complete | organic_blocks=%d | rank=%s", total, rank)

    return RankResult(
        keyword=keyword,
        domain=domain,
        location=canonical_location,
        rank=rank,
        found=rank is not None,
        total_results_parsed=total,
    )


# ---------------------------------------------------------------------------
# Playwright fetch (async)
# ---------------------------------------------------------------------------

async def _fetch_with_playwright(url: str, user_agent: str, viewport: dict, gl: str) -> str:
    """Open headless Chromium, inject consent cookies, navigate, return HTML."""
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
            ],
        )

        context = await browser.new_context(
            user_agent=user_agent,
            viewport=viewport,
            locale="en-US",
            timezone_id="America/New_York",
            bypass_csp=True,
        )

        await context.add_cookies([
            {
                "name": "CONSENT",
                "value": "YES+cb.20240101-07-p0.en+FX+110",
                "domain": ".google.com",
                "path": "/",
            },
            {
                "name": "SOCS",
                "value": "CAISHAgBEhJnd3NfMjAyNDA0MDItMF9SQzEaAmVuIAEaBgiA8LquBg",
                "domain": ".google.com",
                "path": "/",
            },
        ])

        page = await context.new_page()

        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins',   { get: () => [1, 2, 3] });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        """)

        try:
            await page.goto(url, wait_until="networkidle", timeout=_NAV_TIMEOUT)
        except PlaywrightTimeout:
            logger.warning("networkidle timed out; retrying with domcontentloaded")
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=_NAV_TIMEOUT)
                await page.wait_for_timeout(3000)
            except PlaywrightTimeout as exc:
                await browser.close()
                raise RuntimeError(
                    "Timed out waiting for Google to load. Check your connection."
                ) from exc

        html = await page.content()
        await browser.close()

    return html


# ---------------------------------------------------------------------------
# URL builder + domain helpers
# ---------------------------------------------------------------------------

def _build_search_url(keyword: str, canonical_location: str) -> str:
    uule = generate_uule(canonical_location)
    gl   = extract_country_code(canonical_location)
    params = {
        "q": keyword, "uule": uule, "gl": gl,
        "hl": "en", "num": "100",
        "ie": "UTF-8", "oe": "UTF-8",
        "pws": "0", "nfpr": "1",
    }
    qs = "&".join(f"{k}={quote_plus(str(v))}" for k, v in params.items())
    return f"{_GOOGLE_SEARCH_URL}?{qs}"


def _normalise_domain(raw: str) -> str:
    if not raw.startswith(("http://", "https://")):
        raw = "https://" + raw
    netloc = urlparse(raw).netloc.lower()
    return re.sub(r"^www\.", "", netloc)


def _make_session(user_agent: str):
    """Kept for debug endpoint compatibility in main.py."""
    import requests
    s = requests.Session()
    s.headers.update({"User-Agent": user_agent})
    return s


# ---------------------------------------------------------------------------
# SERP parser
# ---------------------------------------------------------------------------

def _parse_serp(html: str, target_domain: str) -> tuple[int | None, int]:
    soup = BeautifulSoup(html, "html.parser")
    normalised_target = _normalise_domain(target_domain)

    page_text = soup.get_text(separator=" ", strip=True).lower()
    if any(phrase in page_text for phrase in _BOT_PHRASES):
        raise RuntimeError(
            "Google returned a CAPTCHA or bot-detection page. "
            "Wait a few minutes and try again."
        )

    _SELECTORS = [
        "div.g", "div.tF2Cxc", "div.yuRUbf",
        "div[data-hveid]", "div.MjjYud div.g", "li.g",
    ]

    hrefs: list[str] = []
    for selector in _SELECTORS:
        blocks = soup.select(selector)
        if not blocks:
            continue
        candidates: list[str] = []
        for block in blocks:
            anchor = block.find("a", href=True)
            if anchor:
                href: str = anchor["href"]
                if href.startswith(("http://", "https://")):
                    candidates.append(href)
        if candidates:
            hrefs = candidates
            logger.debug("Selector %r matched %d hrefs", selector, len(hrefs))
            break

    if not hrefs:
        logger.warning("No structured blocks — scanning all anchors. Page: %d chars", len(html))
        for anchor in soup.find_all("a", href=True):
            href = anchor["href"]
            if not href.startswith(("http://", "https://")):
                continue
            d = _normalise_domain(href)
            if not any(gi in d for gi in _GOOGLE_INTERNAL_DOMAINS):
                hrefs.append(href)

    seen: set[str] = set()
    unique_hrefs: list[str] = []
    for href in hrefs:
        d = _normalise_domain(href)
        if d and d not in seen:
            seen.add(d)
            unique_hrefs.append(href)

    found_rank: int | None = None
    for position, href in enumerate(unique_hrefs, start=1):
        result_domain = _normalise_domain(href)
        logger.debug("  [%d] %s", position, result_domain)
        if normalised_target in result_domain or result_domain in normalised_target:
            found_rank = position
            logger.info("Target found at position %d", position)
            break

    total = len(unique_hrefs)
    logger.info("Parsed %d unique domains | rank=%s", total, found_rank)
    return found_rank, total
