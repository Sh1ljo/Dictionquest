import { useMemo } from 'react'
import { MOCK_PLAYERS } from '../core/mock'
import type { GameState } from '../core/game'
import type { GameData } from '../hooks/useDictionary'
import { Avatar } from './Avatar'
import { countryName } from '../data/countries'

interface Entry {
  key: string
  name: string
  country: string
  avatar: string
  words: number
  you: boolean
  /** Lower = reached their count earlier; breaks ties. Simulated players count as earlier. */
  order: number
}

const fmt = (n: number) => n.toLocaleString('en-US')

/** '' is the global board; otherwise an ISO country code. */
export type BoardScope = string

interface Props {
  data: GameData
  state: GameState
  scope: BoardScope
  onScope: (scope: BoardScope) => void
}

export function Leaderboard({ data, state, scope, onScope }: Props) {
  const { profile, owned, pts } = state
  const yourWords = Object.keys(owned).length

  const entries = useMemo(() => {
    const others: Entry[] = MOCK_PLAYERS.map((p, i) => ({
      key: `mock-${i}`,
      name: p.name,
      country: p.country,
      avatar: p.avatar,
      words: data.world.counts[i],
      you: false,
      order: i,
    }))
    const you: Entry = {
      key: 'you',
      name: profile.name || 'You',
      country: profile.country,
      avatar: profile.avatar,
      words: yourWords,
      you: true,
      order: Number.MAX_SAFE_INTEGER,
    }
    return [...others, you].sort((a, b) => b.words - a.words || a.order - b.order)
  }, [data, profile.name, profile.country, profile.avatar, yourWords])

  // Only countries somebody plays for, so no choice leads to an empty board.
  const countries = useMemo(() => {
    const players = new Map<string, number>()
    for (const e of entries) if (e.country) players.set(e.country, (players.get(e.country) ?? 0) + 1)
    return [...players]
      .map(([code, n]) => ({ code, name: countryName(code), n }))
      .sort((a, b) => a.name.localeCompare(b.name, 'en'))
  }, [entries])

  // A saved scope can outlive its country (e.g. you changed yours), so fall back to global.
  const active = countries.some((c) => c.code === scope) ? scope : ''
  const shown = active ? entries.filter((e) => e.country === active) : entries

  const rank = shown.findIndex((e) => e.you) + 1
  const ahead = rank > 1 ? shown[rank - 2] : null
  const toPass = ahead ? ahead.words - yourWords + 1 : 0

  return (
    <section className="board" aria-label="Leaderboard">
      <div className="board-scope">
        <label htmlFor="dq-board-scope">Country</label>
        <select id="dq-board-scope" className="field select" value={active} onChange={(e) => onScope(e.target.value)}>
          <option value="">Global</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.n})
            </option>
          ))}
        </select>
      </div>

      <div className="summary">
        {rank > 0 ? (
          <>
            <div className="summary-rank">
              <span className="counter-big">#{rank}</span>
              <span className="counter-small">
                of {shown.length}
                {active && ` in ${countryName(active)}`}
              </span>
            </div>
            <div className="muted small">
              {fmt(yourWords)} {yourWords === 1 ? 'word' : 'words'} · {fmt(pts)} points
              {ahead && (
                <>
                  {' '}
                  · {toPass} more to pass {ahead.name}
                </>
              )}
              {!ahead && ' · You lead'}
            </div>
          </>
        ) : (
          <div className="muted small">
            You are not on this board.{' '}
            {profile.country ? (
              <button type="button" className="link" onClick={() => onScope(profile.country)}>
                Show {countryName(profile.country)}
              </button>
            ) : (
              <>
                <a href="#/profile">Set your country</a> to rank on a country board.
              </>
            )}
          </div>
        )}
      </div>

      <ol className="ranks">
        {shown.map((e, i) => (
          <li key={e.key} className={e.you ? 'rank you' : 'rank'} aria-current={e.you ? 'true' : undefined}>
            <span className="rank-n">{i + 1}</span>
            <Avatar id={e.avatar} size={36} />
            <div className="rank-name">
              <span className="rank-title">
                <span className="ellipsis">{e.name}</span>
                {e.you && <span className="you-tag">You</span>}
              </span>
              {e.country && (
                <span className="muted small">
                  <span className="cc">{e.country}</span> {countryName(e.country)}
                </span>
              )}
            </div>
            <span className="rank-words">
              {fmt(e.words)}
              <span className="sr-only"> words</span>
            </span>
          </li>
        ))}
      </ol>

      <p className="muted small">
        Ranked by words collected. Ties go to whoever reached the count first. Prototype: the other players are
        simulated and only you are real.
      </p>
    </section>
  )
}
