import { BALANCE } from './config'

export interface Dictionary {
  /** Every playable word, sorted. */
  words: string[]
  set: Set<string>
  /** Words grouped by tier index (same order as BALANCE.tiers). */
  tierWords: string[][]
}

export function buildDictionary(raw: string): Dictionary {
  const set = new Set<string>()
  const words: string[] = []
  const tierWords: string[][] = BALANCE.tiers.map(() => [])

  for (const line of raw.split('\n')) {
    const w = line.trim().toLowerCase()
    if (w.length < BALANCE.minWord || w.length > BALANCE.maxWord) continue
    if (!/^[a-z]+$/.test(w) || set.has(w)) continue
    set.add(w)
    words.push(w)
    const t = BALANCE.tiers.findIndex((tier) => w.length >= tier.min && w.length <= tier.max)
    if (t >= 0) tierWords[t].push(w)
  }

  const empty = tierWords.findIndex((pool) => pool.length === 0)
  if (empty >= 0) throw new Error(`Word list has no words for tier "${BALANCE.tiers[empty].name}"`)
  return { words, set, tierWords }
}
