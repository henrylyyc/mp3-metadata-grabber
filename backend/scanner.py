import os
from pathlib import Path

from mutagen.id3 import ID3, ID3NoHeaderError
from mutagen.mp3 import MP3


def scan_folder(folder_path: str) -> list[dict]:
    """Scan a folder for MP3 files and extract ID3 metadata."""
    folder = Path(folder_path)
    if not folder.is_dir():
        raise FileNotFoundError(f"Folder not found: {folder_path}")

    tracks = []
    for mp3_path in sorted(folder.rglob("*.mp3")):
        track = extract_metadata(mp3_path)
        if track:
            tracks.append(track)
    return tracks


def extract_metadata(mp3_path: Path) -> dict | None:
    """Extract ID3 metadata from a single MP3 file."""
    try:
        audio = MP3(str(mp3_path))
        duration = audio.info.length
    except Exception:
        duration = 0.0

    try:
        tags = ID3(str(mp3_path))
    except ID3NoHeaderError:
        tags = None

    def get_tag(tags, key, default=""):
        if tags is None:
            return default
        frame = tags.get(key)
        if frame is None:
            return default
        return str(frame.text[0]) if frame.text else default

    artist = get_tag(tags, "TPE1")
    title = get_tag(tags, "TIT2")

    if not artist and not title:
        # Try to parse from filename as fallback: "Artist - Title.mp3"
        stem = mp3_path.stem
        if " - " in stem:
            parts = stem.split(" - ", 1)
            artist = parts[0].strip()
            title = parts[1].strip()
        else:
            title = stem

    return {
        "id": str(mp3_path),
        "filename": mp3_path.name,
        "artist": artist,
        "title": title,
        "album": get_tag(tags, "TALB"),
        "track_number": get_tag(tags, "TRCK"),
        "year": get_tag(tags, "TDRC"),
        "duration_seconds": round(duration, 1),
    }
