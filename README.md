# Dictionquest

One button, pure luck. Each click rolls either a real English word or the same letters scrambled. Real words are claimed automatically; the whole dictionary (168,455 words) is the collection, and the community is trying to find all of it.

**Status: prototype v0.1.** It runs entirely in the browser with a simulated world of other players. See [Prototype limits](#prototype-limits).

Built with Vite, React and TypeScript from the sketch (`Dictionquest – Play.html`) and the plan (`Dictionquest Build Plan v2.md`), both kept in this repo. The plan for guest users and bots is in `Dictionquest Guest and Bot Plan.md`.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the printed URL. The dev server also listens on your local network, so you can open it from a phone on the same Wi-Fi.

Other scripts: `npm run build` (type-check and production build into `dist/`) and `npm run preview` (serve that build).

## Deploy to Vercel

Push the repository and import it at vercel.com/new. Vercel detects Vite on its own: build command `npm run build`, output directory `dist`. No environment variables are needed. From the command line, `npx vercel` creates a preview and `npx vercel --prod` a production deployment.

## Game rules

- One click is one roll. A tier is picked by weight, then a random real word from it. With the tier's hit chance you get the word; otherwise the same letters, scrambled. The result is always judged against the dictionary, so a scramble that happens to be a word counts as a hit.
- A **first find** scores length² points and credits your name. A **rediscovery** (someone else found it first) scores 20%. A **duplicate** scores nothing.
- Ranking is by words collected; ties go to whoever reached the count first.

| Tier | Word length | Drop weight | Hit chance | About 1 word per |
| --- | --- | --- | --- | --- |
| Common | 3-5 | 50% | 8% | 19 rolls |
| Uncommon | 6-7 | 28% | 5% | 71 rolls |
| Rare | 8-9 | 14% | 3% | 240 rolls |
| Epic | 10-11 | 6% | 1.5% | 1,100 rolls |
| Legendary | 12-15 | 2% | 0.5% | 10,000 rolls |

Overall about 1 word per 14 rolls. Common includes scrambles that happen to be words (about 3% of short scrambles). The plan started at a flat 45% hit chance; playtesting cut it to a flat 25%, and it is now scaled by tier so long words are genuinely rare.

## What is in the prototype

- **Play**: a fast letter-by-letter reveal (about 0.7 s), plain letters with no boxes that shrink so long words stay on one row, and reduced-motion support. Rolls are one at a time: Generate is locked until the current word has finished revealing. A first find gets a 2-3 second celebration (ink band over the word, a burst of dots and letters, shockwave rings, a stamped "First find"), longer and bigger for rarer tiers. Generate skips it and rolls again (without a name, it skips straight to the name prompt); reduced motion skips it entirely.
- **Dictionary**: virtualised list with search, All / Found / Unfound / Mine filters, and the finder shown per word.
- **Leaderboard**: Global or one country, your rank on that board and how many words you need to pass the next player.
- **Name required**: the first time you find a word first, once the celebration ends, a blocking dialog asks for a name (2-16 characters). It cannot be skipped, and a profile cannot be saved without one.
- **Profile**: display name, country and 12 sample avatars. Progress reset lives here too.
- **Simulated sign-in** (Profile, "Save your progress"): enter an email, then the 6-digit code, which is shown on screen because no email is sent yet. A new email adopts your current guest game; a known email restores its saved game and leaves the guest game untouched until you sign out.
- **Mobile first**: bottom tab bar, 44 px+ touch targets, safe-area insets, 16 px inputs (no iOS zoom), one-row word down to 320 px wide.

## Prototype limits

- **Other players are simulated.** A fixed 7% of the dictionary is deterministically attributed to 61 fake players (four each in 12 countries, one each in 13 more), and the leaderboard is computed from that same attribution. Only you are real. Your progress lives in `localStorage`, so two browsers are two separate players.
- **Rolls happen in the browser**, so they can be tampered with. The plan's server-side roll, rate limits and energy replace this later.
- **Sign-in is simulated.** "Accounts" are records in this browser's `localStorage`: not real, not secure, and not synced across devices.
- Names are not checked for uniqueness or profanity.

## Project layout

```
src/core/         rules, no UI: config (all balance dials), roll, game reducer, storage
  mock.ts         the simulated world of other players (replace with a backend)
  auth.ts         the simulated email sign-in (replace with real auth)
src/hooks/        game state, dictionary loading, hash routing
src/components/   Play, Rack, Dictionary, Leaderboard, Profile, Account, NameGate
src/data/         ENABLE word list, countries, the 12 avatars
scripts/          build-words.mjs regenerates the word list
```

## Test overrides

Append to the URL:

| Param | Effect |
| --- | --- |
| `?hit=100` | Every roll is a real word; any value sets one hit chance for every tier (default: per tier) |
| `?coverage=60` | 60% of the dictionary is already claimed by others (default 7), so rediscoveries are common |

## Word list

`src/data/words.txt` is the public-domain ENABLE list filtered to 3-15 letters. To regenerate it: `npm run words -- path/to/enable1.txt`.

## Next steps

1. A backend for shared state: server-side rolls, real accounts and a real leaderboard (Supabase or Upstash Redis on Vercel are the candidates).
2. Real email sign-in in place of the simulated one.
3. Rate limits and energy against autoclickers, as described in the plan.
4. The balance simulator from the plan.
