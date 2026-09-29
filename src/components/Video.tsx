import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Dictionary } from '../core/dictionary'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

// Timing (ms): letters cycle for `BASE`, then lock left to right every `STAGGER`, then the miss holds for `HOLD`.
// Close to the game's own fast roll (see useGame.ts), with a slightly longer hold so a miss can be read.
const BASE = 300
const STAGGER = 50
const HOLD = 250
// The Back link fades out after this long without input, so a screen recording stays clean.
const IDLE_MS = 2500
// Tiers 1 to 3 (6 to 11 letters): long enough to fill the screen, short enough to stay legible.
const TIERS = [1, 2, 3]

function shuffle(s: string): string {
  const a = s.split('')
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.join('')
}

/** A scramble that is not a dictionary word, so the animation can never land on a real one. */
function nextMiss(dict: Dictionary): string {
  for (;;) {
    const pool = dict.tierWords[TIERS[Math.floor(Math.random() * TIERS.length)]]
    const word = pool[Math.floor(Math.random() * pool.length)]
    for (let tries = 0; tries < 20; tries++) {
      const letters = shuffle(word)
      if (!dict.set.has(letters)) return letters
    }
  }
}

function Word({ letters, onDone }: { letters: string; onDone: () => void }) {
  const [elapsed, setElapsed] = useState(0)
  const doneRef = useRef(onDone)

  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    const total = BASE + (letters.length - 1) * STAGGER + HOLD
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
  }, [letters])

  return (
    <div className="video-word" style={{ '--n': letters.length } as CSSProperties} aria-hidden="true">
      {letters.split('').map((letter, i) => {
        const locked = elapsed >= BASE + i * STAGGER
        return (
          <span key={i} className="video-letter" style={{ opacity: locked ? 1 : 0.3 }}>
            {locked ? letter : ALPHABET[Math.floor(Math.random() * ALPHABET.length)]}
          </span>
        )
      })}
    </div>
  )
}

/** A blank white screen with letters cycling in the middle, framed 9:16 for TikTok: made to be screen-recorded. */
export function Video({ dict }: { dict: Dictionary | null }) {
  const [letters, setLetters] = useState<string | null>(null)
  const [idle, setIdle] = useState(false)

  useEffect(() => {
    if (dict && letters === null) setLetters(nextMiss(dict))
  }, [dict, letters])

  useEffect(() => {
    let timer = window.setTimeout(() => setIdle(true), IDLE_MS)
    const wake = () => {
      setIdle(false)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setIdle(true), IDLE_MS)
    }
    window.addEventListener('pointermove', wake)
    window.addEventListener('keydown', wake)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pointermove', wake)
      window.removeEventListener('keydown', wake)
    }
  }, [])

  return (
    <div className={idle ? 'video idle' : 'video'}>
      <a className="video-back" href="#/play">
        ← Back
      </a>
      <div className="video-frame">
        {dict && letters !== null && <Word key={letters} letters={letters} onDone={() => setLetters(nextMiss(dict))} />}
      </div>
    </div>
  )
}
