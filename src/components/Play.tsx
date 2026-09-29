import { BALANCE, RUNTIME } from '../core/config'
import type { Feedback } from '../core/game'
import type { Game } from '../hooks/useGame'
import type { DictionaryState } from '../hooks/useDictionary'
import { Rack } from './Rack'

interface Props {
  game: Game
  dictState: DictionaryState
  onRetry: () => void
}

const fmt = (n: number) => n.toLocaleString('en-US')

function Outcome({ fb, name }: { fb: Feedback | null; name: string }) {
  if (!fb) return null
  if (fb.kind === 'miss') return <span className="pop muted">No word.</span>
  return (
    <div className="pop outcome">
      <div className="outcome-word">
        <span className="word">{fb.word}</span>
        {fb.kind !== 'dup' && <span className="pts">+{fb.pts}</span>}
      </div>
      {fb.kind === 'first' && <span className="pill">{name ? `First find · ${name}` : 'First find'}</span>}
      {fb.kind === 're' && <span className="muted small">Rediscovery · {Math.round(BALANCE.rediscoveryShare * 100)}% points</span>}
      {fb.kind === 'dup' && <span className="muted small">Already in your collection</span>}
    </div>
  )
}

export function Play({ game, dictState, onRetry }: Props) {
  const { state, email, saveFailed, generate, settle } = game
  const { rack, pending, anim, fb, profile, owned, firsts, rolls } = state

  const ready = dictState.status === 'ready'
  const animating = pending !== null
  const total = ready ? dictState.data.dict.words.length : 0
  const found = ready ? dictState.data.world.claimedCount + firsts : 0
  const pct = total ? (found / total) * 100 : 0
  const ownedCount = Object.keys(owned).length

  let genLabel = 'Generate'
  let onGenerate = () => {
    if (!animating) generate()
  }
  if (dictState.status === 'loading') genLabel = 'Loading dictionary'
  if (dictState.status === 'error') {
    genLabel = 'Could not load dictionary. Retry'
    onGenerate = onRetry
  }

  const shown = !animating ? fb : null
  const tierName = rack ? BALANCE.tiers[rack.tier].name : ''
  const announce =
    shown && shown.kind !== 'miss'
      ? `${tierName}. ${shown.word}. ${
          shown.kind === 'dup' ? 'Already in your collection.' : `${shown.pts} points. ${shown.kind === 'first' ? 'First find.' : 'Rediscovery.'}`
        }`
      : shown
        ? 'No word.'
        : ''

  return (
    <>
      <section className="community" aria-label="Progress">
        <span className="progress-label">Progress</span>
        <div
          className="bar"
          role="progressbar"
          aria-label="Words discovered by the community"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
        >
          <div className="bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="muted small">
          {fmt(found)} of {fmt(total)} words discovered
        </div>
      </section>

      <section className="stage" aria-label="Result">
        {!rack && <p className="stage-hint muted">One button, pure luck. Each click rolls a real word or a near miss.</p>}
        {rack && (
          <>
            <Rack key={rolls} roll={rack} anim={anim} animating={animating} onDone={settle} />
            <div className="feedback" aria-hidden="true">
              <Outcome fb={shown} name={profile.name} />
            </div>
            <div className="sr-only" role="status" aria-live="polite">
              {announce}
            </div>
          </>
        )}
      </section>

      <button
        type="button"
        className="btn go"
        onClick={onGenerate}
        // aria-disabled (not disabled) keeps keyboard focus on the button between rolls.
        aria-disabled={animating || dictState.status === 'loading'}
      >
        {genLabel}
      </button>

      {!email && ownedCount > 0 && (
        <p className="muted small center">
          Progress is saved on this device only. <a href="#/profile">Sign in</a> to keep it.
        </p>
      )}
      {saveFailed && (
        <p className="muted small center">
          Saving is unavailable in this browser view, so progress resets on reload.
        </p>
      )}
      {RUNTIME.hitOverride !== null && (
        <p className="muted small center">Test mode: hit chance is {RUNTIME.hitOverride}% for every tier.</p>
      )}
    </>
  )
}
