export interface Profile {
  name: string
  /** ISO 3166-1 alpha-2 code, or '' when not set. */
  country: string
  avatar: string
}

export type Ownership = 'first' | 're'

export interface SavedGame {
  profile: Profile
  owned: Record<string, Ownership>
  pts: number
  firsts: number
  rolls: number
}

/** The guest game (nobody signed in). */
export const GUEST_KEY = 'dq:v1'
const SESSION_KEY = 'dq:session'
export const NAME_MIN = 2
export const NAME_MAX = 16
export const DEFAULT_AVATAR = 'cat'

export const EMPTY_SAVE: SavedGame = {
  profile: { name: '', country: '', avatar: DEFAULT_AVATAR },
  owned: {},
  pts: 0,
  firsts: 0,
  rolls: 0,
}

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g

export function cleanName(raw: string): string {
  return raw.replace(CONTROL_CHARS, '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX)
}

/** Returns an error message, or null when the name is acceptable. */
export function validateName(raw: string): string | null {
  return cleanName(raw).length < NAME_MIN ? `Enter a name of at least ${NAME_MIN} characters.` : null
}

export function toSave(s: SavedGame): SavedGame {
  return { profile: s.profile, owned: s.owned, pts: s.pts, firsts: s.firsts, rolls: s.rolls }
}

function count(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

const slotKey = (email: string | null) => (email ? `dq:acct:${email}` : GUEST_KEY)

function parseSave(raw: string): SavedGame {
  const d = JSON.parse(raw) as Partial<SavedGame> & { name?: unknown }
  const p = (d.profile ?? {}) as Partial<Profile>
  const owned: Record<string, Ownership> = {}
  if (d.owned && typeof d.owned === 'object') {
    for (const [w, v] of Object.entries(d.owned)) {
      if (v === 'first' || v === 're') owned[w] = v
    }
  }
  return {
    profile: {
      name: cleanName(String(p.name ?? d.name ?? '')),
      country: /^[A-Z]{2}$/.test(String(p.country ?? '')) ? String(p.country) : '',
      avatar: String(p.avatar || DEFAULT_AVATAR),
    },
    owned,
    pts: count(d.pts),
    firsts: count(d.firsts),
    rolls: count(d.rolls),
  }
}

export interface LoadResult {
  save: SavedGame
  /** False when localStorage is unavailable, so progress cannot persist. */
  storageOk: boolean
}

/** Loads the guest game (email null) or a signed-in account's game. */
export function loadGame(email: string | null): LoadResult {
  try {
    localStorage.setItem('dq:probe', '1')
    localStorage.removeItem('dq:probe')
    const raw = localStorage.getItem(slotKey(email))
    return { save: raw ? parseSave(raw) : EMPTY_SAVE, storageOk: true }
  } catch (err) {
    console.error('Dictionquest: could not read saved progress', err)
    return { save: EMPTY_SAVE, storageOk: false }
  }
}

/** Returns false when the write failed. */
export function saveGame(save: SavedGame, email: string | null): boolean {
  try {
    localStorage.setItem(slotKey(email), JSON.stringify(save))
    return true
  } catch (err) {
    console.error('Dictionquest: could not save progress', err)
    return false
  }
}

/** Throws when the stored record cannot be read, so callers never mistake damage for "no account". */
export function readAccount(email: string): SavedGame | null {
  const raw = localStorage.getItem(slotKey(email))
  return raw ? parseSave(raw) : null
}

export function clearGuest(): void {
  localStorage.removeItem(GUEST_KEY)
}

export function loadSession(): string | null {
  try {
    const email = localStorage.getItem(SESSION_KEY)
    return email && email.includes('@') ? email : null
  } catch {
    return null
  }
}

export function saveSession(email: string | null): void {
  if (email) localStorage.setItem(SESSION_KEY, email)
  else localStorage.removeItem(SESSION_KEY)
}
