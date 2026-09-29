// Filters an ENABLE word list (one word per line) to 3-15 letters and writes src/data/words.txt.
// Usage: npm run words -- path/to/enable1.txt
import { readFileSync, writeFileSync } from 'node:fs'

const src = process.argv[2]
if (!src) {
  console.error('Usage: npm run words -- path/to/enable1.txt')
  process.exit(1)
}

const tiers = [[3, 5], [6, 7], [8, 9], [10, 11], [12, 15]]
const words = [...new Set(
  readFileSync(src, 'utf8')
    .split(/\r?\n/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => /^[a-z]+$/.test(w) && w.length >= 3 && w.length <= 15)
)].sort()

writeFileSync(new URL('../src/data/words.txt', import.meta.url), words.join('\n') + '\n')
console.log(`${words.length} words`)
for (const [min, max] of tiers) {
  console.log(`  ${min}-${max}: ${words.filter((w) => w.length >= min && w.length <= max).length}`)
}
