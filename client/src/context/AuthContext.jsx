import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { tokenStore } from '../api/token'

const AuthContext = createContext(null)

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'cef84529d90d426c8f588c61be4740fd'
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'http://127.0.0.1:3000/callback'
const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8888'
const SCOPES = [
  'user-read-private', 'user-read-email',
  'user-library-read', 'user-library-modify',
  'user-read-playback-state', 'user-modify-playback-state',
  'user-read-currently-playing', 'streaming',
  'playlist-read-private', 'playlist-read-collaborative',
  'playlist-modify-public', 'playlist-modify-private',
  'user-follow-read', 'user-follow-modify',
  'user-top-read', 'user-read-recently-played',
].join(' ')

// These are plain functions — exported separately to avoid HMR issues
export const spotifyLogin = () => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
  })
  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
}

export const exchangeCode = (code) =>
  fetch(`${BACKEND}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  }).then(r => r.json())

export const refreshToken = (refresh_token) =>
  fetch(`${BACKEND}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  }).then(r => r.json())

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => window.__access_token || null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  const logout = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    localStorage.removeItem('bloom_rt')
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const setTokens = useCallback((aToken, rToken, expiresIn) => {
    if (!aToken) return
    tokenStore.set(aToken)
    setAccessToken(aToken)
    if (rToken) localStorage.setItem('bloom_rt', rToken)
    // Schedule refresh
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const stored = localStorage.getItem('bloom_rt')
      if (stored) {
        refreshToken(stored).then(data => {
          if (data.access_token) setTokens(data.access_token, data.refresh_token || stored, data.expires_in)
          else logout()
        }).catch(logout)
      }
    }, (parseInt(expiresIn) - 60) * 1000)
    // Fetch user
    fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${aToken}` }
    }).then(r => r.json()).then(d => { if (d.id) setUser(d) }).catch(() => {})
  }, [logout])

  useEffect(() => {
    const stored = localStorage.getItem('bloom_rt')
    if (stored) {
      refreshToken(stored)
        .then(data => {
          if (data?.access_token) {
            setTokens(data.access_token, data.refresh_token || stored, data.expires_in)
          } else {
            localStorage.removeItem('bloom_rt')
          }
        })
        .catch(() => {
          // Server may be cold-starting — clear token and show login page cleanly
          localStorage.removeItem('bloom_rt')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ accessToken, user, loading, logout, setTokens }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
