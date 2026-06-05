import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { IconHome, IconSearch, IconLibrary, IconPlus, IconMusic } from '../UI/Icons'

const NAV_ITEMS = [
  { to: '/',        Icon: IconHome,    label: 'Home',        end: true },
  { to: '/search',  Icon: IconSearch,  label: 'Search' },
  { to: '/library', Icon: IconLibrary, label: 'Your Library' },
]

export default function Sidebar({ playlists = [], onCreatePlaylist }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className="liquid-glass" style={{
      width: 'var(--sidebar-width)',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      flexShrink: 0,
      overflow: 'hidden',
      borderRadius: 0,
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '22px 20px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '23px', fontWeight: 700,
          color: '#fff',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.01em',
        }}>
          Stella
        </span>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px 8px' }}>
        {NAV_ITEMS.map(({ to, Icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 2,
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: '14px',
              transition: 'all var(--transition)',
              textDecoration: 'none',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div style={{ margin: '4px 16px 8px', height: '1px', background: 'var(--border)' }} />

      {/* Playlists */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 12px 10px',
          color: 'var(--text-dim)', fontSize: '10px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '1.5px',
        }}>
          <span>Playlists</span>
          <button
            onClick={onCreatePlaylist}
            title="Create playlist"
            style={{
              width: 24, height: 24,
              borderRadius: '50%',
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,184,200,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-dim)'}
          >
            <IconPlus size={14} />
          </button>
        </div>

        {playlists.map(pl => (
          <button
            key={pl.id}
            onClick={() => navigate(`/playlist/${pl.id}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '7px 12px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)', fontSize: '13px',
              textAlign: 'left',
              transition: 'all var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,184,200,0.05)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            {pl.images?.[0]?.url ? (
              <img src={pl.images[0].url} alt={pl.name}
                style={{ width: 32, height: 32, borderRadius: 'var(--radius-xs)', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-xs)', flexShrink: 0,
                background: 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconMusic size={14} color="var(--text-muted)" />
              </div>
            )}
            <span className="truncate">{pl.name}</span>
          </button>
        ))}
      </div>

      {/* User */}
      {user && (
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(0,0,0,0.2)',
        }}>
          <img
            src={user.images?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name)}&background=0a1628&color=f4b8c8&bold=true`}
            alt={user.display_name}
            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
          />
          <div style={{ minWidth: 0 }}>
            <div className="truncate" style={{ fontSize: '13px', fontWeight: 600 }}>{user.display_name}</div>
            <div style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Premium</div>
          </div>
        </div>
      )}
    </aside>
  )
}
