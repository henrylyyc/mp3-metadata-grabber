import React, { useState } from "react";
import { addTrack } from "../api";

export default function PlaylistPicker({ playlists, spotifyUri, onAdded }) {
  const [playlistId, setPlaylistId] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addTrack(spotifyUri, playlistId || null);
      onAdded();
    } catch (e) {
      console.error(e);
      alert("Failed to add track. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="playlist-picker">
      <select value={playlistId} onChange={(e) => setPlaylistId(e.target.value)}>
        <option value="">Liked Songs</option>
        {playlists.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.tracks} tracks)
          </option>
        ))}
      </select>
      <button
        className="btn btn-primary"
        onClick={handleAdd}
        disabled={adding}
      >
        {adding ? "Adding..." : "Add to Spotify"}
      </button>
    </div>
  );
}
