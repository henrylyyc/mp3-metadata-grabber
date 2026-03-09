import React from "react";
import TrackRow from "./TrackRow";

export default function TrackList({ tracks, playlists, processedIds, onProcessed, offset }) {
  if (tracks.length === 0) {
    return <div className="loading">No MP3 files found in the configured folder.</div>;
  }

  return (
    <div className="track-list">
      {tracks.map((track, idx) => (
        <TrackRow
          key={track.id}
          track={track}
          index={offset + idx + 1}
          playlists={playlists}
          isProcessed={processedIds.has(track.id)}
          onProcessed={() => onProcessed(track.id)}
        />
      ))}
    </div>
  );
}
