import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, exchangeCode } from '../context/AuthContext'

export default function Callback() {
  const navigate = useNavigate()
  const { setTokens } = useAuth()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    // Clear URL so refresh doesn't re-use the code
    window.history.replaceState({}, '', '/callback')

    if (!code) {
      navigate('/')
      return
    }

    console.log('Got code, exchanging...')
    exchangeCode(code)
      .then(data => {
        console.log('Token response:', data)
        if (data.access_token) {
          setTokens(data.access_token, data.refresh_token, data.expires_in)
          navigate('/')
        } else {
          console.error('No access token:', data)
          navigate('/')
        }
      })
      .catch(err => {
        console.error('Exchange failed:', err)
        navigate('/')
      })
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#07071a', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid #ffb6c1', borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#8892b0', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
        Connecting to Spotify...
      </p>
    </div>
  )
}
