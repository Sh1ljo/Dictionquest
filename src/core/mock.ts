/**
 * Prototype-only "other players". There is no backend yet, so a fixed slice of the
 * dictionary is deterministically attributed to simulated players. The leaderboard
 * counts come from the same attribution, so the Dictionary and Leaderboard agree.
 * Replace this module with a real service when the backend exists.
 */
export interface MockPlayer {
  name: string
  country: string
  avatar: string
}

export const MOCK_PLAYERS: MockPlayer[] = [
  { name: 'nova', country: 'US', avatar: 'owl' },
  { name: 'kestrel', country: 'GB', avatar: 'fox' },
  { name: 'mira_k', country: 'HR', avatar: 'cat' },
  { name: 'oskar', country: 'SE', avatar: 'bear' },
  { name: 'lumen', country: 'FR', avatar: 'moon' },
  { name: 'fenn', country: 'IE', avatar: 'frog' },
  { name: 'tavi', country: 'EE', avatar: 'robot' },
  { name: 'juno', country: 'BR', avatar: 'sun' },
  { name: 'rook', country: 'CA', avatar: 'ghost' },
  { name: 'sable', country: 'AU', avatar: 'rabbit' },
  { name: 'ivo', country: 'PT', avatar: 'alien' },
  { name: 'petra', country: 'CZ', avatar: 'cactus' },
  { name: 'quill', country: 'NZ', avatar: 'owl' },
  { name: 'dax', country: 'IN', avatar: 'robot' },
  { name: 'wren', country: 'NL', avatar: 'cat' },
  { name: 'lior', country: 'IL', avatar: 'fox' },
  { name: 'zed', country: 'ZA', avatar: 'alien' },
  { name: 'maren', country: 'DE', avatar: 'moon' },
  { name: 'bruno', country: 'IT', avatar: 'bear' },
  { name: 'echo', country: 'KR', avatar: 'ghost' },
  { name: 'halo', country: 'PL', avatar: 'sun' },
  { name: 'ines', country: 'ES', avatar: 'rabbit' },
  { name: 'koa', country: 'MX', avatar: 'frog' },
  { name: 'vera', country: 'AT', avatar: 'cactus' },
  { name: 'tomo', country: 'JP', avatar: 'cat' },
]

/** Geometric decay gives a long ladder with a few leaders and a climbable bottom. */
const DECAY = 0.82

function hash(word: string, salt: string): number {
  let h = 2166136261
  const s = salt + word
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export interface MockWorld {
  /** Has a simulated player already found this word first? */
  claimed(word: string): boolean
  /** Name of the simulated finder, or null when unclaimed. */
  finder(word: string): string | null
  /** Words found first by each simulated player (same order as MOCK_PLAYERS). */
  counts: number[]
  claimedCount: number
}

export function buildMockWorld(words: string[], coveragePct: number): MockWorld {
  const weights = MOCK_PLAYERS.map((_, i) => DECAY ** i)
  const sum = weights.reduce((a, b) => a + b, 0)
  const cumulative: number[] = []
  let acc = 0
  weights.forEach((w, i) => {
    acc += w / sum
    cumulative[i] = acc
  })

  const claimedBy = new Map<string, number>()
  const counts = MOCK_PLAYERS.map(() => 0)

  for (const word of words) {
    if (hash(word, 'c') % 1000 >= coveragePct * 10) continue
    const u = hash(word, 'f') / 2 ** 32
    let idx = cumulative.findIndex((c) => u < c)
    if (idx < 0) idx = MOCK_PLAYERS.length - 1
    claimedBy.set(word, idx)
    counts[idx]++
  }

  return {
    claimed: (word) => claimedBy.has(word),
    finder: (word) => {
      const idx = claimedBy.get(word)
      return idx === undefined ? null : MOCK_PLAYERS[idx].name
    },
    counts,
    claimedCount: claimedBy.size,
  }
}
