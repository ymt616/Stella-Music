import { useNavigate } from 'react-router-dom'
import { usePlayer } from '../../context/PlayerContext'
import { useState } from 'react'
import { IconPlay, IconMusic } from './Icons'

export default function AlbumCard({ item, type = 'album' }) {
  const navigate = useNavigate()
  const { playContext } = usePlayer()
  const [hovering, setHovering] = useState(false)

  if (!item) return null

  const image = item.images?.[0]?.url
  const name = item.name
  const subtitle = type === 'album'
    ? item.artists?.map(a => a.name).join(', ')
    : type === 'artist'
    ? 'Artist'
    : item.description || item.owner?.display_name || ''

  function handleClick() {
    if (type === 'album') navigate(`/album/${item.id}`)
    else if (type === 'artist') navigate(`/artist/${item.id}`)
    else if (type === 'playlist') navigate(`/playlist/${item.id}`)
  }

  async function handlePlay(e) {
    e.stopPropagation()
    if (item.uri) await playContext(item.uri, 0)
  }

  return (
    <div
      className="liquid-glass-card"
      onClick={handleClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        cursor: 'pointer',
        transition: 'all var(--transition)',
        transform: hovering ? 'translateY(-3px)' : 'none',
        position: 'relative',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        {image ? (
          <img
            src={image}
            alt={name}
            style={{
              width: '100%',
              aspectRatio: '1',
              objectFit: 'cover',
              borderRadius: type === 'artist' ? '50%' : 'var(--radius-sm)',
              boxShadow: hovering ? '0 8px 24px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'box-shadow var(--transition)',
            }}
          />
        ) : (
          <div style={{
            width: '100%', aspectRatio: '1',
            borderRadius: type === 'artist' ? '50%' : 'var(--radius-sm)',
            background: 'var(--bg-elevated)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconMusic size={32} color="var(--text-dim)" />
          </div>
        )}

        {/* Play button overlay */}
        <button
          onClick={handlePlay}
          style={{
            position: 'absolute',
            bottom: 8, right: 8,
            width: 40, height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-hot), var(--carnation))',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(232,82,122,0.5)',
            opacity: hovering ? 1 : 0,
            transform: hovering ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.85)',
            transition: 'all var(--transition)',
          }}
        >
          <IconPlay size={15} color="#fff" strokeWidth={2.5} style={{ marginLeft: 2 }} />
        </button>
      </div>

      {/* Info */}
      <div className="truncate" style={{ fontSize: '13px', fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
        {name}
      </div>
      <div className="truncate" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
        {subtitle}
      </div>
    </div>
  )
}
