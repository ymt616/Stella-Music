import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { spotifyApi } from '../api/spotify'
// PlayerContext uses spotifyApi directly to Spotify

const PlayerContext = createContext(null)

// Module-level singleton — survives HMR re-renders, prevents duplicate SDK instances
let _sdkInitialised = false
let _sdkScriptAdded = false

export function PlayerProvider({ children }) {
  const { accessToken } = useAuth()
  const [player, setPlayer] = useState(null)
  const [deviceId, setDeviceId] = useState(null)
  const deviceIdRef = useRef(null)
  const [isPremium, setIsPremium] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState('off') // off, context, track

  const positionTimer = useRef(null)

  // Tick position forward while playing
  useEffect(() => {
    if (isPlaying) {
      positionTimer.current = setInterval(() => {
        setPosition(p => Math.min(p + 1000, duration))
      }, 1000)
    } else {
      clearInterval(positionTimer.current)
    }
    return () => clearInterval(positionTimer.current)
  }, [isPlaying, duration])

  // Keep a ref to the SDK instance so cleanup always sees the latest value
  const playerRef = useRef(null)

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!accessToken) return
    let cancelled = false

    // Feb 2026: /me no longer returns 'product' field.
    // Assume premium (SDK will fail gracefully if not) and let the SDK ready event confirm.
    spotifyApi(accessToken).get('/me').then(res => {
      if (cancelled) return
      // product field removed in Feb 2026 — assume premium and let SDK connect
      const premium = res.data.product ? res.data.product === 'premium' : true
      setIsPremium(premium)

      // Guard: only ever create one SDK player instance per page load
      if (_sdkInitialised) return

      const initPlayer = () => {
        if (cancelled || _sdkInitialised) return
        _sdkInitialised = true

        const sdk = new window.Spotify.Player({
          name: 'Stella',
          getOAuthToken: cb => cb(accessToken),
          volume: 0.7,
        })

        sdk.addListener('ready', ({ device_id }) => {
          console.log('✦ Stella SDK ready, device_id:', device_id)
          deviceIdRef.current = device_id
          setDeviceId(device_id)
          setIsReady(true)
        })

        sdk.addListener('not_ready', () => {
          setIsReady(false)
        })

        sdk.addListener('initialization_error', ({ message }) => {
          console.error('SDK init error:', message)
          _sdkInitialised = false // allow retry
        })

        sdk.addListener('authentication_error', ({ message }) => {
          console.error('SDK auth error:', message)
          _sdkInitialised = false
        })

        sdk.addListener('account_error', ({ message }) => {
          console.error('SDK account error (Premium required):', message)
          setIsPremium(false)
          _sdkInitialised = false
        })

        sdk.addListener('player_state_changed', state => {
          if (!state) return
          setCurrentTrack(state.track_window.current_track)
          setIsPlaying(!state.paused)
          setPosition(state.position)
          setDuration(state.duration)
          setShuffle(state.shuffle)
          setRepeat(['off', 'context', 'track'][state.repeat_mode])
        })

        sdk.connect()
        playerRef.current = sdk
        setPlayer(sdk)
      }

      // Only set the global callback once
      window.onSpotifyWebPlaybackSDKReady = initPlayer

      if (!window.Spotify) {
        if (!_sdkScriptAdded) {
          _sdkScriptAdded = true
          const script = document.createElement('script')
          script.src = 'https://sdk.scdn.co/spotify-player.js'
          document.head.appendChild(script)
        }
      } else {
        initPlayer()
      }
    }).catch(() => {})

    return () => {
      cancelled = true
      if (playerRef.current) {
        playerRef.current.disconnect()
        playerRef.current = null
      }
    }
  }, [accessToken])

  const playTrack = useCallback(async (uri, contextUri = null) => {
    if (!accessToken) return
    const did = deviceIdRef.current
    if (!did) {
      console.warn('No device ready yet — SDK still connecting.')
      return
    }
    const body = contextUri
      ? { context_uri: contextUri, offset: { uri }, device_id: did }
      : { uris: [uri], device_id: did }
    try {
      await spotifyApi(accessToken).put('/me/player/play', body)
    } catch (e) {
      console.error('Play failed:', e.response?.data || e.message)
    }
  }, [accessToken])

  const playContext = useCallback(async (contextUri, offset = 0) => {
    if (!accessToken) return
    const did = deviceIdRef.current
    if (!did) {
      console.warn('No device ready yet — SDK still connecting.')
      return
    }
    const body = { context_uri: contextUri, offset: { position: offset }, device_id: did }
    await spotifyApi(accessToken).put('/me/player/play', body).catch(e => {
      console.error('Play context error:', e.response?.data)
    })
  }, [accessToken])

  const togglePlay = useCallback(async () => {
    if (playerRef.current) {
      playerRef.current.togglePlay()
    } else if (accessToken) {
      if (isPlaying) {
        await spotifyApi(accessToken).put('/me/player/pause')
        setIsPlaying(false)
      } else {
        await spotifyApi(accessToken).put('/me/player/play', {})
        setIsPlaying(true)
      }
    }
  }, [isPlaying, accessToken])

  const nextTrack = useCallback(async () => {
    if (playerRef.current) { playerRef.current.nextTrack() }
    else if (accessToken) { await spotifyApi(accessToken).post('/me/player/next') }
  }, [accessToken])

  const prevTrack = useCallback(async () => {
    if (playerRef.current) { playerRef.current.previousTrack() }
    else if (accessToken) { await spotifyApi(accessToken).post('/me/player/previous') }
  }, [accessToken])

  const seek = useCallback(async (ms) => {
    if (player) { player.seek(ms) }
    else if (accessToken) { await spotifyApi(accessToken).put(`/me/player/seek?position_ms=${ms}`) }
    setPosition(ms)
  }, [player, accessToken])

  const setVolumeLevel = useCallback(async (vol) => {
    setVolume(vol)
    if (player) { player.setVolume(vol) }
    else if (accessToken) {
      await spotifyApi(accessToken).put(`/me/player/volume?volume_percent=${Math.round(vol * 100)}`)
    }
  }, [player, accessToken])

  const toggleShuffle = useCallback(async () => {
    const next = !shuffle
    setShuffle(next)
    if (accessToken) { await spotifyApi(accessToken).put(`/me/player/shuffle?state=${next}`) }
  }, [shuffle, accessToken])

  const toggleRepeat = useCallback(async () => {
    const states = ['off', 'context', 'track']
    const next = states[(states.indexOf(repeat) + 1) % 3]
    setRepeat(next)
    if (accessToken) { await spotifyApi(accessToken).put(`/me/player/repeat?state=${next}`) }
  }, [repeat, accessToken])

  return (
    <PlayerContext.Provider value={{
      player, deviceId, isPremium, isReady,
      currentTrack, isPlaying, position, duration, volume, shuffle, repeat,
      playTrack, playContext, togglePlay, nextTrack, prevTrack,
      seek, setVolumeLevel, toggleShuffle, toggleRepeat,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => useContext(PlayerContext)
