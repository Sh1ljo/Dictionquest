import { useCallback, useEffect, useState } from 'react'

export const ROUTES = ['play', 'dictionary', 'leaderboard', 'profile'] as const
export type Route = (typeof ROUTES)[number]

function parse(): Route {
  const name = window.location.hash.replace(/^#\/?/, '')
  return (ROUTES as readonly string[]).includes(name) ? (name as Route) : 'play'
}

/** Hash routing keeps the browser and phone back button working without a router dependency. */
export function useRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(parse)

  useEffect(() => {
    const onChange = () => setRoute(parse())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const go = useCallback((next: Route) => {
    window.location.hash = `/${next}`
  }, [])

  return [route, go]
}
