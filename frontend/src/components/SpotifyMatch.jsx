import React from "react";

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SpotifyMatch({ match, localDuration, isSelected, onSelect }) {
  const durationDiff = match.duration_diff;
  const hasDurationWarning = durationDiff !== null && durationDiff > 5;

  return (
    <div
      className={`match-card ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <img
        src={match.album_art || "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><rect fill='%23333' width='56' height='56'/></svg>"}
        alt={match.album}
      />
      <div className="match-info">
        <h4>{match.name}</h4>
        <p>
          {match.artists.join(", ")} &middot; {match.album}
        </p>
        <p>
          {formatDuration(match.duration_seconds)}
          {match.release_date && ` \u00b7 ${match.release_date}`}
          {hasDurationWarning && (
            <span className="duration-warning">
              {" "} ({durationDiff > 0 ? "+" : ""}{durationDiff}s vs local)
            </span>
          )}
        </p>
      </div>
      <div className="match-actions">
        {match.preview_url ? (
          <audio
            controls
            preload="none"
            src={match.preview_url}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
            No preview
          </span>
        )}
        {match.external_url && (
          <a
            href={match.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-small"
            onClick={(e) => e.stopPropagation()}
          >
            Open in Spotify
          </a>
        )}
      </div>
    </div>
  );
}
