# Dictionquest: Build Plan v2

Sep 29, 2026 · @Gabriel Šiljevinac

## What changed since v1

Dictionquest is now a pure luck game: one Generate button, no typing, no unscramble step. Each click rolls either a real word (claimed automatically) or the same letters scrambled as a near miss. The Vite + React + TS build below covers that game only.

| Area | v1 plan | v2 plan |
| --- | --- | --- |
| Core loop | Rack with filler letters, player unscrambles and types | Click, roll, auto-claim |
| Input | Typing or tapping tiles | One button |
| Bot threat | Anagram solvers, so energy, App Check, claim caps | Autoclickers, so rate limits and energy carry the whole economy |
| Collection | Unfound words masked | Whole dictionary, searchable, finder shown per word |
| Identity | Anonymous auth, optional sign-in | Guest name prompt on first find, sign-in upgrade later |
| Look | Dark default, rarity colors | White, black text, black button; rarity shown by dots and label |
| Rack | Anchor plus 0-4 filler letters | The word's own letters, always one row |

## Game rules

One click is one roll. The server picks a tier by weight, then a random real word from that tier. With probability H (the hit chance, 45% to start) the player gets the word itself; otherwise the same letters, scrambled. The result is always judged against the dictionary, so a scramble that happens to be a word counts as a hit.

A hit is claimed automatically. A first find scores length² points and credits the player's name globally. A rediscovery (someone else found it first) scores 20% and goes to the personal collection only. A duplicate (the player already owns it) scores nothing. The rack is the word's letters in a single row, 3 to 15 tiles.

| Tier | Word length | Drop weight | Words in ENABLE |
| --- | --- | --- | --- |
| Common | 3-5 | 50% | 13,511 |
| Uncommon | 6-7 | 28% | 38,341 |
| Rare | 8-9 | 14% | 53,293 |
| Epic | 10-11 | 6% | 35,806 |
| Legendary | 12-15 | 2% | 27,504 |

The dictionary is ENABLE filtered to 3-15 letters: 168,455 words, not the \~170k in v1. Ranking is by words collected, ties to whoever reached the count first; a points toggle comes later.

## Odds and balance

The odds are two dials, tier weights and hit chance, and the real balance risk is first-find scarcity, not difficulty. Tiers are uneven: Common holds 8% of the dictionary but takes 50% of drops, so each Common word appears about 30 times as often as each Legendary word.

At a 45% hit chance the community needs roughly 570,000 rolls to fill Common and about 31 million to fill Legendary (uniform picks: size ÷ (weight × H) × ln size). Legendary will effectively never complete, which is the intent. Common is the opposite: it will fill within months of real traffic, after which every Common hit is a 20% rediscovery. That is where players will feel the game go flat.

Duplicates are a smaller problem than I said earlier. A player's dupe rate in a tier equals the share of that tier they already own, so it only bites after tens of thousands of rolls (about 41,000 to own half of Common). A cheap fix is ready when telemetry asks for it: on a hit, reroll once if the player owns the word, which turns dupe rate p into p².

The hit chance and every weight live in one balance config, so tuning never needs a redeploy. Phase 3 adds a simulator that plays N players for M days and reports words per player, first finds left per tier and dupe rate.

## Screens

Two screens and one prompt, all white with black text and a single black button.

**Play.** Header (wordmark, name button, Dictionary), then the community counter with a thin progress bar and a one-line stats row (rolls, words, points). The result stage holds five rarity dots with a tier label, the rack in one row, and the outcome line: word and points, a black "First find" pill, "Rediscovery · 20% points", "Already in your collection", or "No word." The Generate button sits below. The name form appears under it after a first find while the player has no name, and can be dismissed with "Not now".

**Dictionary.** Search box (matches anywhere in the word), filters All, Found, Unfound and Mine, a match count, and a virtualised list of 48 px rows: word on the left, finder on the right, a black square for words in your collection. Unclaimed words say so.

**Motion.** Tiles cycle random letters for 600 ms, then lock left to right at 70 ms each. A hit flips the tiles to black. Legendary hits reveal over about 1.1 s with a 110 ms stagger. A click during the reveal skips it and rolls again. Reduced-motion skips all of it. Only transform and opacity animate.

**Rack fit.** Tiles always stay in one row and shrink with word length (26 px type up to 9 letters, 16 px at 14-15). Targets are at least 44 px high, results are announced through an aria-live region, and focus rings are always visible.
