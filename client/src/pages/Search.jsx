import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/spotify'
import { tokenStore } from '../api/token'
import AlbumCard from '../components/UI/AlbumCard'
import TrackCard from '../components/UI/TrackCard'

const GENRE_CARDS = [
  { name: 'Pop',       gradient: 'linear-gradient(135deg, #c0365a 0%, #7b1fa2 100%)' },
  { name: 'Hip-Hop',   gradient: 'linear-gradient(135deg, #1a237e 0%, #4a148c 100%)' },
  { name: 'R&B',       gradient: 'linear-gradient(135deg, #0d47a1 0%, #c0375a 100%)' },
  { name: 'Electronic',gradient: 'linear-gradient(135deg, #006064 0%, #1565c0 100%)' },
  { name: 'Rock',      gradient: 'linear-gradient(135deg, #3e1f00 0%, #b71c1c 100%)' },
  { name: 'Jazz',      gradient: 'linear-gradient(135deg, #1b5e20 0%, #0d1b3e 100%)' },
  { name: 'Classical', gradient: 'linear-gradient(135deg, #4a2900 0%, #0a1628 100%)' },
  { name: 'Afrobeats', gradient: 'linear-gradient(135deg, #33691e 0%, #e65100 100%)' },
]

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { accessToken } = useAuth()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const doSearch = useCallback(async (q) => {
    const token = tokenStore.get() || accessToken
    if (!q.trim() || !token) return
    setLoading(true)
    try {
      const res = await api.search(token, q, 'track,album,artist', 10)
      setResults(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [accessToken])

  // Sync query state from URL on mount / back-nav only
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && q !== query) setQuery(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce: update URL + search when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setSearchParams({ q: query }, { replace: true })
        doSearch(query)
      } else {
        setResults(null)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div style={{ padding: '32px 24px', animation: 'fadeIn 0.3s ease' }}>
      <h1 style={{ marginBottom: 24, fontSize: '2rem' }}>Search</h1>

      {/* Search input */}
      <div style={{ position: 'relative', maxWidth: 560, marginBottom: 40 }}>
        <span style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          fontSize: '20px', color: 'var(--text-muted)', pointerEvents: 'none',
        }}>⌕</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          autoFocus
          style={{
            width: '100%',
            padding: '14px 16px 14px 48px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-primary)',
            fontSize: '15px', outline: 'none',
            transition: 'all var(--transition)',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', fontSize: '18px',
          }}>×</button>
        )}
      </div>

      {/* No query: genre cards */}
      {!query && (
        <section>
          <h2 style={{ fontSize: '1.3rem', marginBottom: 20, color: 'var(--text-secondary)' }}>Browse by genre</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {GENRE_CARDS.map(genre => (
              <button
                key={genre.name}
                onClick={() => setQuery(genre.name)}
                style={{
                  padding: '28px 18px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: genre.gradient,
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#fff',
                  fontSize: '15px', fontWeight: 700,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'transform var(--transition), box-shadow var(--transition)',
                  letterSpacing: '-0.01em',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)' }}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '3px solid var(--accent)', borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {/* Tracks */}
          {results.tracks?.items?.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1.3rem', marginBottom: 16 }}>Songs</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {results.tracks.items.map((track, i) => (
                  <TrackCard key={track.id} track={track} index={i} contextUri={track.album?.uri} />
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {results.artists?.items?.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1.3rem', marginBottom: 16 }}>Artists</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                {results.artists.items.map(artist => (
                  <AlbumCard key={artist.id} item={artist} type="artist" />
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {results.albums?.items?.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1.3rem', marginBottom: 16 }}>Albums</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                {results.albums.items.map(album => (
                  <AlbumCard key={album.id} item={album} type="album" />
                ))}
              </div>
            </section>
          )}

          {/* Playlists */}
          {results.playlists?.items?.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1.3rem', marginBottom: 16 }}>Playlists</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                {results.playlists.items.map(pl => pl && (
                  <AlbumCard key={pl.id} item={pl} type="playlist" />
                ))}
              </div>
            </section>
          )}

          {/* No results */}
          {!results.tracks?.items?.length && !results.artists?.items?.length &&
           !results.albums?.items?.length && !results.playlists?.items?.length && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: 16 }}>🌸</div>
              <p>No results for "<strong style={{ color: 'var(--text-primary)' }}>{query}</strong>"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
