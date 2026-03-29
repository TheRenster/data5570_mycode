"""Resolve US ZIP codes to lat/lon using OpenStreetMap Nominatim (free, no API key)."""

from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request


def geocode_us_zip(zip_code: str) -> tuple[float | None, float | None]:
    """
    Return (lat, lon) for a US ZIP, or (None, None) if not found / error.
    """
    z = ''.join(c for c in (zip_code or '') if c.isdigit())[:5]
    if len(z) < 5:
        return None, None

    q = urllib.parse.urlencode(
        {
            'postalcode': z,
            'country': 'us',
            'format': 'json',
            'limit': '1',
        }
    )
    url = f'https://nominatim.openstreetmap.org/search?{q}'
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'DATA5570-BarterCourse/1.0 (educational)'},
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            raw = resp.read().decode()
    except (urllib.error.URLError, TimeoutError, OSError):
        return None, None

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return None, None

    if not data:
        return None, None

    try:
        return float(data[0]['lat']), float(data[0]['lon'])
    except (KeyError, TypeError, ValueError):
        return None, None
