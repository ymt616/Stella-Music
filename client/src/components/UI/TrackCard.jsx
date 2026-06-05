import { useState } from 'react'
import { usePlayer } from '../../context/PlayerContext'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api/spotify'
import { IconPlay, IconPause, IconHeart, IconTrash } from './Icons'

export default function TrackCard({ track, index, contextUri, showIndex = false, onRemove }) {
  const { playTrack, currentTrack, isPlaying } = usePlayer()
  const { accessToken } = useAuth()
  const [liked, setLiked] = useState(false)
  const [hovering, setHovering] = useState(false)

  if (!track) return null

  const isActive = currentTrack?.uri === track.uri
  const duration = formatDuration(track.duration_ms)
  const artists = track.artists?.map(a => a.name).join(', ')

  function formatDuration(ms) {
    if (!ms) return '--:--'
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  async function handlePlay() {
    await playTrack(track.uri, contextUri)
  }

  async function toggleLike(e) {
    e.stopPropagation()
    try {
      if (liked) await api.unsaveTrack(accessToken, [track.id])
      else await api.saveTrack(accessToken, [track.id])
      setLiked(l => !l)
    } catch (e) { console.error(e) }
  }

  return (
    <div
      className="track-card"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={handlePlay}
      style={{
        display: 'grid',
        gridTemplateColumns: showIndex
          ? '28px 40px 1fr auto auto'
          : '40px 1fr auto auto',
        alignItems: 'center',
        gap: '10px',
        padding: '7px 10px',
        borderRadius: 'var(--radius-sm)',
        background: isActive
          ? 'rgba(244,184,200,0.07)'
          : hovering
          ? 'rgba(255,255,255,0.03)'
          : 'transparent',
        transition: 'background var(--transition)',
        cursor: 'pointer',
        borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
      }}
    >
      {/* Index number (only shown when showIndex, no play button) */}
      {showIndex && (
        <span style={{
          fontSize: '12px', color: isActive ? 'var(--accent)' : 'var(--text-muted)',
          fontVariantNumeric: 'tabular-nums', textAlign: 'center', flexShrink: 0,
        }}>
          {isActive && isPlaying
            ? <IconPause size={12} strokeWidth={2.5} />
            : index + 1}
        </span>
      )}

      {/* Album art */}
      <img
        src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
        alt={track.name}
        style={{
          width: 38, height: 38,
          borderRadius: 'var(--radius-xs)',
          objectFit: 'cover',
          flexShrink: 0,
          boxShadow: isActive ? '0 0 12px var(--accent-glow)' : 'none',
        }}
      />

      {/* Title + artist */}
      <div style={{ minWidth: 0 }}>
        <div className="truncate" style={{
          fontSize: '13px', fontWeight: 500,
          color: isActive ? 'var(--accent)' : 'var(--text-primary)',
          marginBottom: 2,
        }}>
          {track.name}
        </div>
        <div className="truncate" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {artists}
        </div>
      </div>

      {/* Like / remove */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={toggleLike}
          style={{
            padding: 6,
            color: liked ? 'var(--accent-hot)' : 'var(--text-muted)',
            opacity: hovering || liked ? 1 : 0,
            transition: 'opacity var(--transition), color var(--transition)',
            display: 'flex', alignItems: 'center',
          }}
        >
          <IconHeart size={14} filled={liked} />
        </button>
        {onRemove && (
          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            style={{
              padding: 6,
              color: 'var(--text-muted)',
              opacity: hovering ? 1 : 0,
              transition: 'opacity var(--transition)',
              display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--carnation)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <IconTrash size={13} />
          </button>
        )}
      </div>

      {/* Duration */}
      <div style={{
        fontSize: '12px', color: 'var(--text-muted)',
        minWidth: 38, textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {duration}
      </div>
    </div>
  )
}
