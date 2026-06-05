import { spotifyLogin } from '../context/AuthContext'
import Starfield from '../components/UI/Starfield'

export default function Login() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Starfield />

      {/* Pink ambient glow */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,82,122,0.07) 0%, transparent 70%)',
        top: '10%', left: '20%', pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Main card */}
      <div className="fade-in glass" style={{
        padding: '60px 52px',
        borderRadius: 'var(--radius-xl)',
        maxWidth: 420,
        width: '90%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        border: '1px solid rgba(244,184,200,0.12)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 80px rgba(232,82,122,0.06)',
      }}>
        {/* App name */}
        <h1 style={{
          fontSize: '3.5rem', marginBottom: 10, letterSpacing: '-0.03em',
          fontFamily: "'Playfair Display', serif",
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--carnation) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Stella
        </h1>

        <p style={{
          color: 'var(--text-secondary)', fontSize: '15px',
          marginBottom: 10, lineHeight: 1.6,
          fontStyle: 'italic', fontFamily: "'Playfair Display', serif",
        }}>
          Your music, among the stars.
        </p>

        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: 40, lineHeight: 1.7 }}>
          Connect your Spotify account to access your playlists, library, and discover new music.
        </p>

        {/* Spotify login button */}
        <button
          onClick={spotifyLogin}
          style={{
            width: '100%',
            padding: '15px 32px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, #1DB954 0%, #17a448 100%)',
            color: '#fff',
            fontSize: '15px', fontWeight: 700,
            letterSpacing: '0.3px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 4px 24px rgba(29,185,84,0.3)',
            transition: 'all var(--transition)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(29,185,84,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(29,185,84,0.3)' }}
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Continue with Spotify
        </button>

        <p style={{ color: 'var(--text-dim)', fontSize: '11px', marginTop: 24, lineHeight: 1.7 }}>
          Stella is not affiliated with Spotify AB.
        </p>
      </div>
    </div>
  )
}
