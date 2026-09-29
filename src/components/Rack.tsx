import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { BALANCE } from '../core/config'
import type { Anim } from '../core/game'
import type { Roll } from '../core/roll'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

interface Props {
  roll: Roll
  anim: Anim
  animating: boolean
  onDone: () => void
}

/**
 * Plain letters side by side, no boxes. Mount with a fresh `key` per roll: letters cycle
 * randomly, then lock left to right. Only transform and opacity animate; the size shrinks
 * with word length (see `.rack` in styles.css) so the word always stays on one row.
 */
export function Rack({ roll, anim, animating, onDone }: Props) {
  const [elapsed, setElapsed] = useState(0)
  const doneRef = useRef(onDone)

  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    if (!animating) return
    const total = anim.base + (roll.letters.length - 1) * anim.stagger + anim.hold
    const start = performance.now()
    const id = window.setInterval(() => {
      const t = performance.now() - start
      if (t >= total) {
        window.clearInterval(id)
        doneRef.current()
      } else {
        setElapsed(t)
      }
    }, 30)
    return () => window.clearInterval(id)
  }, [roll, anim, animating])

  const n = roll.letters.length
  const t = animating ? elapsed : Infinity
  const hit = !animating && roll.isWord
  const miss = !animating && !roll.isWord
  const tier = BALANCE.tiers[roll.tier]

  return (
    <>
      <div className="rarity" aria-hidden="true" style={{ opacity: hit ? 1 : 0 }}>
        <div className="dots">
          {BALANCE.tiers.map((_, i) => (
            <span key={i} className={i <= roll.tier ? 'dot on' : 'dot'} />
          ))}
        </div>
        <span className="tier-label">{tier.name}</span>
      </div>
      <div
        className={hit ? 'rack hit' : miss ? 'rack miss' : 'rack'}
        style={{ '--n': n } as CSSProperties}
        aria-hidden="true"
      >
        {roll.letters.split('').map((letter, i) => {
          const locked = t >= anim.base + i * anim.stagger
          const shown = locked ? letter : ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
          return (
            <span
              key={i}
              className="letter"
              style={{ opacity: locked ? 1 : 0.3, transform: `translateY(${locked ? 0 : -4}px)` }}
            >
              {shown}
            </span>
          )
        })}
      </div>
    </>
  )
}
