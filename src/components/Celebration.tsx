import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  /** The found word; its letters are among the debris. */
  word: string
  tier: number
  /** The element the burst comes out of (the rack). */
  origin: HTMLElement | null
}

type Kind = 'dot' | 'box' | 'glyph'

interface Particle {
  kind: Kind
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  spin: number
  size: number
  glyph: string
  born: number
  life: number
}

interface Ring {
  at: number
  duration: number
  maxR: number
  width: number
}

/** Per second: velocity is px/s, gravity px/s². */
const GRAVITY = 1400
const DRAG = 1.6
/** When the ink band has covered the word (see `.rack-ink` in styles.css). */
const BURST_AT = 600

function inkColor(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#0a0a0a'
}

function spawn(out: Particle[], word: string, box: DOMRect, count: number, at: number, power: number) {
  const kinds: Kind[] = ['dot', 'dot', 'box', 'glyph']
  for (let i = 0; i < count; i++) {
    const kind = kinds[Math.floor(Math.random() * kinds.length)]
    // Up and outwards, never straight down.
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5
    const speed = (380 + Math.random() * 620) * power
    out.push({
      kind,
      x: box.left + Math.random() * box.width,
      y: box.top + box.height * (0.3 + Math.random() * 0.4),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 14,
      size: kind === 'glyph' ? 13 + Math.random() * 12 : 4 + Math.random() * 5,
      glyph: word[Math.floor(Math.random() * word.length)].toUpperCase(),
      born: at + Math.random() * 60,
      life: 1000 + Math.random() * 700,
    })
  }
}

/**
 * The first-find burst: shockwave rings, then a spray of rarity dots and the word's own
 * letters that arc and fall. Drawn on one fixed canvas so it can spill past the stage.
 * Rarer tiers throw more and, from Epic up, a second wave. The CSS half (ink band,
 * letter wave, stamp, shake) lives in styles.css under "celebration".
 */
export function Celebration({ word, tier, origin }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !origin) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const ink = inkColor()
    const mono = getComputedStyle(document.documentElement).getPropertyValue('--mono').trim() || 'monospace'
    const box = origin.getBoundingClientRect()
    const cx = box.left + box.width / 2
    const cy = box.top + box.height / 2
    const reach = Math.max(window.innerWidth, 480) * 0.6

    const particles: Particle[] = []
    spawn(particles, word, box, 34 + tier * 16, BURST_AT, 1)
    if (tier >= 3) spawn(particles, word, box, 18 + tier * 8, BURST_AT + 650, 0.8)

    const rings: Ring[] = [
      { at: BURST_AT - 40, duration: 720, maxR: reach, width: 3 },
      { at: BURST_AT + 90, duration: 820, maxR: reach * 0.8, width: 2 },
      { at: BURST_AT + 220, duration: 900, maxR: reach * 0.6, width: 1.5 },
    ]
    if (tier >= 3) rings.push({ at: BURST_AT + 650, duration: 1000, maxR: reach * 1.1, width: 4 })

    const start = performance.now()
    let last = start
    let frame = 0

    const draw = (now: number) => {
      const t = now - start
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      ctx.fillStyle = ink
      ctx.strokeStyle = ink
      let alive = false

      for (const r of rings) {
        const k = (t - r.at) / r.duration
        if (k < 0) {
          alive = true
          continue
        }
        if (k >= 1) continue
        alive = true
        const e = 1 - (1 - k) ** 3
        ctx.globalAlpha = (1 - k) ** 1.5
        ctx.lineWidth = r.width * (1 - k * 0.7)
        ctx.beginPath()
        // Squashed so it reads as a ripple across the page, not a bubble.
        ctx.ellipse(cx, cy, r.maxR * e, r.maxR * e * 0.62, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.font = `700 16px ${mono}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const p of particles) {
        const age = t - p.born
        if (age < 0) {
          alive = true
          continue
        }
        if (age > p.life) continue
        alive = true
        p.vx -= p.vx * DRAG * dt
        p.vy += GRAVITY * dt - p.vy * DRAG * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.spin * dt
        const k = age / p.life
        ctx.globalAlpha = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        if (p.kind === 'dot') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        } else if (p.kind === 'box') {
          ctx.lineWidth = 1.5
          ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size)
        } else {
          ctx.scale(p.size / 16, p.size / 16)
          ctx.fillText(p.glyph, 0, 0)
        }
        ctx.restore()
      }

      ctx.globalAlpha = 1
      if (alive) frame = requestAnimationFrame(draw)
      else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    }
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [word, tier, origin])

  // Portalled to <body>: the stage's shake transform and container query would otherwise
  // trap this fixed canvas inside the stage.
  return createPortal(<canvas ref={ref} className="celebration" aria-hidden="true" />, document.body)
}
