"""
utils.py
--------
Utility functions for the Localized Keyword Rank Checker.

Contains Google's proprietary UULE parameter encoder, which encodes
a canonical location string so Google returns geo-targeted SERPs.
"""

import base64
import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Google uses a lookup table derived from the length of the canonical
# location string to produce a one-byte prefix before Base64 encoding.
# Reverse-engineered from Google's autocomplete JS bundle.
# ---------------------------------------------------------------------------
_UULE_SECRET_CHARS = (
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
)


def generate_uule(canonical_location: str) -> str:
    """
    Encode a canonical location string into Google's ``uule`` query parameter.

    Algorithm:
        1. Look up a secret byte from ``_UULE_SECRET_CHARS`` using
           ``len(location_bytes) % 64`` as the index.
        2. Prepend that byte to the UTF-8 location bytes.
        3. Base64-encode the result (standard, padded alphabet).
        4. Prepend the static Google prefix ``"w+CAIQICI"``.

    Args:
        canonical_location: Google-canonical place string, e.g.
            ``"New York,New York,United States"``.

    Returns:
        UULE-encoded string ready for use as a URL query parameter.

    Example::

        >>> generate_uule("New York,New York,United States")
        'w+CAIQICIkTmV3IFlvcmssT...'
    """
    location_bytes: bytes = canonical_location.encode("utf-8")
    secret_byte: int = ord(
        _UULE_SECRET_CHARS[len(location_bytes) % len(_UULE_SECRET_CHARS)]
    )
    payload: bytes = bytes([secret_byte]) + location_bytes
    encoded: str = base64.b64encode(payload).decode("utf-8")
    uule: str = f"w+CAIQICI{encoded}"
    logger.debug("UULE for %r → %s", canonical_location, uule)
    return uule


# ---------------------------------------------------------------------------
# Country-code mapping used for Google's ``gl`` (geolocation) parameter.
# ---------------------------------------------------------------------------
_COUNTRY_CODE_MAP: dict[str, str] = {
    "united states": "us",
    "united kingdom": "gb",
    "canada": "ca",
    "australia": "au",
    "germany": "de",
    "france": "fr",
    "india": "in",
    "japan": "jp",
    "brazil": "br",
    "netherlands": "nl",
    "spain": "es",
    "italy": "it",
    "mexico": "mx",
    "singapore": "sg",
    "turkey": "tr",
    "south africa": "za",
    "new zealand": "nz",
    "sweden": "se",
    "norway": "no",
    "denmark": "dk",
    "poland": "pl",
    "ukraine": "ua",
    "argentina": "ar",
    "south korea": "kr",
    "indonesia": "id",
    "pakistan": "pk",
    "nigeria": "ng",
    "egypt": "eg",
    "saudi arabia": "sa",
    "uae": "ae",
    "united arab emirates": "ae",
    "portugal": "pt",
    "belgium": "be",
    "switzerland": "ch",
    "austria": "at",
    "israel": "il",
    "greece": "gr",
    "thailand": "th",
    "malaysia": "my",
    "philippines": "ph",
    "vietnam": "vn",
    "colombia": "co",
    "chile": "cl",
    "peru": "pe",
    "czech republic": "cz",
    "hungary": "hu",
    "romania": "ro",
    "iraq": "iq",
}


def extract_country_code(canonical_location: str) -> str:
    """
    Extract an ISO 3166-1 alpha-2 country code from the tail segment of a
    canonical location string for Google's ``gl`` parameter.

    Args:
        canonical_location: e.g. ``"London,England,United Kingdom"``.

    Returns:
        Lowercase two-letter code (e.g. ``"gb"``).  Falls back to ``"us"``.
    """
    parts = [p.strip() for p in canonical_location.split(",")]
    country_name = parts[-1].lower() if parts else ""
    code = _COUNTRY_CODE_MAP.get(country_name, "us")
    logger.debug("Country %r → gl=%r", country_name, code)
    return code
