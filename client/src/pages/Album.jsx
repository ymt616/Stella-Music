import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePlayer } from '../context/PlayerContext'
import { api } from '../api/spotify'
import { tokenStore } from '../api/token'
import TrackCard from '../components/UI/TrackCard'

export default function Album() {
  const { id } = useParams()
  const { accessToken } = useAuth()
  const { playContext } = usePlayer()
  const navigate = useNavigate()

  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accessToken || !id) return
    api.getAlbum(tokenStore.get(), id)
      .then(res => setAlbum(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [accessToken, id])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!album) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Album not found.</div>

  const image = album.images?.[0]?.url
  const year = album.release_date?.split('-')[0]
  const totalMs = album.tracks?.items?.reduce((sum, t) => sum + t.duration_ms, 0) || 0
  const totalMins = Math.round(totalMs / 60000)

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Hero */}
      <div style={{
        padding: '40px 24px 32px',
        position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid var(--border)',
      }}>
        {image && <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(50px) brightness(0.15)',
          zIndex: 0,
        }} />}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 28, alignItems: 'flex-end' }}>
          <img src={image} alt={album.name} style={{
            width: 200, height: 200, borderRadius: 'var(--radius-md)', objectFit: 'cover',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6)', flexShrink: 0,
          }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              {album.album_type}
            </div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2.8rem)', marginBottom: 10, lineHeight: 1.1 }}>
              {album.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {album.artists?.map((artist, i) => (
                <span key={artist.id}>
                  <button
                    onClick={() => navigate(`/artist/${artist.id}`)}
                    style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'var(--border-hover)' }}
                  >{artist.name}</button>
                  {i < album.artists.length - 1 && <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>,</span>}
                </span>
              ))}
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>· {year} · {album.tracks?.total} tracks · {totalMins} min</span>
            </div>
            <button
              onClick={() => playContext(album.uri)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--accent-hot), var(--carnation))',
                color: '#fff', fontSize: '14px', fontWeight: 700,
                boxShadow: '0 4px 20px var(--accent-glow)',
                transition: 'transform var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >▶ Play Album</button>
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div style={{ padding: '24px' }}>
        {album.tracks?.items?.map((track, i) => (
          <TrackCard
            key={track.id}
            track={{ ...track, album: { images: album.images, uri: album.uri } }}
            index={i}
            showIndex
            contextUri={album.uri}
          />
        ))}
      </div>

      {/* Copyright */}
      {album.copyrights?.[0] && (
        <div style={{ padding: '0 24px 40px', color: 'var(--text-dim)', fontSize: '11px' }}>
          {album.copyrights[0].text}
        </div>
      )}
    </div>
  )
}
