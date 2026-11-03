import { useEffect, useState } from 'react'

// Como useState, pero el valor sobrevive a recargar la página.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Si el almacenamiento falla (modo privado, cuota), la app sigue funcionando.
    }
  }, [key, value])

  return [value, setValue]
}
