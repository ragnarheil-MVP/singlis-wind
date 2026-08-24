import { useCallback, useEffect, useState } from 'react'
import { parseWindguru, type SpotForecast } from './forecast'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: SpotForecast }

export function useForecast() {
  const [state, setState] = useState<State>({ status: 'loading' })

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const res = await fetch('/api/forecast')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const raw = await res.json()
      setState({ status: 'ready', data: parseWindguru(raw) })
    } catch (e) {
      setState({
        status: 'error',
        message: e instanceof Error ? e.message : 'Unbekannter Fehler',
      })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { state, reload: load }
}
