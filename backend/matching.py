import spotipy


def search_spotify_matches(
    sp: spotipy.Spotify,
    artist: str,
    title: str,
    album: str = "",
    local_duration: float = 0.0,
    limit: int = 5,
) -> list[dict]:
    """Search Spotify for tracks matching the given metadata.

    Tries progressively broader queries if narrow ones yield no results.
    Returns up to `limit` matches, ranked by relevance.
    """
    queries = _build_queries(artist, title, album)
    seen_ids = set()
    results = []

    for query in queries:
        if len(results) >= limit:
            break
        try:
            resp = sp.search(q=query, type="track", limit=limit)
        except Exception:
            continue

        for item in resp.get("tracks", {}).get("items", []):
            if item["id"] in seen_ids:
                continue
            seen_ids.add(item["id"])

            spotify_duration = item["duration_ms"] / 1000.0
            duration_diff = (
                abs(spotify_duration - local_duration) if local_duration else None
            )

            results.append({
                "spotify_id": item["id"],
                "uri": item["uri"],
                "name": item["name"],
                "artists": [a["name"] for a in item["artists"]],
                "album": item["album"]["name"],
                "album_art": _best_image(item["album"].get("images", [])),
                "duration_seconds": round(spotify_duration, 1),
                "duration_diff": round(duration_diff, 1) if duration_diff is not None else None,
                "preview_url": item.get("preview_url"),
                "external_url": item.get("external_urls", {}).get("spotify", ""),
                "release_date": item["album"].get("release_date", ""),
            })

    # Sort: exact duration matches first, then by duration difference
    if local_duration:
        results.sort(key=lambda r: r["duration_diff"] if r["duration_diff"] is not None else 9999)

    return results[:limit]


def _build_queries(artist: str, title: str, album: str) -> list[str]:
    """Build a list of search queries from narrow to broad."""
    queries = []

    if artist and title and album:
        queries.append(f'artist:"{artist}" track:"{title}" album:"{album}"')

    if artist and title:
        queries.append(f'artist:"{artist}" track:"{title}"')

    if title and artist:
        # Fallback: plain text search with both
        queries.append(f"{artist} {title}")

    if title:
        queries.append(f'track:"{title}"')

    return queries


def _best_image(images: list[dict]) -> str:
    """Pick the medium-sized album art, or the first available."""
    if not images:
        return ""
    # Prefer ~300px image
    for img in images:
        w = img.get("width", 0)
        if w and 200 <= w <= 400:
            return img["url"]
    return images[0]["url"]
