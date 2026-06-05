import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePlayer } from '../context/PlayerContext'
import { api } from '../api/spotify'
import { tokenStore } from '../api/token'
import TrackCard from '../components/UI/TrackCard'
import AlbumCard from '../components/UI/AlbumCard'
import { IconPlay } from '../components/UI/Icons'

export default function Artist() {
  const { id } = useParams()
  const { accessToken } = useAuth()
  const { playContext } = usePlayer()

  const [artist, setArtist] = useState(null)
  const [topTracks, setTopTracks] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accessToken || !id) return
    const token = tokenStore.get() || accessToken
    // getArtistTopTracks removed in Feb 2026 — use artist name + search instead
    api.getArtist(token, id)
      .then(async artistRes => {
        setArtist(artistRes.data)
        const artistName = artistRes.data.name
        const [tracksRes, albumsRes] = await Promise.all([
          api.search(token, `artist:${artistName}`, 'track', 10).catch(() => ({ data: { tracks: { items: [] } } })),
          api.getArtistAlbums(token, id).catch(() => ({ data: { items: [] } })),
        ])
        setTopTracks(tracksRes.data.tracks?.items || [])
        setAlbums(albumsRes.data.items || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [accessToken, id])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!artist) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Artist not found.</div>

  const image = artist.images?.[0]?.url
  // followers field removed in Feb 2026 API changes
  const followers = artist.followers?.total?.toLocaleString() || null

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Hero */}
      <div style={{
        height: 320,
        position: 'relative',
        display: 'flex', alignItems: 'flex-end',
        padding: '0 24px 32px',
        overflow: 'hidden',
      }}>
        {image && <>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover', backgroundPosition: 'center top',
            zIndex: 0,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, var(--bg-primary) 20%, rgba(7,7,26,0.4) 70%, transparent 100%)',
            zIndex: 1,
          }} />
        </>}

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Artist</div>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', lineHeight: 1, marginBottom: 12 }}>{artist.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {followers && <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{followers} followers</span>}
            {artist.genres?.slice(0, 3).map(g => (
              <span key={g} style={{
                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                background: 'var(--accent-dim)', border: '1px solid var(--border)',
                fontSize: '11px', color: 'var(--accent)',
              }}>{g}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Play button */}
      <div style={{ padding: '0 24px 32px', display: 'flex', gap: 12 }}>
        <button
          onClick={() => topTracks[0] && playContext(topTracks[0].album?.uri || topTracks[0].uri)}
          className="btn-primary"
        >
          <IconPlay size={14} color="#fff" strokeWidth={2.5} style={{ marginLeft: 2 }} /> Play
        </button>
      </div>

      <div style={{ padding: '0 24px' }}>
        {/* Top Tracks */}
        {topTracks.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 16 }}>Popular</h2>
            {topTracks.slice(0, 8).map((track, i) => (
              <TrackCard key={track.id} track={track} index={i} showIndex contextUri={track.album.uri} />
            ))}
          </section>
        )}

        <div style={{ height: 1, background: 'var(--border)', margin: '8px 0 24px' }} />

        {/* Albums */}
        {albums.length > 0 && (
          <section style={{ marginBottom: 40, marginTop: 32 }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 16 }}>Discography</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
              {albums.map(album => (
                <AlbumCard key={album.id} item={album} type="album" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
