import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/spotify'
import { tokenStore } from '../api/token'
import AlbumCard from '../components/UI/AlbumCard'
import TrackCard from '../components/UI/TrackCard'
import { CarnationDivider } from '../components/UI/CarnationSVG'

const TABS = ['Playlists', 'Liked Songs', 'Albums']

export default function Library() {
  const { accessToken } = useAuth()
  const [tab, setTab] = useState('Playlists')
  const [playlists, setPlaylists] = useState([])
  const [likedSongs, setLikedSongs] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!accessToken) return
    setLoading(true)
    Promise.all([
      api.getPlaylists(tokenStore.get()).catch(() => ({ data: { items: [] } })),
      api.getSavedTracks(tokenStore.get()).catch(() => ({ data: { items: [] } })),
      api.getSavedAlbums(tokenStore.get()).catch(() => ({ data: { items: [] } })),
    ]).then(([pl, liked, alb]) => {
      setPlaylists(pl.data.items || [])
      setLikedSongs(liked.data.items?.map(i => i.track) || [])
      setAlbums(alb.data.items?.map(i => i.album) || [])
    }).finally(() => setLoading(false))
  }, [accessToken])

  return (
    <div style={{ padding: '32px 24px', animation: 'fadeIn 0.3s ease' }}>
      <h1 style={{ marginBottom: 8 }}>Your Library</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '14px' }}>
        All your playlists, liked songs, and saved albums.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              background: tab === t ? 'var(--accent-dim)' : 'transparent',
              border: `1px solid ${tab === t ? 'var(--border-hover)' : 'var(--border)'}`,
              color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '13px', fontWeight: tab === t ? 600 : 400,
              transition: 'all var(--transition)',
            }}
          >{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '3px solid var(--accent)', borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      ) : (
        <>
          {tab === 'Playlists' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
              {playlists.map(pl => pl && <AlbumCard key={pl.id} item={pl} type="playlist" />)}
              {playlists.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '40px', marginBottom: 12 }}>🌸</div>
                  <p>No playlists yet. Create one to get started!</p>
                </div>
              )}
            </div>
          )}

          {tab === 'Liked Songs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {likedSongs.map((track, i) => (
                <TrackCard key={`${track.id}-${i}`} track={track} index={i} showIndex />
              ))}
              {likedSongs.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '40px', marginBottom: 12 }}>♡</div>
                  <p>Like songs to save them here.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'Albums' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
              {albums.map(album => <AlbumCard key={album.id} item={album} type="album" />)}
              {albums.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '40px', marginBottom: 12 }}>💿</div>
                  <p>No saved albums yet.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
