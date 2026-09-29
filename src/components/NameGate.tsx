import { useEffect, useRef, useState, type FormEvent } from 'react'
import { NAME_MAX, validateName } from '../core/store'

interface Props {
  word: string | null
  onSave: (name: string) => void
}

/**
 * Blocking prompt shown after a first find while the player has no name.
 * It cannot be dismissed: Escape is ignored and there is no "not now".
 */
export function NameGate({ word, onSave }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const problem = validateName(name)
    if (problem) {
      setError(problem)
      return
    }
    onSave(name)
  }

  return (
    <dialog ref={ref} className="gate" aria-labelledby="gate-title" onCancel={(e) => e.preventDefault()}>
      <form onSubmit={submit} noValidate>
        <h2 id="gate-title">You found it first.</h2>
        <p className="muted">
          {word ? (
            <>
              <span className="word gate-word">{word}</span> is yours.{' '}
            </>
          ) : null}
          Choose the name that goes next to it. It is shown on every word you find first and on the leaderboard.
        </p>
        <label htmlFor="gate-name">Your name</label>
        <input
          id="gate-name"
          className="field"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value.slice(0, NAME_MAX))
            setError(null)
          }}
          maxLength={NAME_MAX}
          autoComplete="nickname"
          spellCheck={false}
          enterKeyHint="done"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'gate-error' : undefined}
        />
        {error && (
          <p id="gate-error" className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn">
          Save name
        </button>
      </form>
    </dialog>
  )
}
