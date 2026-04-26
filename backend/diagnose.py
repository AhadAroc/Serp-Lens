"""
diagnose.py
-----------
Standalone diagnostic script. Run this directly to see exactly
what Google is returning, with no FastAPI layer in the way.

Usage:
    python diagnose.py
"""

import sys
import random
import requests
from bs4 import BeautifulSoup

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

def diagnose():
    print("=" * 60)
    print("SERP LENS — Diagnostic Script")
    print("=" * 60)

    # Step 1: Can we reach Google at all?
    print("\n[1] Testing basic connectivity to google.com ...")
    try:
        r = requests.get("https://www.google.com/", timeout=10,
                         headers={"User-Agent": UA})
        print(f"    ✓ google.com responded: HTTP {r.status_code}")
        print(f"    ✓ Cookies received: {list(r.cookies.keys())}")
    except Exception as e:
        print(f"    ✗ FAILED: {e}")
        print("    → Check your internet connection or firewall.")
        sys.exit(1)

    # Step 2: Try a search with a session (with consent cookies)
    print("\n[2] Creating session with CONSENT + SOCS cookies ...")
    session = requests.Session()
    session.headers.update({
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Referer": "https://www.google.com/",
    })
    session.cookies.set("CONSENT", "YES+cb.20240101-07-p0.en+FX+110", domain=".google.com", path="/")
    session.cookies.set("SOCS", "CAISHAgBEhJnd3NfMjAyNDA0MDItMF9SQzEaAmVuIAEaBgiA8LquBg", domain=".google.com", path="/")

    # Warm-up
    try:
        wu = session.get("https://www.google.com/", timeout=10, allow_redirects=True)
        print(f"    ✓ Warm-up done: HTTP {wu.status_code}")
        print(f"    ✓ All cookies now: {list(session.cookies.keys())}")
    except Exception as e:
        print(f"    ⚠ Warm-up failed (continuing anyway): {e}")

    # Step 3: Fire the actual search
    import time
    print("\n[3] Waiting 3 seconds (stealth delay) ...")
    time.sleep(3)

    search_url = "https://www.google.com/search?q=good+pizza&gl=es&hl=en&num=100&pws=0"
    print(f"\n[4] Fetching search URL:\n    {search_url}")

    try:
        resp = session.get(search_url, timeout=20, allow_redirects=True)
        print(f"    ✓ Response: HTTP {resp.status_code}")
        print(f"    ✓ Final URL: {resp.url}")
        print(f"    ✓ Page length: {len(resp.text):,} characters")
    except Exception as e:
        print(f"    ✗ FAILED: {e}")
        sys.exit(1)

    # Step 4: Diagnose what we got
    print("\n[5] Analysing page content ...")
    html = resp.text
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(separator=" ", strip=True).lower()

    if "before you continue" in text or "socs" in text.lower():
        print("    ✗ CONSENT WALL — Google is showing a consent page.")
        print("    → The SOCS/CONSENT cookies didn't work for this region.")
    elif "unusual traffic" in text or "captcha" in text:
        print("    ✗ BOT DETECTION — Google flagged this IP.")
        print("    → Wait 5-10 minutes and try again.")
    elif len(html) < 5000:
        print(f"    ✗ SHORT PAGE ({len(html)} chars) — likely a redirect or block.")
        print(f"    → First 500 chars: {html[:500]}")
    else:
        print(f"    ✓ Got a real page ({len(html):,} chars)")

    # Step 5: Check for result blocks
    selectors = ["div.g", "div.tF2Cxc", "div.yuRUbf", "div[data-hveid]"]
    print("\n[6] Checking CSS selectors for result blocks ...")
    for sel in selectors:
        blocks = soup.select(sel)
        print(f"    {sel:25s} → {len(blocks):3d} blocks found")

    # Step 6: Count all external links
    external_links = [
        a["href"] for a in soup.find_all("a", href=True)
        if a["href"].startswith("http") and "google" not in a["href"]
    ]
    print(f"\n[7] Total non-Google http links on page: {len(external_links)}")
    if external_links:
        print("    First 5 links found:")
        for link in external_links[:5]:
            print(f"      {link[:80]}")

    # Step 7: Save full HTML for manual inspection
    with open("google_debug.html", "w", encoding="utf-8") as f:
        f.write(html)
    print(f"\n[8] Full HTML saved to: google_debug.html")
    print("    → Open this file in your browser to see what Google returned.")
    print("\n" + "=" * 60)
    print("Diagnostic complete.")
    print("=" * 60)

if __name__ == "__main__":
    diagnose()
