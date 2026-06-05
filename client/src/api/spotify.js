import axios from 'axios'

const PROXY = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8888') + '/api'

// All requests go through the backend proxy which forwards to Spotify.
// This avoids Spotify's extended quota mode blocking direct client calls.
export function spotifyApi(token) {
  return axios.create({
    baseURL: PROXY,
    headers: { Authorization: `Bearer ${token}` },
  })
}

export const api = {
  getMe: (token) => spotifyApi(token).get('/me'),
  getPlaylists: (token) => spotifyApi(token).get('/me/playlists', { params: { limit: 50 } }),
  getPlaylist: (token, id) => spotifyApi(token).get(`/playlists/${id}`),
  getPlaylistTracks: (token, id, offset = 0) =>
    spotifyApi(token).get(`/playlists/${id}/tracks`, { params: { offset, limit: 50 } }),
  createPlaylist: (token, userId, data) =>
    spotifyApi(token).post(`/users/${userId}/playlists`, data),
  addTracksToPlaylist: (token, id, uris) =>
    spotifyApi(token).post(`/playlists/${id}/tracks`, { uris }),
  removeTracksFromPlaylist: (token, id, uris) =>
    spotifyApi(token).delete(`/playlists/${id}/tracks`, { data: { tracks: uris.map(uri => ({ uri })) } }),
  reorderPlaylistTracks: (token, id, rangeStart, insertBefore) =>
    spotifyApi(token).put(`/playlists/${id}/tracks`, { range_start: rangeStart, insert_before: insertBefore }),
  updatePlaylist: (token, id, data) =>
    spotifyApi(token).put(`/playlists/${id}`, data),

  getSavedTracks: (token, offset = 0) =>
    spotifyApi(token).get('/me/tracks', { params: { offset, limit: 50 } }),
  saveTrack: (token, ids) => spotifyApi(token).put('/me/tracks', { ids }),
  unsaveTrack: (token, ids) => spotifyApi(token).delete('/me/tracks', { data: { ids } }),
  getSavedAlbums: (token) => spotifyApi(token).get('/me/albums'),

  // Search: limit max is 10 in Dev Mode (Feb 2026 change)
  search: (token, q, type = 'track,album,artist', limit = 10) =>
    spotifyApi(token).get('/search', { params: { q, type, limit: Math.min(limit, 10) } }),

  getAlbum: (token, id) => spotifyApi(token).get(`/albums/${id}`),
  getArtist: (token, id) => spotifyApi(token).get(`/artists/${id}`),
  // getArtistTopTracks removed in Feb 2026 — use search instead
  getArtistAlbums: (token, id) => spotifyApi(token).get(`/artists/${id}/albums`, { params: { limit: 10, include_groups: 'album,single', market: 'US' } }),

  getRecentlyPlayed: (token) => spotifyApi(token).get('/me/player/recently-played', { params: { limit: 10 } }),
  getTopTracks: (token) => spotifyApi(token).get('/me/top/tracks', { params: { limit: 10 } }),
  getTopArtists: (token) => spotifyApi(token).get('/me/top/artists', { params: { limit: 6 } }),
  // getNewReleases removed in Feb 2026
  getRecommendations: (token, params) => spotifyApi(token).get('/recommendations', { params }),

  // Playlist endpoints: /tracks → /items (Feb 2026 change)
  getPlaylistTracks: (token, id, offset = 0) =>
    spotifyApi(token).get(`/playlists/${id}/items`, { params: { offset, limit: 10 } }),
  addTracksToPlaylist: (token, id, uris) =>
    spotifyApi(token).post(`/playlists/${id}/items`, { uris }),
  removeTracksFromPlaylist: (token, id, uris) =>
    spotifyApi(token).delete(`/playlists/${id}/items`, { data: { items: uris.map(uri => ({ uri })) } }),
  reorderPlaylistTracks: (token, id, rangeStart, insertBefore) =>
    spotifyApi(token).put(`/playlists/${id}/items`, { range_start: rangeStart, insert_before: insertBefore }),

  // Create playlist: POST /me/playlists (not /users/{id}/playlists)
  createPlaylist: (token, _userId, data) =>
    spotifyApi(token).post(`/me/playlists`, data),

  // Library: PUT/DELETE /me/library with URIs (Feb 2026 change)
  saveTrack: (token, ids) => spotifyApi(token).put('/me/library', {
    uris: ids.map(id => `spotify:track:${id}`)
  }),
  unsaveTrack: (token, ids) => spotifyApi(token).delete('/me/library', { data: {
    uris: ids.map(id => `spotify:track:${id}`)
  }}),
  getSavedTracks: (token, offset = 0) =>
    spotifyApi(token).get('/me/tracks', { params: { offset, limit: 10 } }),
  getSavedAlbums: (token) => spotifyApi(token).get('/me/albums'),

  play: (token, body) => spotifyApi(token).put('/me/player/play', body),
  pause: (token) => spotifyApi(token).put('/me/player/pause'),
  next: (token) => spotifyApi(token).post('/me/player/next'),
  previous: (token) => spotifyApi(token).post('/me/player/previous'),
  seek: (token, ms) => spotifyApi(token).put(`/me/player/seek`, null, { params: { position_ms: ms } }),
  setVolume: (token, pct) => spotifyApi(token).put(`/me/player/volume`, null, { params: { volume_percent: pct } }),
  setShuffle: (token, state) => spotifyApi(token).put(`/me/player/shuffle`, null, { params: { state } }),
  setRepeat: (token, state) => spotifyApi(token).put(`/me/player/repeat`, null, { params: { state } }),
}
