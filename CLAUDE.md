# CLAUDE.md

## Project Overview

**mp3-metadata-grabber** is a web application that scans a local folder of MP3 files, extracts their metadata (artist, title, album), searches Spotify for matching tracks, and lets you manually compare and add the correct versions to your Liked Songs or playlists.

## Tech Stack

- **Backend:** Python 3.11+ / FastAPI
- **Frontend:** React 19 / Vite 6
- **MP3 Parsing:** mutagen (ID3 tags)
- **Spotify SDK:** spotipy (OAuth2 + Web API)
- **Styling:** Plain CSS with CSS custom properties (dark theme)

## Repository Structure

```
mp3-metadata-grabber/
├── backend/
│   ├── main.py           # FastAPI app, routes, CORS
│   ├── config.py         # Settings from env vars (pydantic-settings)
│   ├── scanner.py        # MP3 folder scanning + ID3 metadata extraction
│   ├── matching.py       # Spotify search with progressive query fallback
│   ├── spotify.py        # Spotify OAuth flow + client management
│   ├── requirements.txt  # Python dependencies
│   └── .env.example      # Template for environment variables
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js    # Vite config with API proxy to backend
│   └── src/
│       ├── index.jsx
│       ├── App.jsx           # Main app: auth check, track loading, pagination
│       ├── api.js            # All backend API calls
│       ├── styles.css        # Global styles (dark Spotify-like theme)
│       └── components/
│           ├── TrackList.jsx      # Scrollable list of MP3 tracks
│           ├── TrackRow.jsx       # Expandable row: local info + Spotify matches
│           ├── SpotifyMatch.jsx   # Single Spotify result card with preview audio
│           └── PlaylistPicker.jsx # Dropdown to pick target playlist + add button
├── .gitignore
├── CLAUDE.md
└── README.md
```

## Running the Project

### Prerequisites
- Python 3.11+
- Node.js 18+
- A Spotify Developer app (https://developer.spotify.com/dashboard)

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Fill in your Spotify credentials and MP3 folder path
python main.py        # Starts on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev           # Starts on http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to the backend at `:8000`.

## Key API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth/status` | Check Spotify auth state |
| GET | `/callback` | Spotify OAuth callback |
| GET | `/tracks` | List scanned MP3s (paginated) |
| POST | `/tracks/rescan` | Re-scan the MP3 folder |
| GET | `/tracks/audio?path=...` | Stream a local MP3 for playback |
| GET | `/match` | Search Spotify for matches |
| GET | `/playlists` | List user's Spotify playlists |
| POST | `/add` | Add a single track to Liked Songs or a playlist |
| POST | `/add/batch` | Add multiple tracks at once |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SPOTIPY_CLIENT_ID` | Spotify app client ID |
| `SPOTIPY_CLIENT_SECRET` | Spotify app client secret |
| `SPOTIPY_REDIRECT_URI` | OAuth redirect (default: `http://localhost:8000/callback`) |
| `MP3_FOLDER_PATH` | Absolute path to the folder of MP3 files |

## Git Workflow

- **Default branch:** `master`
- Development happens on feature branches
- Keep commits focused and descriptive

## Development Guidelines

- Never commit `.env` or Spotify credentials
- The `/tracks/audio` endpoint validates paths against `MP3_FOLDER_PATH` to prevent directory traversal
- Spotify search uses progressive query broadening: `artist + title + album` → `artist + title` → `plain text` → `title only`
- Duration differences > 5s between local MP3 and Spotify result are flagged in the UI
