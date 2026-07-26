import { memo, useEffect, useRef } from 'react'
import settings from '@/web/states/settings'
import { useSnapshot } from 'valtio'
import settings from '@/web/states/settings'

/**
 * Starfield canvas background — inspired by Mineradio.
 * Renders a slowly drifting starfield with parallax depth layers.
 * All updates are in a single RAF loop, zero React re-renders.
 */

interface Star {
  x: number
  y: number
  r: number
  opacity: number
  speed: number
  twinkle: number
  twinklePhase: number
}

const STAR_COUNT = 160
const LAYERS = 3

function createStars(w: number, h: number): Star[] {
  const stars: Star[] = []
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.3,
      opacity: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      twinkle: Math.random() * 0.6 + 0.2,
      twinklePhase: Math.random() * Math.PI * 2,
    })
  }
  return stars
}

const StarfieldBackground = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const { enableStarfield } = useSnapshot(settings)
  const initialized = useRef(false)

  useEffect(() => {
    if (!enableStarfield) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let running = true

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // Only recreate stars on first init or if not yet initialized
      if (!initialized.current) {
        starsRef.current = createStars(canvas.width, canvas.height)
        initialized.current = true
      }
    }

    resize()
    window.addEventListener('resize', resize)

    let lastTime = performance.now()

    const render = (now: number) => {
      if (!running) return
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const s of starsRef.current) {
        // Drift downward and slightly right
        s.y += s.speed * dt * 8
        s.x += s.speed * dt * 2

        // Wrap around
        if (s.y > canvas.height + 5) {
          s.y = -5
          s.x = Math.random() * canvas.width
        }
        if (s.x > canvas.width + 5) s.x = -5
        if (s.x < -5) s.x = canvas.width + 5

        // Twinkle
        s.twinklePhase += dt * 2
        const twinkleAlpha = s.opacity * (0.6 + 0.4 * Math.sin(s.twinklePhase * s.twinkle))

        const gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2)
        gradient.addColorStop(0, `rgba(255,255,255,${twinkleAlpha})`)
        gradient.addColorStop(1, 'rgba(255,255,255,0)')

        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.arc(s.x, s.y, s.r * 2, 0, Math.PI * 2)
        ctx.fill()
      }

      animationId = requestAnimationFrame(render)
    }

    animationId = requestAnimationFrame(render)

    return () => {
      running = false
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [enableStarfield])

  if (!enableStarfield) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{ opacity: 0.8 }}
    />
  )
})

StarfieldBackground.displayName = 'StarfieldBackground'
export default StarfieldBackground
