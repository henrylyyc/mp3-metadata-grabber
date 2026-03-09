# CLAUDE.md

## Project Overview

**mp3-metadata-grabber** extracts artist and title metadata from a folder of MP3 files and uses the Spotify API to add the discovered songs to a personal playlist.

## Repository Status

This project is in the early conceptual stage. Only a README exists — no source code, dependencies, or build configuration have been added yet.

## Repository Structure

```
mp3-metadata-grabber/
├── README.md        # Project description
└── CLAUDE.md        # This file
```

## Git Workflow

- **Default branch:** `master`
- Development happens on feature branches
- Keep commits focused and descriptive

## Key Planned Functionality

1. **MP3 metadata extraction** — Read ID3 tags (artist, title) from MP3 files in a given directory
2. **Spotify API integration** — Authenticate with Spotify, search for matching tracks, and add them to a playlist

## Development Guidelines

- When choosing a tech stack, prefer well-maintained libraries with good documentation
- Store Spotify API credentials securely (never commit secrets; use environment variables or a `.env` file excluded via `.gitignore`)
- Add a `.gitignore` appropriate for the chosen language/framework before adding source code
