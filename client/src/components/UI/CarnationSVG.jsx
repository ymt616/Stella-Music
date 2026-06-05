// Decorative carnation flower SVG components
export function CarnationSmall({ className = '', style = {} }) {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} width="60" height="60">
      <g opacity="0.7">
        {/* Petals */}
        <ellipse cx="30" cy="18" rx="7" ry="12" fill="#ff6b8a" transform="rotate(0 30 30)" opacity="0.9"/>
        <ellipse cx="30" cy="18" rx="7" ry="12" fill="#e8446a" transform="rotate(45 30 30)" opacity="0.8"/>
        <ellipse cx="30" cy="18" rx="7" ry="12" fill="#ff9eb5" transform="rotate(90 30 30)" opacity="0.9"/>
        <ellipse cx="30" cy="18" rx="7" ry="12" fill="#e8446a" transform="rotate(135 30 30)" opacity="0.8"/>
        <ellipse cx="30" cy="18" rx="7" ry="12" fill="#ff6b8a" transform="rotate(180 30 30)" opacity="0.9"/>
        <ellipse cx="30" cy="18" rx="7" ry="12" fill="#ffb6c1" transform="rotate(225 30 30)" opacity="0.7"/>
        <ellipse cx="30" cy="18" rx="7" ry="12" fill="#ff6b8a" transform="rotate(270 30 30)" opacity="0.9"/>
        <ellipse cx="30" cy="18" rx="7" ry="12" fill="#e8446a" transform="rotate(315 30 30)" opacity="0.8"/>
        {/* Center */}
        <circle cx="30" cy="30" r="6" fill="#ffb6c1"/>
        <circle cx="30" cy="30" r="3" fill="#fff5f7"/>
      </g>
    </svg>
  )
}

export function CarnationLarge({ className = '', style = {} }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} style={style} width="120" height="120">
      <g opacity="0.6">
        <ellipse cx="60" cy="30" rx="12" ry="28" fill="#ff6b8a" transform="rotate(0 60 60)" opacity="0.85"/>
        <ellipse cx="60" cy="30" rx="12" ry="28" fill="#e8446a" transform="rotate(30 60 60)" opacity="0.75"/>
        <ellipse cx="60" cy="30" rx="12" ry="28" fill="#ff9eb5" transform="rotate(60 60 60)" opacity="0.85"/>
        <ellipse cx="60" cy="30" rx="12" ry="28" fill="#d63060" transform="rotate(90 60 60)" opacity="0.8"/>
        <ellipse cx="60" cy="30" rx="12" ry="28" fill="#ff6b8a" transform="rotate(120 60 60)" opacity="0.85"/>
        <ellipse cx="60" cy="30" rx="12" ry="28" fill="#ffb6c1" transform="rotate(150 60 60)" opacity="0.7"/>
        <ellipse cx="60" cy="30" rx="12" ry="28" fill="#ff6b8a" transform="rotate(180 60 60)" opacity="0.85"/>
        <ellipse cx="60" cy="30" rx="12" ry="28" fill="#e8446a" transform="rotate(210 60 60)" opacity="0.75"/>
        <ellipse cx="60" cy="30" rx="12" ry="28" fill="#ff9eb5" transform="rotate(240 60 60)" opacity="0.85"/>
        <ellipse cx="60" cy="30" rx="12" ry="28" fill="#d63060" transform="rotate(270 60 60)" opacity="0.8"/>
        <ellipse cx="60" cy="30" rx="12" ry="28" fill="#ff6b8a" transform="rotate(300 60 60)" opacity="0.85"/>
        <ellipse cx="60" cy="30" rx="12" ry="28" fill="#ffb6c1" transform="rotate(330 60 60)" opacity="0.7"/>
        {/* Inner petals */}
        <ellipse cx="60" cy="40" rx="8" ry="18" fill="#ffb6c1" transform="rotate(15 60 60)" opacity="0.6"/>
        <ellipse cx="60" cy="40" rx="8" ry="18" fill="#ff9eb5" transform="rotate(75 60 60)" opacity="0.6"/>
        <ellipse cx="60" cy="40" rx="8" ry="18" fill="#ffb6c1" transform="rotate(135 60 60)" opacity="0.6"/>
        <ellipse cx="60" cy="40" rx="8" ry="18" fill="#ff9eb5" transform="rotate(195 60 60)" opacity="0.6"/>
        <ellipse cx="60" cy="40" rx="8" ry="18" fill="#ffb6c1" transform="rotate(255 60 60)" opacity="0.6"/>
        <ellipse cx="60" cy="40" rx="8" ry="18" fill="#ff9eb5" transform="rotate(315 60 60)" opacity="0.6"/>
        {/* Center */}
        <circle cx="60" cy="60" r="12" fill="#fce4ec"/>
        <circle cx="60" cy="60" r="6" fill="#fff5f7"/>
      </g>
    </svg>
  )
}

export function CarnationDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', opacity: 0.4 }}>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, var(--carnation))' }} />
      <CarnationSmall style={{ width: 24, height: 24 }} />
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, var(--carnation))' }} />
    </div>
  )
}
