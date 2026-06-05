import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { IconSearch, IconChevronLeft, IconChevronRight, IconSettings, IconChevronDown, IconUser, IconLogOut } from '../UI/Icons'

export default function Topbar() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [query, setQuery] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [focused, setFocused] = useState(false)

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="liquid-glass" style={{
      height: 'var(--topbar-height)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 0,
      flexShrink: 0,
      zIndex: 10,
      gap: 16,
    }}>
      {/* Nav arrows */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {[
          { Icon: IconChevronLeft,  action: () => navigate(-1) },
          { Icon: IconChevronRight, action: () => navigate(1) },
        ].map(({ Icon, action }, i) => (
          <button key={i} onClick={action}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,184,200,0.08)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--border-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <Icon size={14} strokeWidth={2} />
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 420 }}>
        <div style={{ position: 'relative' }}>
          <IconSearch
            size={15}
            color={focused ? 'var(--accent)' : 'var(--text-muted)'}
            style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'none', transition: 'color var(--transition)',
            }}
          />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search songs, artists, albums..."
            style={{
              width: '100%',
              padding: '9px 16px 9px 40px',
              background: focused ? 'rgba(244,184,200,0.06)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${focused ? 'var(--border-hover)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              transition: 'all var(--transition)',
            }}
          />
        </div>
      </form>

      {/* User menu */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setShowMenu(m => !m)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px 6px 6px',
            background: showMenu ? 'rgba(244,184,200,0.08)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${showMenu ? 'var(--border-hover)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-secondary)',
            transition: 'all var(--transition)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,184,200,0.08)'; e.currentTarget.style.borderColor = 'var(--border-hover)' }}
          onMouseLeave={e => { if (!showMenu) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--border)' } }}
        >
          {user?.images?.[0]?.url ? (
            <img src={user.images[0].url} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} alt="" />
          ) : (
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconUser size={13} color="var(--text-muted)" />
            </div>
          )}
          <IconChevronDown size={13} strokeWidth={2} />
        </button>

        {showMenu && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowMenu(false)} />
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              minWidth: 180,
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              zIndex: 100,
              animation: 'fadeIn 0.15s ease',
            }}>
              {user && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{user.display_name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Premium</div>
                </div>
              )}
              {[
                { label: 'Log out', action: logout, Icon: IconLogOut, danger: true },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => { item.action?.(); setShowMenu(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%',
                    padding: '11px 16px',
                    fontSize: '13px',
                    color: item.danger ? 'var(--carnation-light)' : 'var(--text-primary)',
                    transition: 'background var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <item.Icon size={15} />
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </header>
  )
}
