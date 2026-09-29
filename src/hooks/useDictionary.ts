import { useCallback, useEffect, useState } from 'react'
import { RUNTIME } from '../core/config'
import { buildDictionary, type Dictionary } from '../core/dictionary'
import { buildMockWorld, type MockWorld } from '../core/mock'
import wordsUrl from '../data/words.txt?url'

export interface GameData {
  dict: Dictionary
  world: MockWorld
}

export type DictionaryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: GameData }

export function useDictionary(): [DictionaryState, () => void] {
  const [state, setState] = useState<DictionaryState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })

    fetch(wordsUrl, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Word list request failed (${res.status})`)
        return res.text()
      })
      .then((text) => {
        const dict = buildDictionary(text)
        const world = buildMockWorld(dict.words, RUNTIME.mockCoverage)
        setState({ status: 'ready', data: { dict, world } })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        console.error('Dictionquest: could not load the dictionary', err)
        setState({ status: 'error', message: err instanceof Error ? err.message : String(err) })
      })

    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return [state, retry]
}
