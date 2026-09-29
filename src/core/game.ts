import { points, rediscoveryPoints, type Roll } from './roll'
import { EMPTY_SAVE, type Ownership, type Profile, type SavedGame } from './store'

export interface Anim {
  /** ms letters cycle randomly before the first one locks. */
  base: number
  /** ms between each letter locking. */
  stagger: number
  /** ms the finished word is held before the roll counts and the next one is allowed. */
  hold: number
}

export type Feedback =
  | { kind: 'miss' }
  | { kind: 'dup'; word: string }
  | { kind: 'first' | 're'; word: string; pts: number }

export interface GameState extends SavedGame {
  rack: Roll | null
  /** A roll still being revealed; it is claimed when the reveal ends or is skipped. */
  pending: Roll | null
  anim: Anim
  fb: Feedback | null
  /** A first find is being celebrated; cleared by 'celebrated' once the animation's time is up. */
  celebrate: boolean
}

type Claimed = (word: string) => boolean

export type Action =
  | { type: 'roll'; roll: Roll; anim: Anim }
  | { type: 'settle'; claimed: Claimed }
  | { type: 'celebrated' }
  | { type: 'profile'; patch: Partial<Profile> }
  | { type: 'load'; save: SavedGame }
  | { type: 'reset' }

export const NO_ANIM: Anim = { base: 0, stagger: 0, hold: 0 }

/** How long a first-find celebration runs; rarer tiers linger longer. */
export function celebrationMs(tier: number): number {
  return 2000 + tier * 200
}

export function initGame(save: SavedGame): GameState {
  return { ...save, rack: null, pending: null, anim: NO_ANIM, fb: null, celebrate: false }
}

function settle(s: GameState, claimed: Claimed): GameState {
  const p = s.pending
  if (!p) return s
  const done = { ...s, pending: null }
  if (!p.isWord) return { ...done, fb: { kind: 'miss' } }

  const word = p.letters
  if (s.owned[word]) return { ...done, fb: { kind: 'dup', word } }

  const first = !claimed(word)
  const pts = first ? points(word) : rediscoveryPoints(word)
  const kind: Ownership = first ? 'first' : 're'
  return {
    ...done,
    owned: { ...s.owned, [word]: kind },
    pts: s.pts + pts,
    firsts: s.firsts + (first ? 1 : 0),
    fb: { kind, word, pts },
    celebrate: first,
  }
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'roll':
      // No rolling while a reveal is running: it must finish (and be claimed) first.
      // A celebration is not a lock: rolling during one skips it (celebrate is cleared below).
      if (state.pending) return state
      return {
        ...state,
        rack: action.roll,
        pending: action.roll,
        anim: action.anim,
        fb: null,
        celebrate: false,
        rolls: state.rolls + 1,
      }
    case 'settle':
      return settle(state, action.claimed)
    case 'celebrated':
      return state.celebrate ? { ...state, celebrate: false } : state
    case 'profile':
      return { ...state, profile: { ...state.profile, ...action.patch } }
    case 'load':
      return initGame(action.save)
    case 'reset':
      return initGame({ ...EMPTY_SAVE, profile: state.profile })
    default:
      return state
  }
}
