import { useDeferredValue, useMemo, useState, type ChangeEvent } from 'react'
import type { GameState } from '../core/game'
import type { GameData } from '../hooks/useDictionary'
import { VirtualList } from './VirtualList'

type Mode = 'all' | 'found' | 'unfound' | 'mine'

const MODES: { key: Mode; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'found', label: 'Found' },
  { key: 'unfound', label: 'Unfound' },
  { key: 'mine', label: 'Mine' },
]

const ROW_HEIGHT = 48
const fmt = (n: number) => n.toLocaleString('en-US')

interface Props {
  data: GameData
  state: GameState
}

export function Dictionary({ data, state }: Props) {
  const { dict, world } = data
  const { owned, profile } = state
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<Mode>('all')
  const q = useDeferredValue(search)

  const view = useMemo(() => {
    const out: string[] = []
    for (const w of dict.words) {
      if (q && !w.includes(q)) continue
      if (mode !== 'all') {
        const found = owned[w] === 'first' || world.claimed(w)
        if (mode === 'found' && !found) continue
        if (mode === 'unfound' && found) continue
        if (mode === 'mine' && !owned[w]) continue
      }
      out.push(w)
    }
    return out
  }, [dict, world, owned, q, mode])

  const onSearch = (e: ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value.toLowerCase().replace(/[^a-z]/g, '').slice(0, 15))

  const renderRow = (i: number) => {
    const w = view[i]
    const o = owned[w]
    let finder: string
    let unclaimed = false
    if (o === 'first') finder = profile.name ? `${profile.name} (you)` : 'You'
    else {
      const other = world.finder(w)
      finder = other ?? 'Unclaimed'
      unclaimed = other === null
    }
    return (
      <div className="row-item" role="listitem" key={w} style={{ height: ROW_HEIGHT }}>
        <div className="row-word">
          <span className={o ? 'mark on' : 'mark'} aria-hidden="true" />
          <span className="word">{w}</span>
          {o && <span className="sr-only">In your collection</span>}
        </div>
        <span className={unclaimed ? 'finder subtle' : 'finder'}>{finder}</span>
      </div>
    )
  }

  return (
    <section className="dictionary" aria-label="Dictionary">
      <div>
        <label htmlFor="dq-search" className="sr-only">
          Search words
        </label>
        <input
          id="dq-search"
          className="field"
          type="text"
          value={search}
          onChange={onSearch}
          placeholder="Search the dictionary"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="search"
        />
      </div>
      <div className="modes">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            className={mode === m.key ? 'chip on' : 'chip'}
            aria-pressed={mode === m.key}
            onClick={() => setMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="list-meta muted small">
        <span aria-live="polite">
          {fmt(view.length)} {view.length === 1 ? 'word' : 'words'}
        </span>
        <span className="legend">
          <span className="mark on" aria-hidden="true" />
          In your collection
        </span>
      </div>
      {view.length === 0 ? (
        <div className="empty muted">No words match.</div>
      ) : (
        <VirtualList
          count={view.length}
          rowHeight={ROW_HEIGHT}
          label="Word list"
          resetKey={`${q}|${mode}`}
          renderRow={renderRow}
        />
      )}
    </section>
  )
}
