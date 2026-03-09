import os
import sys

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from pydantic import BaseModel

from config import settings
from matching import search_spotify_matches
from scanner import scan_folder
from spotify import get_auth_url, get_spotify, handle_callback

app = FastAPI(title="MP3 Metadata Grabber")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cache of scanned tracks
_tracks_cache: list[dict] = []


# ──── Auth endpoints ────


@app.get("/auth/status")
def auth_status():
    sp = get_spotify()
    if sp is None:
        return {"authenticated": False, "auth_url": get_auth_url()}
    try:
        user = sp.current_user()
        return {"authenticated": True, "user": user["display_name"]}
    except Exception:
        return {"authenticated": False, "auth_url": get_auth_url()}


@app.get("/callback")
def spotify_callback(code: str = Query(...)):
    success = handle_callback(code)
    if success:
        return RedirectResponse("http://localhost:5173")
    raise HTTPException(400, "Spotify authorization failed")


# ──── Track scanning ────


@app.get("/tracks")
def list_tracks(offset: int = 0, limit: int = 50):
    global _tracks_cache
    folder = settings.mp3_folder_path
    if not folder:
        raise HTTPException(400, "MP3_FOLDER_PATH not configured")
    if not _tracks_cache:
        _tracks_cache = scan_folder(folder)
    total = len(_tracks_cache)
    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "tracks": _tracks_cache[offset : offset + limit],
    }


@app.post("/tracks/rescan")
def rescan_tracks():
    global _tracks_cache
    folder = settings.mp3_folder_path
    if not folder:
        raise HTTPException(400, "MP3_FOLDER_PATH not configured")
    _tracks_cache = scan_folder(folder)
    return {"total": len(_tracks_cache)}


@app.get("/tracks/audio")
def serve_audio(path: str = Query(...)):
    """Serve a local MP3 file for playback in the browser."""
    # Security: only serve files under the configured MP3 folder
    folder = os.path.realpath(settings.mp3_folder_path)
    real_path = os.path.realpath(path)
    if not real_path.startswith(folder):
        raise HTTPException(403, "Access denied")
    if not os.path.isfile(real_path):
        raise HTTPException(404, "File not found")
    return FileResponse(real_path, media_type="audio/mpeg")


# ──── Spotify matching ────


@app.get("/match")
def match_track(
    artist: str = "",
    title: str = "",
    album: str = "",
    duration: float = 0.0,
    limit: int = 5,
):
    sp = get_spotify()
    if sp is None:
        raise HTTPException(401, "Not authenticated with Spotify")
    if not artist and not title:
        raise HTTPException(400, "Provide at least artist or title")
    results = search_spotify_matches(sp, artist, title, album, duration, limit)
    return {"matches": results}


# ──── Playlist operations ────


@app.get("/playlists")
def list_playlists():
    sp = get_spotify()
    if sp is None:
        raise HTTPException(401, "Not authenticated with Spotify")
    results = sp.current_user_playlists(limit=50)
    playlists = [
        {"id": p["id"], "name": p["name"], "tracks": p["tracks"]["total"]}
        for p in results["items"]
    ]
    return {"playlists": playlists}


class AddTrackRequest(BaseModel):
    spotify_uri: str
    playlist_id: str | None = None  # None = add to Liked Songs


@app.post("/add")
def add_to_playlist(req: AddTrackRequest):
    sp = get_spotify()
    if sp is None:
        raise HTTPException(401, "Not authenticated with Spotify")

    if req.playlist_id:
        sp.playlist_add_items(req.playlist_id, [req.spotify_uri])
        return {"status": "added", "target": "playlist", "playlist_id": req.playlist_id}
    else:
        track_id = req.spotify_uri.split(":")[-1]
        sp.current_user_saved_tracks_add([track_id])
        return {"status": "added", "target": "liked_songs"}


class BatchAddRequest(BaseModel):
    spotify_uris: list[str]
    playlist_id: str | None = None


@app.post("/add/batch")
def batch_add(req: BatchAddRequest):
    sp = get_spotify()
    if sp is None:
        raise HTTPException(401, "Not authenticated with Spotify")

    if req.playlist_id:
        # Spotify API allows max 100 per request
        for i in range(0, len(req.spotify_uris), 100):
            batch = req.spotify_uris[i : i + 100]
            sp.playlist_add_items(req.playlist_id, batch)
        return {"status": "added", "count": len(req.spotify_uris), "target": "playlist"}
    else:
        track_ids = [uri.split(":")[-1] for uri in req.spotify_uris]
        for i in range(0, len(track_ids), 50):
            batch = track_ids[i : i + 50]
            sp.current_user_saved_tracks_add(batch)
        return {"status": "added", "count": len(req.spotify_uris), "target": "liked_songs"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
