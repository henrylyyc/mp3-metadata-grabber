# MP3 Metadata Grabber

A web app that scans your local MP3 collection, finds matching tracks on Spotify, and lets you compare them side-by-side before adding the right version to your Liked Songs or playlists.

## The Problem

You have hundreds (or thousands) of MP3 files accumulated over the years. You want to add them to Spotify, but automated tools often match the wrong version — a remix instead of the original, a live version instead of the studio cut, etc.

## The Solution

This app gives you manual control over the matching process:

1. **Scan** — Point it at your MP3 folder. It reads ID3 tags (artist, title, album, duration) from every file.
2. **Match** — For each track, it searches Spotify and shows the top results ranked by relevance, with duration differences flagged.
3. **Compare** — Play your local MP3 and the Spotify preview side-by-side to verify it's the right version.
4. **Add** — One click to add the correct match to your Liked Songs or any playlist.

## Quick Start

### 1. Create a Spotify App

Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), create an app, and set the redirect URI to `http://localhost:8000/callback`.

### 2. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Spotify credentials and MP3 folder path
python main.py
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173, connect your Spotify account, and start matching.

## Tech Stack

- **Backend:** Python / FastAPI / mutagen / spotipy
- **Frontend:** React / Vite
