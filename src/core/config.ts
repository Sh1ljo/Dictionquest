export interface TierDef {
  name: string
  min: number
  max: number
  weight: number
}

/** Every balance dial lives here so tuning never touches game logic. */
export const BALANCE = {
  tiers: [
    { name: 'Common', min: 3, max: 5, weight: 50 },
    { name: 'Uncommon', min: 6, max: 7, weight: 28 },
    { name: 'Rare', min: 8, max: 9, weight: 14 },
    { name: 'Epic', min: 10, max: 11, weight: 6 },
    { name: 'Legendary', min: 12, max: 15, weight: 2 },
  ] satisfies TierDef[],
  /**
   * Chance (%) that a roll shows the real word instead of a scramble.
   * The plan started at 45; playtesting showed that was too generous, so it is 25 now.
   */
  hitChance: 25,
  minWord: 3,
  maxWord: 15,
  /** Share of points for a word someone else found first. */
  rediscoveryShare: 0.2,
  /** Prototype only: % of the dictionary already claimed by simulated players. */
  mockCoverage: 7,
}

function percentParam(name: string, fallback: number): number {
  const raw = new URLSearchParams(window.location.search).get(name)
  if (raw === null || raw.trim() === '') return fallback
  const n = Number(raw)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fallback
}

/**
 * Test overrides via query string, e.g. `?hit=100` to always hit or
 * `?coverage=60` to make most of the dictionary already claimed.
 */
export const RUNTIME = {
  hitChance: percentParam('hit', BALANCE.hitChance),
  mockCoverage: percentParam('coverage', BALANCE.mockCoverage),
}
