import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { BALANCE, RUNTIME } from '../core/config'
import { normalizeEmail } from '../core/auth'
import { celebrationMs, initGame, reducer, type Anim } from '../core/game'
import { roll } from '../core/roll'
import {
  clearGuest,
  cleanName,
  loadGame,
  loadSession,
  readAccount,
  saveGame,
  saveSession,
  toSave,
  type Profile,
} from '../core/store'
import type { GameData } from './useDictionary'

const never = () => false

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export type SignInResult = { kind: 'created' } | { kind: 'restored'; words: number }

export function useGame(data: GameData | null) {
  const [session] = useState(loadSession)
  const [email, setEmail] = useState<string | null>(session)
  const [loaded] = useState(() => loadGame(session))
  const [state, dispatch] = useReducer(reducer, loaded.save, initGame)
  const [saveFailed, setSaveFailed] = useState(!loaded.storageOk)
  const stateRef = useRef(state)

  const { profile, owned, pts, firsts, rolls } = state
  useEffect(() => {
    stateRef.current = state
  }, [state])
  useEffect(() => {
    setSaveFailed(!saveGame({ profile, owned, pts, firsts, rolls }, email))
  }, [profile, owned, pts, firsts, rolls, email])

  const claimed = data ? data.world.claimed : never

  const generate = useCallback(() => {
    if (!data) return
    const r = roll(data.dict, RUNTIME.hitOverride)
    const legendary = r.isWord && r.tier === BALANCE.tiers.length - 1
    // Reduced motion: no cycling, but a short hold so rolls are still paced like everyone else's.
    const anim: Anim = prefersReducedMotion()
      ? { base: 0, stagger: 0, hold: 250 }
      : legendary
        ? { base: 700, stagger: 70, hold: 150 }
        : { base: 350, stagger: 45, hold: 120 }
    dispatch({ type: 'roll', roll: r, anim })
  }, [data])

  const settle = useCallback(() => dispatch({ type: 'settle', claimed }), [claimed])

  // The celebration's clock lives here, not in the view, so leaving the Play tab mid-animation
  // still ends it (and lets the name prompt appear). Reduced motion skips it.
  const { celebrate, rack } = state
  useEffect(() => {
    if (!celebrate) return
    const ms = prefersReducedMotion() ? 0 : celebrationMs(rack?.tier ?? 0)
    const id = window.setTimeout(() => dispatch({ type: 'celebrated' }), ms)
    return () => window.clearTimeout(id)
  }, [celebrate, rack])

  const saveProfile = useCallback((patch: Partial<Profile>) => {
    const next = { ...patch }
    if (next.name !== undefined) next.name = cleanName(next.name)
    dispatch({ type: 'profile', patch: next })
  }, [])

  const reset = useCallback(() => dispatch({ type: 'reset' }), [])

  /**
   * Signing in to a new email adopts the current game as that account's game.
   * Signing in to a known email switches to its saved game; the guest game is left
   * untouched and comes back on sign-out. Throws if storage fails, so nothing is lost silently.
   */
  const signIn = useCallback((raw: string): SignInResult => {
    const addr = normalizeEmail(raw)
    const existing = readAccount(addr)
    let result: SignInResult
    if (existing) {
      dispatch({ type: 'load', save: existing })
      result = { kind: 'restored', words: Object.keys(existing.owned).length }
    } else {
      if (!saveGame(toSave(stateRef.current), addr)) {
        throw new Error('Could not create the account: browser storage is unavailable.')
      }
      clearGuest()
      result = { kind: 'created' }
    }
    saveSession(addr)
    setEmail(addr)
    return result
  }, [])

  const signOut = useCallback(() => {
    saveSession(null)
    dispatch({ type: 'load', save: loadGame(null).save })
    setEmail(null)
  }, [])

  return { state, email, saveFailed, generate, settle, saveProfile, reset, signIn, signOut }
}

export type Game = ReturnType<typeof useGame>
