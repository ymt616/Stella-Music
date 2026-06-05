# 🌸 Bloom — Digital Music Platform

A Spotify-powered music platform with an aesthetic dark blue, baby pink & carnation flower UI.

---

## Setup

### 1. Create a Spotify App

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click **Create App**
3. Fill in:
   - App name: `Bloom Music`
   - Redirect URI: `http://localhost:8888/auth/callback`
4. Copy your **Client ID** and **Client Secret**

### 2. Configure environment

```bash
cd music-platform/server
cp ../../.env.example .env
```

Edit `.env`:
```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:8888/auth/callback
FRONTEND_URL=http://localhost:3000
```

### 3. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 4. Run locally

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy

### Backend → Railway

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select the `server` folder as root
4. Add environment variables (same as `.env` but with production URLs):
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REDIRECT_URI` = `https://YOUR-RAILWAY-APP.railway.app/auth/callback`
   - `FRONTEND_URL` = `https://YOUR-VERCEL-APP.vercel.app`
5. Copy your Railway URL

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set **Root Directory** to `client`
3. Add environment variable:
   - `VITE_API_URL` = your Railway URL
4. Deploy

### Update Spotify App

Add your production redirect URI in the Spotify Dashboard:
`https://YOUR-RAILWAY-APP.railway.app/auth/callback`

---

## Features

- **Spotify OAuth** login — full auth flow with auto token refresh
- **Your Library** — playlists, liked songs, saved albums
- **Playlist management** — create, edit, drag-to-reorder tracks, remove tracks
- **Search** — real-time search across tracks, albums, artists, playlists
- **Playback** — play/pause, next/prev, seek, volume, shuffle, repeat (Premium required for browser playback)
- **Artist pages** — top tracks, discography
- **Album pages** — full tracklist, play album
- **Design** — dark blue / baby pink / black carnation flower aesthetic

---

## Tech Stack

- **Frontend**: React 18 + Vite, React Router v6, @dnd-kit (drag-and-drop)
- **Backend**: Node.js + Express, Axios
- **Auth**: Spotify OAuth 2.0 with PKCE-style token exchange
- **Deploy**: Vercel (frontend) + Railway (backend)
