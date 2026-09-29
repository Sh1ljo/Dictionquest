import { BALANCE } from './config'
import type { Dictionary } from './dictionary'

export interface Roll {
  /** Letters shown on the rack: the word itself on a hit, a scramble otherwise. */
  letters: string
  tier: number
  /** Judged against the dictionary, so a lucky anagram counts as a word. */
  isWord: boolean
}

export function points(word: string): number {
  return word.length * word.length
}

export function rediscoveryPoints(word: string): number {
  return Math.round(points(word) * BALANCE.rediscoveryShare)
}

function shuffle(s: string): string {
  const a = s.split('')
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.join('')
}

function pickTier(): number {
  const total = BALANCE.tiers.reduce((sum, t) => sum + t.weight, 0)
  let r = Math.random() * total
  for (let i = 0; i < BALANCE.tiers.length; i++) {
    r -= BALANCE.tiers[i].weight
    if (r < 0) return i
  }
  return 0
}

/**
 * One click: pick a tier by weight, a word from it, then hit (the word) or miss (scrambled).
 * The hit chance is the tier's own unless `hitOverride` (a test override) is set.
 */
export function roll(dict: Dictionary, hitOverride: number | null): Roll {
  const tier = pickTier()
  const pool = dict.tierWords[tier]
  const word = pool[Math.floor(Math.random() * pool.length)]
  const hitChance = hitOverride ?? BALANCE.tiers[tier].hitChance
  let letters = word
  if (Math.random() * 100 >= hitChance) {
    letters = shuffle(word)
    for (let tries = 0; tries < 8 && letters === word; tries++) letters = shuffle(word)
  }
  return { letters, tier, isWord: dict.set.has(letters) }
}
