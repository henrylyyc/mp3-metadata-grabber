import React, { useState } from "react";
import { fetchMatches, getAudioUrl } from "../api";
import SpotifyMatch from "./SpotifyMatch";
import PlaylistPicker from "./PlaylistPicker";

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TrackRow({ track, index, playlists, isProcessed, onProcessed }) {
  const [expanded, setExpanded] = useState(false);
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUri, setSelectedUri] = useState(null);
  const [added, setAdded] = useState(false);

  const handleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (matches !== null) return;

    setLoading(true);
    try {
      const data = await fetchMatches(
        track.artist,
        track.title,
        track.album,
        track.duration_seconds
      );
      setMatches(data.matches);
    } catch (e) {
      console.error(e);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdded = () => {
    setAdded(true);
    onProcessed();
  };

  return (
    <div className={`track-row ${isProcessed ? "processed" : ""}`}>
      <div className="track-summary" onClick={handleExpand}>
        <div className="track-number">{index}</div>
        <div className="track-info">
          <h3>{track.title || track.filename}</h3>
          <p>{track.artist || "Unknown Artist"}</p>
        </div>
        <div className="track-album">{track.album}</div>
        <div className="track-duration">
          {track.duration_seconds ? formatDuration(track.duration_seconds) : "—"}
        </div>
        <div className={`track-status ${added ? "added" : ""}`}>
          {added ? "Added" : ""}
        </div>
      </div>

      {expanded && (
        <div className="match-panel">
          <div className="match-panel-header">
            <h4>Your MP3</h4>
          </div>
          <div className="local-player">
            <span>Local file</span>
            <audio controls preload="none" src={getAudioUrl(track.id)} />
          </div>

          <div className="match-panel-header" style={{ marginTop: 8 }}>
            <h4>Spotify Matches</h4>
            {matches && <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{matches.length} results</span>}
          </div>

          {loading && (
            <div className="loading">
              <span className="spinner" /> Searching Spotify...
            </div>
          )}

          {matches && matches.length === 0 && (
            <div className="no-matches">No matches found on Spotify.</div>
          )}

          {matches && matches.length > 0 && (
            <>
              <div className="match-list">
                {matches.map((match) => (
                  <SpotifyMatch
                    key={match.spotify_id}
                    match={match}
                    localDuration={track.duration_seconds}
                    isSelected={selectedUri === match.uri}
                    onSelect={() => setSelectedUri(match.uri)}
                  />
                ))}
              </div>

              {selectedUri && !added && (
                <PlaylistPicker
                  playlists={playlists}
                  spotifyUri={selectedUri}
                  onAdded={handleAdded}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
