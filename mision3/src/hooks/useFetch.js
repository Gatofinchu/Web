import { useEffect, useState } from 'react'

// Hook reutilizable: pide `url` con fetch y devuelve { data, loading, error, reload }.
// Cada petición se cancela con AbortController si el componente se desmonta
// o si cambia la url / se pide recargar (cleanup del efecto).
export function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState((prev) => ({ ...prev, loading: true, error: null }))

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error(`La API respondió con error ${response.status}`)
        const data = await response.json()
        setState({ data, loading: false, error: null })
      } catch (error) {
        if (error.name === 'AbortError') return
        setState({ data: null, loading: false, error })
      }
    }

    load()
    return () => controller.abort()
  }, [url, attempt])

  const reload = () => setAttempt((n) => n + 1)

  return { ...state, reload }
}
