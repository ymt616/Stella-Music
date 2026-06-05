import { useEffect, useState, useRef } from 'react'
import { usePlayer } from '../context/PlayerContext'
import { useAuth } from '../context/AuthContext'
import { tokenStore } from '../api/token'
import {
  IconPlay, IconPause, IconSkipNext, IconSkipPrev,
  IconShuffle, IconRepeat, IconRepeatOne,
  IconHeart, IconX, IconVolume1, IconVolume2, IconVolumeX,
} from '../components/UI/Icons'

// Spinning vinyl disc
function VinylDisc({ imageUrl, isPlaying }) {
  const rotationRef = useRef(0)
  const lastTimeRef = useRef(null)
  const rafRef = useRef(null)
  const discRef = useRef(null)

  useEffect(() => {
    function animate(time) {
      if (lastTimeRef.current !== null && isPlaying) {
        const delta = time - lastTimeRef.current
        rotationRef.current = (rotationRef.current + delta * 0.03) % 360
        if (discRef.current) {
          discRef.current.style.transform = `rotate(${rotationRef.current}deg)`
        }
      }
      lastTimeRef.current = time
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying])

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 340, aspectRatio: '1' }}>
      {/* Outer glow ring */}
      <div style={{
        position: 'absolute', inset: -16,
        borderRadius: '50%',
        background: isPlaying
          ? 'radial-gradient(circle, rgba(232,82,122,0.18) 0%, transparent 70%)'
          : 'none',
        transition: 'background 1s ease',
        animation: isPlaying ? 'glowPulse 3s ease-in-out infinite' : 'none',
      }} />

      {/* Vinyl disc */}
      <div
        ref={discRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          position: 'relative',
          boxShadow: isPlaying
            ? '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)'
            : '0 12px 40px rgba(0,0,0,0.35)',
          transition: 'box-shadow 0.5s ease',
          willChange: 'transform',
        }}
      >
        {/* Vinyl grooves background */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          background: `
            repeating-radial-gradient(
              circle at center,
              rgba(0,0,0,0.85) 0px,
              rgba(20,20,30,0.9) 2px,
              rgba(0,0,0,0.85) 4px
            )
          `,
        }} />

        {/* Vinyl shine rings */}
        {[0.72, 0.60, 0.48].map((r, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${(1 - r) * 50}%`, left: `${(1 - r) * 50}%`,
            width: `${r * 100}%`, height: `${r * 100}%`,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.04)',
            pointerEvents: 'none',
          }} />
        ))}

        {/* Album art center circle */}
        <div style={{
          position: 'absolute',
          top: '20%', left: '20%',
          width: '60%', height: '60%',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '3px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 0 2px rgba(0,0,0,0.4)',
        }}>
          {imageUrl ? (
            <img src={imageUrl} alt="album art"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #1a1a2e, #0a0a18)',
            }} />
          )}
        </div>

        {/* Center hole */}
        <div style={{
          position: 'absolute',
          top: '47%', left: '47%',
          width: '6%', height: '6%',
          borderRadius: '50%',
          background: '#000',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: 'inset 0 0 4px rgba(0,0,0,0.8)',
        }} />
      </div>

      {/* Tonearm */}
      <div style={{
        position: 'absolute',
        top: '-8%', right: '-12%',
        width: '40%', height: '55%',
        transformOrigin: '90% 5%',
        transform: isPlaying ? 'rotate(18deg)' : 'rotate(8deg)',
        transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        {/* Arm */}
        <div style={{
          position: 'absolute',
          top: '5%', right: '10%',
          width: '10%', height: '88%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 100%)',
          borderRadius: 4,
          transformOrigin: 'top center',
          transform: 'rotate(-8deg)',
        }} />
        {/* Pivot point */}
        <div style={{
          position: 'absolute',
          top: 0, right: '6%',
          width: 16, height: 16,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.15))',
          border: '1px solid rgba(255,255,255,0.3)',
        }} />
        {/* Needle head */}
        <div style={{
          position: 'absolute',
          bottom: '2%', right: '7%',
          width: 12, height: 12,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.6)',
          boxShadow: '0 0 6px rgba(255,255,255,0.4)',
        }} />
      </div>
    </div>
  )
}

// Progress bar for now playing
function NowPlayingProgress({ position, duration, onSeek }) {
  function fmt(ms) {
    if (!ms) return '0:00'
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0')
    return `${m}:${s}`
  }
  const pct = duration > 0 ? (position / duration) * 100 : 0

  return (
    <div style={{ width: '100%' }}>
      <div
        onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect()
          onSeek(Math.round(((e.clientX - rect.left) / rect.width) * duration))
        }}
        style={{
          width: '100%', height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.25)',
          cursor: 'pointer', marginBottom: 8, position: 'relative',
        }}
        onMouseEnter={e => e.currentTarget.style.height = '6px'}
        onMouseLeave={e => e.currentTarget.style.height = '4px'}
      >
        <div style={{
          height: '100%', width: `${pct}%`,
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 2,
          position: 'relative',
          transition: 'width 0.1s linear',
        }}>
          <div style={{
            position: 'absolute', right: -5, top: '50%',
            transform: 'translateY(-50%)',
            width: 12, height: 12, borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 0 8px rgba(0,0,0,0.3)',
          }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontVariantNumeric: 'tabular-nums' }}>{fmt(position)}</span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontVariantNumeric: 'tabular-nums' }}>{fmt(duration)}</span>
      </div>
    </div>
  )
}

export default function NowPlaying({ onClose }) {
  const {
    currentTrack, isPlaying, position, duration, volume, shuffle, repeat,
    togglePlay, nextTrack, prevTrack, seek, setVolumeLevel, toggleShuffle, toggleRepeat,
  } = usePlayer()
  const { accessToken } = useAuth()
  const [liked, setLiked] = useState(false)
  const [lyrics, setLyrics] = useState(null)
  const [lyricsLoading, setLyricsLoading] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [queue, setQueue] = useState([])

  const imageUrl = currentTrack?.album?.images?.[0]?.url

  // Extract dominant pink from album art — we just use the carnation pink gradient always for consistency
  const bgGradient = imageUrl
    ? `linear-gradient(160deg, #e8527a 0%, #c93060 40%, #a01848 100%)`
    : `linear-gradient(160deg, #e8527a 0%, #c93060 100%)`

  // Fetch lyrics — tries multiple sources with fallbacks
  useEffect(() => {
    if (!currentTrack) return
    setLyrics(null)
    setLyricsLoading(true)

    const rawArtist = currentTrack.artists?.[0]?.name || ''
    const rawTitle  = currentTrack.name || ''
    if (!rawArtist || !rawTitle) { setLyricsLoading(false); return }

    // Strip featured artists and clean up title for better API matches
    const cleanTitle  = rawTitle.replace(/\s*[\(\[].*(feat|ft|with|prod).*[\)\]]/gi, '').trim()
    const cleanArtist = rawArtist.replace(/\s*,.*$/, '').trim() // use first artist only

    // Try lyrics.ovh, then fallback to cleaned names, then give up
    const tryFetch = (artist, title) =>
      fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`)
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
        .then(d => { if (!d.lyrics) throw new Error('no lyrics'); return d.lyrics.trim() })

    tryFetch(cleanArtist, cleanTitle)
      .catch(() => tryFetch(
        // second attempt: remove diacritics (é→e, á→a, etc.)
        cleanArtist.normalize('NFD').replace(/[̀-ͯ]/g, ''),
        cleanTitle.normalize('NFD').replace(/[̀-ͯ]/g, '')
      ))
      .then(text => setLyrics(text))
      .catch(() => setLyrics(null))
      .finally(() => setLyricsLoading(false))
  }, [currentTrack?.id])

  // Fetch queue from Spotify
  useEffect(() => {
    if (!accessToken || !currentTrack) return
    const token = tokenStore.get() || accessToken
    const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8888'
    fetch(`${BACKEND}/api/me/player/queue`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.queue) setQueue(d.queue.slice(0, 5))
      })
      .catch(() => {})
  }, [currentTrack?.id, accessToken])

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  const iconBtn = (active = false) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 8, borderRadius: 8,
    color: active ? '#fff' : 'rgba(255,255,255,0.65)',
    transition: 'color var(--transition)',
    background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
  })

  if (!currentTrack) return null

  // ── Shared background layers ──
  const bgLayers = (
    <>
      {imageUrl && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(80px) saturate(1.4) brightness(0.3)',
          transform: 'scale(1.2)',
        }} />
      )}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(160deg, rgba(232,82,122,0.85) 0%, rgba(170,28,65,0.92) 100%)',
      }} />
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', zIndex: 1, width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
    </>
  )

  // ── Top bar (shared) ──
  const topBar = (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isMobile ? '16px 20px' : '20px 32px',
    }}>
      <button onClick={onClose} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 36, height: 36, borderRadius: 8,
        background: 'rgba(255,255,255,0.12)', color: '#fff',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
      >
        <IconX size={16} color="#fff" />
      </button>

      <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '2px' }}>
        Now Playing
      </div>

      <button
        onClick={() => setShowLyrics(l => !l)}
        style={{
          padding: '7px 14px', borderRadius: 20,
          background: showLyrics ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
          color: '#fff', fontSize: '12px', fontWeight: 600,
          border: '1px solid rgba(255,255,255,0.2)',
          transition: 'background var(--transition)',
        }}
      >
        {isMobile && showLyrics ? 'Player' : 'Lyrics'}
      </button>
    </div>
  )

  // ── Controls row ──
  const controls = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8, marginBottom: 20 }}>
        <button style={iconBtn(shuffle)} onClick={toggleShuffle}><IconShuffle size={isMobile ? 16 : 18} /></button>
        <button onClick={prevTrack} style={{ ...iconBtn(), padding: 10 }}><IconSkipPrev size={isMobile ? 22 : 26} color="#fff" /></button>
        <button
          onClick={togglePlay}
          style={{
            width: isMobile ? 60 : 68, height: isMobile ? 60 : 68, borderRadius: '50%',
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            transition: 'transform var(--transition)',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isPlaying
            ? <IconPause size={isMobile ? 22 : 26} color="#c93060" strokeWidth={2.5} />
            : <IconPlay  size={isMobile ? 22 : 26} color="#c93060" strokeWidth={2.5} style={{ marginLeft: 3 }} />}
        </button>
        <button onClick={nextTrack} style={{ ...iconBtn(), padding: 10 }}><IconSkipNext size={isMobile ? 22 : 26} color="#fff" /></button>
        <button style={iconBtn(repeat !== 'off')} onClick={toggleRepeat}>
          {repeat === 'track' ? <IconRepeatOne size={isMobile ? 16 : 18} /> : <IconRepeat size={isMobile ? 16 : 18} />}
        </button>
      </div>

      {/* Like + Volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => setLiked(l => !l)} style={{ ...iconBtn(liked), padding: 6 }}>
          <IconHeart size={18} color={liked ? '#fff' : 'rgba(255,255,255,0.6)'} filled={liked} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {volume === 0 ? <IconVolumeX size={15} color="rgba(255,255,255,0.5)" />
            : volume < 0.5 ? <IconVolume1 size={15} color="rgba(255,255,255,0.5)" />
            : <IconVolume2 size={15} color="rgba(255,255,255,0.5)" />}
          <div
            style={{ width: 90, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.25)', cursor: 'pointer' }}
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect()
              setVolumeLevel(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
            }}
          >
            <div style={{ height: '100%', width: `${volume * 100}%`, background: 'rgba(255,255,255,0.85)', borderRadius: 2 }} />
          </div>
        </div>
      </div>
    </>
  )

  // ── Lyrics panel content ──
  const lyricsContent = (
    <div style={{ flex: 1, overflowY: 'auto', paddingTop: isMobile ? 80 : 0 }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 24 }}>
        Lyrics
      </div>
      {lyricsLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : lyrics ? (
        <div style={{ fontSize: isMobile ? '16px' : '17px', lineHeight: 1.95, color: 'rgba(255,255,255,0.88)', fontFamily: "'Playfair Display', serif", whiteSpace: 'pre-wrap' }}>
          {lyrics}
        </div>
      ) : (
        <div style={{ textAlign: 'center', paddingTop: 80, color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ fontSize: '36px', marginBottom: 12 }}>♪</div>
          <div style={{ fontSize: '15px' }}>No lyrics found</div>
          <div style={{ fontSize: '12px', marginTop: 6, opacity: 0.7 }}>for "{currentTrack.name}"</div>
        </div>
      )}
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex',
      animation: 'fadeIn 0.25s ease',
      overflow: 'hidden',
    }}>
      {bgLayers}
      {topBar}

      {/* ── MOBILE: single column, toggle between disc and lyrics ── */}
      {isMobile ? (
        <div style={{
          position: 'relative', zIndex: 2,
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          padding: '72px 24px 32px',
          overflowY: 'auto',
        }}>
          {showLyrics ? (
            // Lyrics view on mobile
            lyricsContent
          ) : (
            // Player view on mobile
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              {/* Disc */}
              <div style={{ width: '75%', maxWidth: 260, marginBottom: 28, marginTop: 8 }}>
                <VinylDisc imageUrl={imageUrl} isPlaying={isPlaying} />
              </div>

              {/* Track info */}
              <div style={{ textAlign: 'center', marginBottom: 20, width: '100%' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#fff', marginBottom: 4, letterSpacing: '-0.02em' }}>
                  {currentTrack.name}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                  {currentTrack.artists?.map(a => a.name).join(', ')}
                </div>
              </div>

              {/* Progress */}
              <div style={{ width: '100%', marginBottom: 20 }}>
                <NowPlayingProgress position={position} duration={duration} onSeek={seek} />
              </div>

              {controls}

              {/* Up Next queue */}
              {queue.length > 0 && (
                <div style={{ width: '100%', marginTop: 28 }}>
                  <div style={{
                    fontSize: '10px', fontWeight: 700, letterSpacing: '2px',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
                    marginBottom: 14,
                  }}>
                    Up Next
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {queue.map((track, i) => {
                      const mins = Math.floor((track.duration_ms || 0) / 60000)
                      const secs = Math.floor(((track.duration_ms || 0) % 60000) / 1000).toString().padStart(2, '0')
                      return (
                        <div key={track.id + i} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '8px 10px',
                          borderRadius: 10,
                          background: 'rgba(255,255,255,0.07)',
                          backdropFilter: 'blur(8px)',
                        }}>
                          <img
                            src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
                            alt=""
                            style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="truncate" style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>
                              {track.name}
                            </div>
                            <div className="truncate" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>
                              {track.artists?.map(a => a.name).join(', ')}
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                            {mins}:{secs}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // ── DESKTOP: side-by-side ──
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', width: '100%', height: '100%' }}>
          {/* Left: disc + controls */}
          <div style={{
            flex: showLyrics ? '0 0 52%' : '1',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '80px 48px 40px',
            transition: 'flex 0.4s ease',
          }}>
            <div style={{ width: '100%', maxWidth: 300, marginBottom: 36 }}>
              <VinylDisc imageUrl={imageUrl} isPlaying={isPlaying} />
            </div>

            <div style={{ textAlign: 'center', marginBottom: 24, width: '100%', maxWidth: 380 }}>
              <div style={{ fontSize: '1.7rem', fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#fff', marginBottom: 6, letterSpacing: '-0.02em', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
                {currentTrack.name}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.72)' }}>
                {currentTrack.artists?.map(a => a.name).join(', ')}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
                {currentTrack.album?.name}
              </div>
            </div>

            <div style={{ width: '100%', maxWidth: 380, marginBottom: 28 }}>
              <NowPlayingProgress position={position} duration={duration} onSeek={seek} />
            </div>

            {controls}
          </div>

          {/* Right: lyrics */}
          {showLyrics && (
            <div style={{
              flex: '0 0 48%',
              display: 'flex', flexDirection: 'column',
              padding: '100px 48px 48px 0',
              overflowY: 'auto',
              animation: 'fadeIn 0.3s ease',
            }}>
              {lyricsContent}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.08); }
        }
      `}</style>
    </div>
  )
}
