export interface TierDef {
  name: string
  min: number
  max: number
  weight: number
  /** Chance (%) that a roll in this tier shows the real word instead of a scramble. */
  hitChance: number
}

/** Every balance dial lives here so tuning never touches game logic. */
export const BALANCE = {
  /**
   * Hit chance falls with word length, so long words are rare events, not just rare drops.
   * Overall about 1 word per 14 rolls (lucky anagrams included); a Legendary word about 1 per 10,000.
   * History: the plan started at a flat 45%, playtesting cut it to a flat 25%, then it moved to this.
   */
  tiers: [
    { name: 'Common', min: 3, max: 5, weight: 50, hitChance: 8 },
    { name: 'Uncommon', min: 6, max: 7, weight: 28, hitChance: 5 },
    { name: 'Rare', min: 8, max: 9, weight: 14, hitChance: 3 },
    { name: 'Epic', min: 10, max: 11, weight: 6, hitChance: 1.5 },
    { name: 'Legendary', min: 12, max: 15, weight: 2, hitChance: 0.5 },
  ] satisfies TierDef[],
  minWord: 3,
  maxWord: 15,
  /** Share of points for a word someone else found first. */
  rediscoveryShare: 0.2,
  /** Prototype only: % of the dictionary already claimed by simulated players. */
  mockCoverage: 7,
}

function percentParam(name: string): number | null {
  const raw = new URLSearchParams(window.location.search).get(name)
  if (raw === null || raw.trim() === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : null
}

/**
 * Test overrides via query string, e.g. `?hit=100` to always hit (every tier) or
 * `?coverage=60` to make most of the dictionary already claimed.
 */
export const RUNTIME = {
  /** Flat hit chance for every tier, or null to use each tier's own. */
  hitOverride: percentParam('hit'),
  mockCoverage: percentParam('coverage') ?? BALANCE.mockCoverage,
}
