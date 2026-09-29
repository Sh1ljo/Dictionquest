import { useEffect, useRef } from 'react'
import { Avatar } from './components/Avatar'
import { Dictionary } from './components/Dictionary'
import { NameGate } from './components/NameGate'
import { Leaderboard } from './components/Leaderboard'
import { Play } from './components/Play'
import { Profile } from './components/Profile'
import { useDictionary, type DictionaryState } from './hooks/useDictionary'
import { useGame } from './hooks/useGame'
import { useRoute, type Route } from './hooks/useRoute'

const TABS: { route: Route; label: string }[] = [
  { route: 'play', label: 'Play' },
  { route: 'dictionary', label: 'Dictionary' },
  { route: 'leaderboard', label: 'Leaderboard' },
]

const TITLES: Record<Route, string> = {
  play: 'Dictionquest',
  dictionary: 'Dictionary · Dictionquest',
  leaderboard: 'Leaderboard · Dictionquest',
  profile: 'Profile · Dictionquest',
}

function NeedsDictionary({ state, onRetry }: { state: DictionaryState; onRetry: () => void }) {
  if (state.status === 'error') {
    return (
      <div className="empty">
        <p>Could not load the dictionary.</p>
        <p className="muted small">{state.message}</p>
        <button type="button" className="btn retry" onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }
  return <div className="empty muted">Loading dictionary…</div>
}

export default function App() {
  const [route, go] = useRoute()
  const [dictState, retry] = useDictionary()
  const data = dictState.status === 'ready' ? dictState.data : null
  const game = useGame(data)
  const { profile, owned, firsts, pending, fb } = game.state
  // A first find needs a name to go next to it: block everything until one is entered.
  const needsName = firsts > 0 && !profile.name && pending === null
  const lastWord = fb && fb.kind !== 'miss' ? fb.word : null
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    document.title = TITLES[route]
    window.scrollTo(0, 0)
    // Keep keyboard and screen-reader users oriented after a screen change.
    if (firstRender.current) firstRender.current = false
    else mainRef.current?.focus({ preventScroll: true })
  }, [route])

  return (
    <div className="shell">
      <header className="top">
        <a className="wordmark" href="#/play">
          Dictionquest
        </a>
        <button
          type="button"
          className={route === 'profile' ? 'profile-chip active' : 'profile-chip'}
          onClick={() => go('profile')}
          aria-label={`Profile${profile.name ? `: ${profile.name}` : ''}`}
        >
          <Avatar id={profile.avatar} size={30} />
          <span className="chip-name">{profile.name || 'Add name'}</span>
        </button>
      </header>

      <main className="page" ref={mainRef} tabIndex={-1}>
        {route === 'play' && <Play game={game} dictState={dictState} onRetry={retry} />}
        {route === 'dictionary' &&
          (data ? <Dictionary data={data} state={game.state} /> : <NeedsDictionary state={dictState} onRetry={retry} />)}
        {route === 'leaderboard' &&
          (data ? <Leaderboard data={data} state={game.state} /> : <NeedsDictionary state={dictState} onRetry={retry} />)}
        {route === 'profile' && (
          <Profile
            profile={profile}
            onSave={game.saveProfile}
            onReset={game.reset}
            wordCount={Object.keys(owned).length}
            email={game.email}
            onSignIn={game.signIn}
            onSignOut={game.signOut}
          />
        )}
      </main>

      <nav className="tabs" aria-label="Main">
        {TABS.map((t) => (
          <button
            key={t.route}
            type="button"
            className={route === t.route ? 'tab active' : 'tab'}
            aria-current={route === t.route ? 'page' : undefined}
            onClick={() => go(t.route)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {needsName && <NameGate word={lastWord} onSave={(name) => game.saveProfile({ name })} />}
    </div>
  )
}
