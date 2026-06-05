import { Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { IconHome, IconSearch, IconLibrary } from './components/UI/Icons'
import Starfield from './components/UI/Starfield'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PlayerProvider } from './context/PlayerContext'
import { api } from './api/spotify'

import Sidebar from './components/Layout/Sidebar'
import Topbar from './components/Layout/Topbar'
import Player from './components/Layout/Player'

import Login from './pages/Login'
import Callback from './pages/Callback'
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import Playlist from './pages/Playlist'
import Album from './pages/Album'
import Artist from './pages/Artist'

function CreatePlaylistModal({ onClose, onCreate }) {
  const [name, setName] = useState('My Playlist')
  const [desc, setDesc] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="fade-in liquid-glass"
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '36px',
          width: 420,
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        <h2 style={{ marginBottom: 24, fontSize: '1.5rem' }}>Create Playlist</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Optional description..."
              rows={3}
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                resize: 'vertical',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={e => setIsPublic(e.target.checked)}
              style={{ accentColor: 'var(--accent-hot)', width: 16, height: 16 }}
            />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Make playlist public</span>
          </label>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '10px 24px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px' }}
          >Cancel</button>
          <button
            onClick={() => onCreate({ name, description: desc, public: isPublic })}
            style={{
              padding: '10px 24px', borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--accent-hot), var(--carnation))',
              color: '#fff', fontSize: '13px', fontWeight: 700,
              boxShadow: '0 4px 16px var(--accent-glow)',
            }}
          >Create</button>
        </div>
      </div>
    </div>
  )
}

function AppLayout() {
  const { accessToken, user } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (!accessToken) return
    api.getPlaylists(accessToken)
      .then(res => setPlaylists(res.data.items || []))
      .catch(() => {})
  }, [accessToken])

  async function handleCreatePlaylist(data) {
    if (!user || !accessToken) return
    try {
      const res = await api.createPlaylist(accessToken, user.id, data)
      setPlaylists(prev => [res.data, ...prev])
      setShowCreateModal(false)
    } catch (e) { console.error(e) }
  }

  if (!accessToken) return null

  return (
    <PlayerProvider>
      <Starfield />
      <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar — hidden on mobile via CSS class */}
          <div className="sidebar-desktop" style={{ display: 'flex' }}>
            <Sidebar
              playlists={playlists}
              onCreatePlaylist={() => setShowCreateModal(true)}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Topbar />
            <main
              className="main-scroll"
              style={{
                flex: 1, overflowY: 'auto',
                background: 'linear-gradient(to bottom, var(--bg-secondary) 0%, var(--bg-primary) 300px)',
              }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/library" element={<Library />} />
                <Route path="/playlist/:id" element={<Playlist />} />
                <Route path="/album/:id" element={<Album />} />
                <Route path="/artist/:id" element={<Artist />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </div>

        <Player />

        {/* Bottom nav — shown only on mobile via CSS */}
        <nav className="bottom-nav liquid-glass" style={{
          display: 'none', // overridden by CSS on mobile
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 'var(--bottom-nav-height, 60px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 0,
          zIndex: 30,
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {[
            { to: '/', Icon: IconHome,    label: 'Home',    end: true },
            { to: '/search',  Icon: IconSearch,  label: 'Search' },
            { to: '/library', Icon: IconLibrary, label: 'Library' },
          ].map(({ to, Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '10px', fontWeight: isActive ? 600 : 400,
              textDecoration: 'none', padding: '4px 16px',
              transition: 'color var(--transition)',
            })}>
              {({ isActive }) => <>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.7} />
                {label}
              </>}
            </NavLink>
          ))}
        </nav>

        {showCreateModal && (
          <CreatePlaylistModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreatePlaylist}
          />
        )}
      </div>
    </PlayerProvider>
  )
}

function AppRouter() {
  const { accessToken, user, loading, logout } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <Routes>
      <Route path="/callback" element={<Callback />} />
      {!accessToken || !user ? (
        <Route path="*" element={<Login />} />
      ) : (
        <Route path="*" element={<AppLayout />} />
      )}
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
