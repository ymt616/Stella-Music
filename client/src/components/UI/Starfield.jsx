import { useEffect, useRef } from 'react'

export default function Starfield() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animId
    let W = window.innerWidth
    let H = window.innerHeight

    canvas.width = W
    canvas.height = H

    // Generate stars with varied sizes and twinkle speeds
    const NUM_STARS = 200
    const stars = Array.from({ length: NUM_STARS }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,          // radius 0.2–1.6
      opacity: Math.random(),
      speed: Math.random() * 0.008 + 0.002,   // twinkle speed
      phase: Math.random() * Math.PI * 2,     // offset so they don't all pulse together
      color: pickColor(),
    }))

    // A few larger "hero" stars
    const HERO = 12
    const heroStars = Array.from({ length: HERO }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.2 + 1.2,
      opacity: Math.random() * 0.6 + 0.3,
      speed: Math.random() * 0.005 + 0.001,
      phase: Math.random() * Math.PI * 2,
      color: '#fff',
      flare: true,
    }))

    function pickColor() {
      const colors = ['#ffffff', '#f4b8c8', '#ccd6f6', '#b8d4f4', '#fce8ef']
      return colors[Math.floor(Math.random() * colors.length)]
    }

    let t = 0
    function draw() {
      ctx.clearRect(0, 0, W, H)
      t += 1

      const allStars = [...stars, ...heroStars]
      for (const s of allStars) {
        const alpha = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase))
        ctx.save()
        ctx.globalAlpha = alpha

        if (s.flare) {
          // Draw a 4-point star flare
          drawFlare(ctx, s.x, s.y, s.r, alpha)
        } else {
          // Plain circle
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
          ctx.fillStyle = s.color
          ctx.fill()
        }

        ctx.restore()
      }

      animId = requestAnimationFrame(draw)
    }

    function drawFlare(ctx, x, y, r, alpha) {
      // Soft glow
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 4)
      grd.addColorStop(0, `rgba(255,255,255,${alpha * 0.6})`)
      grd.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(x, y, r * 4, 0, Math.PI * 2)
      ctx.fill()

      // 4-spike cross
      ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.9})`
      ctx.lineWidth = r * 0.5
      ctx.lineCap = 'round'

      // Long spike vertical
      ctx.beginPath(); ctx.moveTo(x, y - r * 4); ctx.lineTo(x, y + r * 4); ctx.stroke()
      // Long spike horizontal
      ctx.beginPath(); ctx.moveTo(x - r * 4, y); ctx.lineTo(x + r * 4, y); ctx.stroke()
      // Short diagonal spikes
      ctx.globalAlpha *= 0.4
      ctx.beginPath(); ctx.moveTo(x - r * 2, y - r * 2); ctx.lineTo(x + r * 2, y + r * 2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x + r * 2, y - r * 2); ctx.lineTo(x - r * 2, y + r * 2); ctx.stroke()

      // Center dot
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(x, y, r * 0.7, 0, Math.PI * 2)
      ctx.fill()
    }

    draw()

    const onResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
      // Reposition stars that are off-screen
      for (const s of [...stars, ...heroStars]) {
        if (s.x > W) s.x = Math.random() * W
        if (s.y > H) s.y = Math.random() * H
      }
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  )
}
