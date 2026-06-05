const express = require('express');
const axios = require('axios');
const router = express.Router();

// Middleware: extract Bearer token from Authorization header
function requireToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No access token' });
  }
  req.token = auth.split(' ')[1];
  next();
}

function spotifyHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

async function spotifyGet(token, path, params = {}) {
  const response = await axios.get(`https://api.spotify.com/v1${path}`, {
    headers: spotifyHeaders(token),
    params,
  });
  return response.data;
}

async function spotifyPost(token, path, data = {}) {
  const response = await axios.post(`https://api.spotify.com/v1${path}`, data, {
    headers: { ...spotifyHeaders(token), 'Content-Type': 'application/json' },
  });
  return response.data;
}

async function spotifyPut(token, path, data = {}) {
  const response = await axios.put(`https://api.spotify.com/v1${path}`, data, {
    headers: { ...spotifyHeaders(token), 'Content-Type': 'application/json' },
  });
  return response.status;
}

async function spotifyDelete(token, path, data = {}) {
  const response = await axios.delete(`https://api.spotify.com/v1${path}`, {
    headers: { ...spotifyHeaders(token), 'Content-Type': 'application/json' },
    data,
  });
  return response.status;
}

// Proxy helper
function proxyRoute(method, spotifyPath, handler) {
  router[method](spotifyPath, requireToken, handler);
}

// ── Debug: test token + search directly ───────────────────────────────────────
router.get('/debug/search', requireToken, async (req, res) => {
  const { q = 'test' } = req.query;
  const tokenPreview = req.token ? req.token.substring(0, 20) + '...' : 'MISSING';
  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${req.token}` },
      params: { q, type: 'track', limit: 1 },
    });
    res.json({ ok: true, tokenPreview, result: response.data });
  } catch (e) {
    res.status(e.response?.status || 500).json({
      ok: false,
      tokenPreview,
      status: e.response?.status,
      spotifyError: e.response?.data,
    });
  }
});

// ── User ──────────────────────────────────────────────────────────────────────
router.get('/me', requireToken, async (req, res) => {
  try {
    const data = await spotifyGet(req.token, '/me');
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// ── Playlists ─────────────────────────────────────────────────────────────────
router.get('/me/playlists', requireToken, async (req, res) => {
  try {
    const data = await spotifyGet(req.token, '/me/playlists', { limit: 50 });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.get('/playlists/:id', requireToken, async (req, res) => {
  try {
    const data = await spotifyGet(req.token, `/playlists/${req.params.id}`);
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// Feb 2026: /tracks → /items
router.get('/playlists/:id/tracks', requireToken, async (req, res) => {
  try {
    const data = await spotifyGet(req.token, `/playlists/${req.params.id}/items`, {
      limit: parseInt(req.query.limit) || 50,
      offset: req.query.offset || 0,
    });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.get('/playlists/:id/items', requireToken, async (req, res) => {
  try {
    const data = await spotifyGet(req.token, `/playlists/${req.params.id}/items`, {
      limit: parseInt(req.query.limit) || 50,
      offset: req.query.offset || 0,
    });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// Feb 2026: POST /me/playlists (not /users/{id}/playlists)
router.post('/users/:userId/playlists', requireToken, async (req, res) => {
  try {
    const data = await spotifyPost(req.token, `/me/playlists`, req.body);
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.post('/me/playlists', requireToken, async (req, res) => {
  try {
    const data = await spotifyPost(req.token, `/me/playlists`, req.body);
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// Feb 2026: /tracks → /items
router.post('/playlists/:id/tracks', requireToken, async (req, res) => {
  try {
    const data = await spotifyPost(req.token, `/playlists/${req.params.id}/items`, req.body);
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.post('/playlists/:id/items', requireToken, async (req, res) => {
  try {
    const data = await spotifyPost(req.token, `/playlists/${req.params.id}/items`, req.body);
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.put('/playlists/:id/tracks', requireToken, async (req, res) => {
  try {
    const data = await spotifyPut(req.token, `/playlists/${req.params.id}/items`, req.body);
    res.json({ status: data });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.delete('/playlists/:id/tracks', requireToken, async (req, res) => {
  try {
    // Feb 2026: parameter renamed from 'tracks' to 'items'
    const body = req.body.tracks
      ? { items: req.body.tracks.map(t => ({ uri: t.uri })) }
      : req.body;
    const data = await spotifyDelete(req.token, `/playlists/${req.params.id}/items`, body);
    res.json({ status: data });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.put('/playlists/:id', requireToken, async (req, res) => {
  try {
    await spotifyPut(req.token, `/playlists/${req.params.id}`, req.body);
    res.json({ success: true });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// ── Library ───────────────────────────────────────────────────────────────────
router.get('/me/tracks', requireToken, async (req, res) => {
  try {
    const data = await spotifyGet(req.token, '/me/tracks', {
      limit: req.query.limit || 50,
      offset: req.query.offset || 0,
    });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// Feb 2026: save/unsave use PUT/DELETE /me/library with URIs
router.put('/me/tracks', requireToken, async (req, res) => {
  try {
    // Accept both old {ids:[]} and new {uris:[]} formats
    const uris = req.body.uris || (req.body.ids || []).map(id => `spotify:track:${id}`);
    await spotifyPut(req.token, '/me/library', { uris });
    res.json({ success: true });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.delete('/me/tracks', requireToken, async (req, res) => {
  try {
    const uris = req.body.uris || (req.body.ids || []).map(id => `spotify:track:${id}`);
    await spotifyDelete(req.token, '/me/library', { uris });
    res.json({ success: true });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.put('/me/library', requireToken, async (req, res) => {
  try {
    await spotifyPut(req.token, '/me/library', req.body);
    res.json({ success: true });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.delete('/me/library', requireToken, async (req, res) => {
  try {
    await spotifyDelete(req.token, '/me/library', req.body);
    res.json({ success: true });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.get('/me/albums', requireToken, async (req, res) => {
  try {
    const data = await spotifyGet(req.token, '/me/albums', { limit: 50 });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// ── Search ────────────────────────────────────────────────────────────────────
// NOTE: Spotify Dev Mode (Feb 2026) caps limit at 10
router.get('/search', requireToken, async (req, res) => {
  try {
    const { q, type = 'track,album,artist', limit = 10 } = req.query;
    if (!q) return res.status(400).json({ error: 'Missing query parameter: q' });
    const cappedLimit = Math.min(parseInt(limit) || 10, 10);
    const data = await spotifyGet(req.token, '/search', { q, type, limit: cappedLimit });
    res.json(data);
  } catch (e) {
    console.error('[Search] Spotify error:', e.response?.status, JSON.stringify(e.response?.data));
    res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
  }
});

// ── Albums ────────────────────────────────────────────────────────────────────
router.get('/albums/:id', requireToken, async (req, res) => {
  try {
    const data = await spotifyGet(req.token, `/albums/${req.params.id}`);
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// ── Artists ───────────────────────────────────────────────────────────────────
router.get('/artists/:id', requireToken, async (req, res) => {
  try {
    const data = await spotifyGet(req.token, `/artists/${req.params.id}`);
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// Feb 2026: /artists/{id}/top-tracks removed — proxy to search as fallback
router.get('/artists/:id/top-tracks', requireToken, async (req, res) => {
  try {
    // Get artist name first, then search for their tracks
    const artist = await spotifyGet(req.token, `/artists/${req.params.id}`);
    const searchData = await spotifyGet(req.token, '/search', {
      q: `artist:${artist.name}`, type: 'track', limit: 10,
    });
    res.json({ tracks: searchData.tracks?.items || [] });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.get('/artists/:id/albums', requireToken, async (req, res) => {
  try {
    const data = await spotifyGet(req.token, `/artists/${req.params.id}/albums`, {
      limit: Math.min(parseInt(req.query.limit) || 10, 10),
      include_groups: 'album,single',
      market: 'US',
    });
    res.json(data);
  } catch (e) {
    console.error('[Artist Albums]', e.response?.status, JSON.stringify(e.response?.data));
    res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
  }
});

// ── Playback ──────────────────────────────────────────────────────────────────
router.get('/me/player', requireToken, async (req, res) => {
  try {
    const data = await spotifyGet(req.token, '/me/player');
    res.json(data || {});
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.put('/me/player/play', requireToken, async (req, res) => {
  try {
    // device_id must be a query param, not in the body
    const { device_id, ...body } = req.body || {};
    const path = device_id ? `/me/player/play?device_id=${device_id}` : '/me/player/play';
    await spotifyPut(req.token, path, body);
    res.json({ success: true });
  } catch (e) {
    console.error('[Play] Spotify error:', e.response?.status, JSON.stringify(e.response?.data));
    res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
  }
});

router.put('/me/player/pause', requireToken, async (req, res) => {
  try {
    await spotifyPut(req.token, '/me/player/pause');
    res.json({ success: true });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.post('/me/player/next', requireToken, async (req, res) => {
  try {
    await axios.post('https://api.spotify.com/v1/me/player/next', {}, { headers: spotifyHeaders(req.token) });
    res.json({ success: true });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.post('/me/player/previous', requireToken, async (req, res) => {
  try {
    await axios.post('https://api.spotify.com/v1/me/player/previous', {}, { headers: spotifyHeaders(req.token) });
    res.json({ success: true });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.put('/me/player/volume', requireToken, async (req, res) => {
  try {
    await spotifyPut(req.token, `/me/player/volume?volume_percent=${req.query.volume_percent}`);
    res.json({ success: true });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.put('/me/player/shuffle', requireToken, async (req, res) => {
  try {
    await spotifyPut(req.token, `/me/player/shuffle?state=${req.query.state}`);
    res.json({ success: true });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.put('/me/player/repeat', requireToken, async (req, res) => {
  try {
    await spotifyPut(req.token, `/me/player/repeat?state=${req.query.state}`);
    res.json({ success: true });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.put('/me/player/seek', requireToken, async (req, res) => {
  try {
    await spotifyPut(req.token, `/me/player/seek?position_ms=${req.query.position_ms}`);
    res.json({ success: true });
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// ── Recommendations & Top ─────────────────────────────────────────────────────
router.get('/me/top/:type', requireToken, async (req, res) => {
  try {
    const data = await spotifyGet(req.token, `/me/top/${req.params.type}`, {
      time_range: req.query.time_range || 'medium_term',
      limit: req.query.limit || 20,
    });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.get('/me/player/queue', requireToken, async (req, res) => {
  try {
    const data = await spotifyGet(req.token, '/me/player/queue');
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.get('/me/player/recently-played', requireToken, async (req, res) => {
  try {
    const data = await spotifyGet(req.token, '/me/player/recently-played', { limit: 20 });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

router.get('/recommendations', requireToken, async (req, res) => {
  try {
    const data = await spotifyGet(req.token, '/recommendations', req.query);
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

// Feb 2026: /browse/new-releases removed — return empty so UI degrades gracefully
router.get('/browse/new-releases', requireToken, async (req, res) => {
  res.json({ albums: { items: [] } });
});

router.get('/browse/featured-playlists', requireToken, async (req, res) => {
  try {
    const data = await spotifyGet(req.token, '/browse/featured-playlists', { limit: 10 });
    res.json(data);
  } catch (e) { res.status(e.response?.status || 500).json(e.response?.data || { error: e.message }); }
});

module.exports = router;
