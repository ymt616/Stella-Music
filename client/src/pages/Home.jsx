import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { usePlayer } from '../context/PlayerContext'
import { api } from '../api/spotify'
import { tokenStore } from '../api/token'
import AlbumCard from '../components/UI/AlbumCard'
import TrackCard from '../components/UI/TrackCard'

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{
        fontSize: '1.5rem', marginBottom: 20,
        background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>{title}</h2>
      {children}
    </section>
  )
}

function Grid({ children, minWidth = 160 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
      gap: 16,
    }}>
      {children}
    </div>
  )
}

export default function Home() {
  const { accessToken, user } = useAuth()
  const { playContext } = usePlayer()

  const [recentTracks, setRecentTracks] = useState([])
  const [topTracks, setTopTracks] = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [featuredPlaylists, setFeaturedPlaylists] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accessToken) return
    Promise.all([
      api.getRecentlyPlayed(tokenStore.get()).catch(() => ({ data: { items: [] } })),
      api.getTopTracks(tokenStore.get()).catch(() => ({ data: { items: [] } })),
      api.getTopArtists(tokenStore.get()).catch(() => ({ data: { items: [] } })),
      api.getPlaylists(tokenStore.get()).catch(() => ({ data: { items: [] } })),
    ]).then(([recent, top, artists, playlists]) => {
      setRecentTracks(recent.data.items?.slice(0, 6).map(i => i.track) || [])
      setTopTracks(top.data.items?.slice(0, 8) || [])
      setTopArtists(artists.data.items?.slice(0, 6) || [])
      setFeaturedPlaylists(playlists.data.items?.slice(0, 6) || [])
      setNewReleases([])
    }).finally(() => setLoading(false))
  }, [accessToken])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid var(--accent)', borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )

  return (
    <div style={{ padding: '32px 24px', animation: 'fadeIn 0.4s ease' }}>
      {/* Greeting */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: 4, color: '#fff' }}>
          {greeting}{user ? `, ${user.display_name.split(' ')[0]}` : ''}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Here's what's playing for you today.
        </p>
      </div>

      {/* Recently Played */}
      {recentTracks.length > 0 && (
        <Section title="Recently Played">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recentTracks.map((track, i) => (
              <TrackCard key={`${track.id}-${i}`} track={track} index={i} contextUri={track.album?.uri} />
            ))}
          </div>
        </Section>
      )}

      <div style={{ height: 1, background: 'var(--border)', margin: '8px 0 32px' }} />

      {/* Top Artists */}
      {topArtists.length > 0 && (
        <Section title="Your Top Artists">
          <Grid>
            {topArtists.map(artist => (
              <AlbumCard key={artist.id} item={artist} type="artist" />
            ))}
          </Grid>
        </Section>
      )}

      {/* Featured Playlists */}
      {featuredPlaylists.length > 0 && (
        <Section title="Featured Playlists">
          <Grid>
            {featuredPlaylists.map(pl => (
              <AlbumCard key={pl.id} item={pl} type="playlist" />
            ))}
          </Grid>
        </Section>
      )}

      <div style={{ height: 1, background: 'var(--border)', margin: '8px 0 32px' }} />

      {/* New Releases */}
      {newReleases.length > 0 && (
        <Section title="New Releases">
          <Grid>
            {newReleases.map(album => (
              <AlbumCard key={album.id} item={album} type="album" />
            ))}
          </Grid>
        </Section>
      )}

      {/* Top Tracks */}
      {topTracks.length > 0 && (
        <Section title="Your Top Songs">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {topTracks.map((track, i) => (
              <TrackCard key={track.id} track={track} index={i} showIndex contextUri={track.album?.uri} />
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}
