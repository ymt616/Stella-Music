const express = require('express');
const axios = require('axios');
const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:8888/auth/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-library-read',
  'user-library-modify',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-follow-read',
  'user-follow-modify',
  'user-top-read',
  'user-read-recently-played',
].join(' ');

// Generate random state string
function generateState(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// GET /auth/login → redirect to Spotify
router.get('/login', (req, res) => {
  const state = generateState();
  res.cookie('spotify_auth_state', state, { httpOnly: true, sameSite: 'lax', path: '/' });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

// GET /auth/callback → exchange code for tokens
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`${FRONTEND_URL}?error=${error}`);
  }

  // Skip strict state check for local dev (localhost/127.0.0.1 cookie mismatch)
  res.clearCookie('spotify_auth_state');

  try {
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Pass tokens to frontend via URL (frontend stores in memory)
    const params = new URLSearchParams({
      access_token,
      refresh_token,
      expires_in,
    });

    res.redirect(`${FRONTEND_URL}/callback?${params.toString()}`);
  } catch (err) {
    console.error('Token exchange error:', err.response?.data || err.message);
    res.redirect(`${FRONTEND_URL}?error=token_exchange_failed`);
  }
});

// POST /auth/token → exchange code for tokens (frontend calls this with the code)
router.post('/token', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    );
    res.json(tokenResponse.data);
  } catch (err) {
    console.error('Token exchange error:', err.response?.data || err.message);
    res.status(400).json({ error: 'Token exchange failed', details: err.response?.data });
  }
});

// POST /auth/refresh → get new access token
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'No refresh token provided' });
  }

  try {
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    );

    res.json(tokenResponse.data);
  } catch (err) {
    console.error('Refresh error:', err.response?.data || err.message);
    res.status(400).json({ error: 'Failed to refresh token' });
  }
});

module.exports = router;
