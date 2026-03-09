const API = "/api";

export async function fetchAuthStatus() {
  const res = await fetch(`${API}/auth/status`);
  return res.json();
}

export async function fetchTracks(offset = 0, limit = 50) {
  const res = await fetch(`${API}/tracks?offset=${offset}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch tracks");
  return res.json();
}

export async function rescanTracks() {
  const res = await fetch(`${API}/tracks/rescan`, { method: "POST" });
  return res.json();
}

export async function fetchMatches(artist, title, album, duration, limit = 5) {
  const params = new URLSearchParams();
  if (artist) params.set("artist", artist);
  if (title) params.set("title", title);
  if (album) params.set("album", album);
  if (duration) params.set("duration", duration);
  params.set("limit", limit);
  const res = await fetch(`${API}/match?${params}`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
}

export async function fetchPlaylists() {
  const res = await fetch(`${API}/playlists`);
  if (!res.ok) throw new Error("Failed to fetch playlists");
  return res.json();
}

export async function addTrack(spotifyUri, playlistId = null) {
  const res = await fetch(`${API}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      spotify_uri: spotifyUri,
      playlist_id: playlistId,
    }),
  });
  if (!res.ok) throw new Error("Failed to add track");
  return res.json();
}

export async function batchAdd(spotifyUris, playlistId = null) {
  const res = await fetch(`${API}/add/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      spotify_uris: spotifyUris,
      playlist_id: playlistId,
    }),
  });
  if (!res.ok) throw new Error("Failed to batch add tracks");
  return res.json();
}

export function getAudioUrl(path) {
  return `${API}/tracks/audio?path=${encodeURIComponent(path)}`;
}
