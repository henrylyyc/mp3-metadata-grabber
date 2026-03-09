import React, { useState, useEffect, useCallback } from "react";
import {
  fetchAuthStatus,
  fetchTracks,
  rescanTracks,
  fetchPlaylists,
} from "./api";
import TrackList from "./components/TrackList";

export default function App() {
  const [auth, setAuth] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [playlists, setPlaylists] = useState([]);
  const [processedIds, setProcessedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const limit = 50;

  useEffect(() => {
    fetchAuthStatus().then(setAuth).catch(console.error);
  }, []);

  const loadTracks = useCallback(
    async (off) => {
      setLoading(true);
      try {
        const data = await fetchTracks(off, limit);
        setTracks(data.tracks);
        setTotal(data.total);
        setOffset(off);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    if (auth?.authenticated) {
      loadTracks(0);
      fetchPlaylists()
        .then((data) => setPlaylists(data.playlists))
        .catch(console.error);
    }
  }, [auth, loadTracks]);

  const handleRescan = async () => {
    setLoading(true);
    await rescanTracks();
    await loadTracks(0);
  };

  const markProcessed = (trackId) => {
    setProcessedIds((prev) => new Set([...prev, trackId]));
  };

  if (auth === null) {
    return <div className="app loading">Loading...</div>;
  }

  if (!auth.authenticated) {
    return (
      <div className="app auth-screen">
        <h1>MP3 Metadata Grabber</h1>
        <p>Connect your Spotify account to get started.</p>
        <a href={auth.auth_url} className="btn btn-primary" style={{ fontSize: 18, padding: "12px 32px" }}>
          Connect to Spotify
        </a>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>MP3 Metadata Grabber</h1>
        <div className="header-actions">
          <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Logged in as <strong>{auth.user}</strong>
          </span>
          <button className="btn btn-secondary" onClick={handleRescan}>
            Rescan Folder
          </button>
        </div>
      </div>

      <div className="stats-bar">
        <span>
          <strong>{total}</strong> MP3 files found
        </span>
        <span>
          <strong>{processedIds.size}</strong> processed
        </span>
        <span>
          Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
        </span>
      </div>

      {loading ? (
        <div className="loading">
          <span className="spinner" /> Scanning tracks...
        </div>
      ) : (
        <>
          <TrackList
            tracks={tracks}
            playlists={playlists}
            processedIds={processedIds}
            onProcessed={markProcessed}
            offset={offset}
          />
          <div className="pagination">
            <button
              className="btn btn-secondary"
              disabled={offset === 0}
              onClick={() => loadTracks(Math.max(0, offset - limit))}
            >
              Previous
            </button>
            <span>
              Page {Math.floor(offset / limit) + 1} of{" "}
              {Math.ceil(total / limit)}
            </span>
            <button
              className="btn btn-secondary"
              disabled={offset + limit >= total}
              onClick={() => loadTracks(offset + limit)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
