import { useState, type FormEvent } from 'react'
import { isValidEmail, makeCode } from '../core/auth'
import type { SignInResult } from '../hooks/useGame'

interface Props {
  email: string | null
  onSignIn: (email: string) => SignInResult
  onSignOut: () => void
}

/** Simulated email sign-in: see src/core/auth.ts. No email is sent yet. */
export function Account({ email, onSignIn, onSignOut }: Props) {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [input, setInput] = useState('')
  const [code, setCode] = useState('')
  const [entered, setEntered] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const sendCode = (e: FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(input)) {
      setError('Enter a valid email address.')
      return
    }
    setCode(makeCode())
    setEntered('')
    setError(null)
    setStep('code')
  }

  const verify = (e: FormEvent) => {
    e.preventDefault()
    if (entered.trim() !== code) {
      setError('That code does not match.')
      return
    }
    try {
      const result = onSignIn(input)
      setNotice(
        result.kind === 'restored'
          ? `Welcome back. Restored ${result.words} ${result.words === 1 ? 'word' : 'words'} from this account.`
          : 'Account created. Your progress is now saved to it.',
      )
      setStep('email')
      setInput('')
      setError(null)
    } catch (err) {
      console.error('Dictionquest: sign-in failed', err)
      setError(err instanceof Error ? err.message : 'Sign-in failed.')
    }
  }

  if (email) {
    return (
      <section className="account" aria-labelledby="account-title">
        <h2 id="account-title">Account</h2>
        <p className="account-email">
          Signed in as <strong>{email}</strong>
        </p>
        {notice && (
          <p className="muted small" role="status">
            {notice}
          </p>
        )}
        <p className="muted small">
          Your progress is saved to this account. Prototype: it is stored in this browser only; syncing across devices
          comes with real sign-in.
        </p>
        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            setNotice(null)
            onSignOut()
          }}
        >
          Sign out
        </button>
      </section>
    )
  }

  return (
    <section className="account" aria-labelledby="account-title">
      <h2 id="account-title">Save your progress</h2>
      <p className="muted small">
        Sign in with your email to keep your words. Without it, progress lives on this device as a guest.
      </p>

      {step === 'email' ? (
        <form className="form-group" onSubmit={sendCode} noValidate>
          <label htmlFor="dq-email">Email</label>
          <input
            id="dq-email"
            className="field"
            type="email"
            inputMode="email"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setError(null)
            }}
            placeholder="you@example.com"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'account-error' : undefined}
          />
          {error && (
            <p id="account-error" className="error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn">
            Send code
          </button>
        </form>
      ) : (
        <form className="form-group" onSubmit={verify} noValidate>
          <div className="notice" role="status">
            <strong>Prototype:</strong> no email is sent yet. Your code for {input.trim()} is{' '}
            <span className="mono code">{code}</span>
          </div>
          <label htmlFor="dq-code">6-digit code</label>
          <input
            id="dq-code"
            className="field mono"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={entered}
            onChange={(e) => {
              setEntered(e.target.value.replace(/\D/g, '').slice(0, 6))
              setError(null)
            }}
            placeholder="123456"
            autoComplete="one-time-code"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'account-error' : undefined}
          />
          {error && (
            <p id="account-error" className="error" role="alert">
              {error}
            </p>
          )}
          <div className="row">
            <button type="submit" className="btn grow">
              Verify and sign in
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setStep('email')
                setError(null)
              }}
            >
              Back
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
