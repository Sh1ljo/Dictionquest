import { useEffect, useState, type FormEvent } from 'react'
import { cleanName, NAME_MAX, validateName, type Profile as ProfileData } from '../core/store'
import { AVATARS } from '../data/avatars'
import { countryList, countryName } from '../data/countries'
import type { SignInResult } from '../hooks/useGame'
import { Account } from './Account'
import { Avatar } from './Avatar'

interface Props {
  profile: ProfileData
  onSave: (patch: ProfileData) => void
  onReset: () => void
  wordCount: number
  email: string | null
  onSignIn: (email: string) => SignInResult
  onSignOut: () => void
}

export function Profile({ profile, onSave, onReset, wordCount, email, onSignIn, onSignOut }: Props) {
  const [name, setName] = useState(profile.name)
  const [country, setCountry] = useState(profile.country)
  const [avatar, setAvatar] = useState(profile.avatar)
  const [confirmReset, setConfirmReset] = useState(false)
  const [savedAt, setSavedAt] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  // Signing in or out swaps the whole game, so the form must show the new profile.
  useEffect(() => {
    setName(profile.name)
    setCountry(profile.country)
    setAvatar(profile.avatar)
    setNameError(null)
    setSavedAt(false)
  }, [email])

  const dirty = cleanName(name) !== profile.name || country !== profile.country || avatar !== profile.avatar

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const problem = validateName(name)
    if (problem) {
      setNameError(problem)
      return
    }
    onSave({ name: cleanName(name), country, avatar })
    setName(cleanName(name))
    setSavedAt(true)
  }

  return (
    <section className="profile" aria-label="Profile">
      <div className="preview">
        <Avatar id={avatar} size={88} />
        <div className="preview-text">
          <span className="preview-name">{cleanName(name) || 'Choose a name'}</span>
          <span className="muted small">{country ? countryName(country) : 'No country selected'}</span>
        </div>
      </div>

      <form className="form" onSubmit={submit}>
        <div className="form-group">
          <label htmlFor="dq-profile-name">Display name (required)</label>
          <input
            id="dq-profile-name"
            className="field"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value.slice(0, NAME_MAX))
              setSavedAt(false)
              setNameError(null)
            }}
            placeholder="Your name"
            maxLength={NAME_MAX}
            autoComplete="nickname"
            spellCheck={false}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? 'dq-profile-name-error' : undefined}
          />
          {nameError && (
            <span id="dq-profile-name-error" className="error" role="alert">
              {nameError}
            </span>
          )}
          <span className="muted small">{NAME_MAX} characters at most. Shown on the leaderboard and on words you find first.</span>
        </div>

        <div className="form-group">
          <label htmlFor="dq-profile-country">Country</label>
          <select
            id="dq-profile-country"
            className="field select"
            value={country}
            onChange={(e) => {
              setCountry(e.target.value)
              setSavedAt(false)
            }}
          >
            <option value="">Not set</option>
            {countryList().map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="form-group avatars">
          <legend>Avatar</legend>
          <div className="avatar-grid">
            {AVATARS.map((a) => (
              <label key={a.id} className="avatar-option">
                <input
                  type="radio"
                  name="avatar"
                  value={a.id}
                  checked={avatar === a.id}
                  onChange={() => {
                    setAvatar(a.id)
                    setSavedAt(false)
                  }}
                />
                <Avatar id={a.id} size={52} />
                <span className="sr-only">{a.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="btn save-profile" disabled={!dirty}>
          Save profile
        </button>
        <p className="muted small center" role="status" aria-live="polite">
          {savedAt && !dirty ? 'Profile saved.' : ''}
        </p>
      </form>

      <Account email={email} onSignIn={onSignIn} onSignOut={onSignOut} />

      <div className="danger">
        <h2>Progress</h2>
        <p className="muted small">
          {wordCount} {wordCount === 1 ? 'word' : 'words'} collected. Progress is stored in this browser only.
        </p>
        {confirmReset ? (
          <div className="row">
            <button
              type="button"
              className="btn danger-btn"
              onClick={() => {
                onReset()
                setConfirmReset(false)
              }}
            >
              Yes, reset progress
            </button>
            <button type="button" className="btn-outline" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="btn-outline" onClick={() => setConfirmReset(true)}>
            Reset progress
          </button>
        )}
      </div>
    </section>
  )
}
