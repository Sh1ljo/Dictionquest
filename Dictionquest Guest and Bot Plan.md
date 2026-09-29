# Dictionquest: Guest Users and Bots

Status: proposal, not built. Written 2026-09-29, after the move to per-tier hit chances.

This is deliberately deferred while the core game is still being found. It records the direction so the backend is designed for it from the start.

## The problem

Dictionquest is one button and pure luck. The only lever a player has is volume: more rolls, more words. That makes autoclickers and scripts the main threat, and it gets worse as the game gets harder. Lower odds mean more rolls per word, which makes automation more valuable, not less.

Today nothing can be enforced:

- Rolls happen in the browser (`src/core/roll.ts`), so results can be forged.
- Progress lives in `localStorage` (`src/core/store.ts`), so it can be edited.
- Sign-in is simulated (`src/core/auth.ts`).

No guest policy means anything until the points below exist.

## 1. Rolls move to the server (prerequisite)

- The client asks for a roll; the server picks the tier, the word and hit or miss, judges it against the dictionary and records the claim atomically.
- The client only animates the result it is given.
- The balance config (`BALANCE` in `src/core/config.ts`) moves server-side so it can be tuned without a deploy.

## 2. Guests collect, members claim

| | Guest | Signed-in member |
| --- | --- | --- |
| Play (one click, no sign-up) | Yes | Yes |
| Personal collection | Yes, tied to an anonymous server session | Yes |
| First-find credit in the global Dictionary | No: the word stays unclaimed | Yes |
| Leaderboard (global and country) | No | Yes |
| Daily roll budget | Small | Larger |

- A guest hit on an unclaimed word shows "You found an unclaimed word. Sign in to claim it." This is the main reason to sign up, and it replaces today's name prompt after a first find (`NameGate`).
- Anonymous bots then cannot take words away from real players, because only verified accounts can claim.
- On sign-in, the guest collection merges into the account as rediscoveries. It does not receive retroactive first-find credit; otherwise a bot farm could collect as guests and claim in bulk later.
- Open question: whether a guest's unclaimed find is held for a short window (for example 10 minutes) so they can sign in and still claim it. This improves conversion, but a held word needs an expiry and a per-session cap on holds.

## 3. Limits

- **Daily roll budget (energy)** per account, smaller for guests. This is the real anti-bot measure, and it also changes what "harder" means: each roll becomes valuable, instead of the player just clicking faster.
- **Rate limits** per account, per anonymous session and per IP address, at a speed no human reaches (the reveal already takes about 0.7 s a roll).
- **Bot check at sign-up** (for example Cloudflare Turnstile), and again when an account's roll pattern looks automated.
- **Verified email** for membership, one account per address.

## 4. Later, if needed

- Flag accounts whose timing is too regular and review them before their claims count.
- Unique display names and a profanity filter (currently neither is checked).

## Order of work

1. Server-side rolls and claims, with real auth.
2. Guests collect / members claim, with the sign-in prompt on unclaimed finds.
3. Daily roll budget and rate limits, then tune the budget and the tier hit chances together from telemetry.
4. Bot check at sign-up.
