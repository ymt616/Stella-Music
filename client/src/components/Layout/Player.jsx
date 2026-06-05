import { useState } from 'react'
import { usePlayer } from '../../context/PlayerContext'
import { useNavigate } from 'react-router-dom'
import {
  IconPlay, IconPause, IconSkipNext, IconSkipPrev,
  IconShuffle, IconRepeat, IconRepeatOne,
  IconVolume2, IconVolume1, IconVolumeX, IconHeart,
} from '../UI/Icons'
import NowPlaying from '../../pages/NowPlaying'

function ProgressBar({ position, duration, onSeek }) {
  const pct = duration > 0 ? (position / duration) * 100 : 0

  function handleClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    onSeek(Math.round(((e.clientX - rect.left) / rect.width) * duration))
  }

  function fmt(ms) {
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: 34, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {fmt(position)}
      </span>
      <div
        onClick={handleClick}
        style={{
          flex: 1, height: 3, borderRadius: 2,
          background: 'rgba(255,255,255,0.08)',
          cursor: 'pointer', position: 'relative',
        }}
        onMouseEnter={e => { e.currentTarget.style.height = '5px'; const t = e.currentTarget.querySelector('.thumb'); if(t) t.style.opacity='1' }}
        onMouseLeave={e => { e.currentTarget.style.height = '3px'; const t = e.currentTarget.querySelector('.thumb'); if(t) t.style.opacity='0' }}
      >
        <div style={{
          height: '100%', width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--carnation-light), var(--accent))',
          borderRadius: 2, position: 'relative',
          transition: 'width 0.1s linear',
        }}>
          <div className="thumb" style={{
            position: 'absolute', right: -5, top: '50%',
            transform: 'translateY(-50%)',
            width: 11, height: 11, borderRadius: '50%',
            background: 'var(--accent)', opacity: 0,
            transition: 'opacity var(--transition)',
            boxShadow: '0 0 8px var(--accent-glow)',
          }} />
        </div>
      </div>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: 34, fontVariantNumeric: 'tabular-nums' }}>
        {fmt(duration)}
      </span>
    </div>
  )
}

function VolumeSlider({ volume, onChange }) {
  const Icon = volume === 0 ? IconVolumeX : volume < 0.5 ? IconVolume1 : IconVolume2
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon size={16} color="var(--text-muted)" />
      <div style={{ position: 'relative', width: 80, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', cursor: 'pointer' }}
        onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect()
          onChange(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
        }}
      >
        <div style={{
          height: '100%', width: `${volume * 100}%`,
          background: 'linear-gradient(90deg, var(--carnation-light), var(--accent))',
          borderRadius: 2,
        }} />
      </div>
    </div>
  )
}

export default function Player() {
  const {
    currentTrack, isPlaying, position, duration, volume, shuffle, repeat,
    togglePlay, nextTrack, prevTrack, seek, setVolumeLevel, toggleShuffle, toggleRepeat,
  } = usePlayer()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [showNowPlaying, setShowNowPlaying] = useState(false)

  const iconBtn = (active = false, danger = false) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 6, borderRadius: 6,
    color: active ? 'var(--accent)' : danger ? 'var(--text-muted)' : 'var(--text-secondary)',
    transition: 'color var(--transition), opacity var(--transition)',
    opacity: active ? 1 : 0.7,
  })

  return (
    <>
    {showNowPlaying && currentTrack && (
      <NowPlaying onClose={() => setShowNowPlaying(false)} />
    )}
    <div className="player-bar liquid-glass" style={{
      height: 'var(--player-height)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 0,
      display: 'flex', alignItems: 'center',
      padding: '0 20px',
      gap: 12,
      flexShrink: 0,
      position: 'relative',
      zIndex: 20,
    }}>
      {/* Left: now playing */}
      <div className="player-left" style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 180 }}>
        {currentTrack ? (
          <>
            <img
              src={currentTrack.album?.images?.[2]?.url || currentTrack.album?.images?.[0]?.url}
              alt={currentTrack.name}
              onClick={() => setShowNowPlaying(true)}
              title="Open Now Playing"
              style={{
                width: 52, height: 52,
                borderRadius: 'var(--radius-sm)',
                objectFit: 'cover',
                cursor: 'pointer',
                boxShadow: '0 0 16px var(--accent-glow)',
                flexShrink: 0,
                transition: 'transform var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
            <div style={{ minWidth: 0, cursor: 'pointer' }} onClick={() => setShowNowPlaying(true)}>
              <div className="truncate" style={{ fontSize: '13px', fontWeight: 600, marginBottom: 2 }}>
                {currentTrack.name}
              </div>
              <div className="truncate" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {currentTrack.artists?.map(a => a.name).join(', ')}
              </div>
            </div>
            <button
              onClick={() => setLiked(l => !l)}
              style={{ ...iconBtn(liked), flexShrink: 0, marginLeft: 4 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = liked ? '1' : '0.7'}
            >
              <IconHeart size={15} color={liked ? 'var(--accent-hot)' : 'var(--text-muted)'} filled={liked} />
            </button>
          </>
        ) : (
          <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontStyle: 'italic' }}>Nothing playing</span>
        )}
      </div>

      {/* Center: controls + progress */}
      <div className="player-center" style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, maxWidth: 580 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            style={iconBtn(shuffle)}
            onClick={toggleShuffle}
            title="Shuffle"
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = shuffle ? 'var(--accent)' : 'var(--text-secondary)'}
          >
            <IconShuffle size={16} />
          </button>

          <button
            onClick={prevTrack}
            style={{ ...iconBtn(), padding: 8 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <IconSkipPrev size={20} />
          </button>

          <button
            onClick={togglePlay}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-hot), var(--carnation))',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px var(--accent-glow)',
              transition: 'transform var(--transition), box-shadow var(--transition)',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 0 32px var(--accent-glow)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 20px var(--accent-glow)' }}
          >
            {isPlaying ? <IconPause size={16} color="#fff" strokeWidth={2.5} /> : <IconPlay size={16} color="#fff" strokeWidth={2.5} style={{ marginLeft: 2 }} />}
          </button>

          <button
            onClick={nextTrack}
            style={{ ...iconBtn(), padding: 8 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <IconSkipNext size={20} />
          </button>

          <button
            style={iconBtn(repeat !== 'off')}
            onClick={toggleRepeat}
            title="Repeat"
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = repeat !== 'off' ? 'var(--accent)' : 'var(--text-secondary)'}
          >
            {repeat === 'track' ? <IconRepeatOne size={16} /> : <IconRepeat size={16} />}
          </button>
        </div>

        <div className="player-progress" style={{ width: '100%' }}>
          <ProgressBar position={position} duration={duration} onSeek={seek} />
        </div>
      </div>

      {/* Right: volume */}
      <div className="player-volume" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <VolumeSlider volume={volume} onChange={setVolumeLevel} />
      </div>
    </div>
    </>
  )
}
