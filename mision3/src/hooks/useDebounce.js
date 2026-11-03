import { useEffect, useState } from 'react'

// Devuelve `value` con retraso: solo cambia cuando el valor lleva `delay` ms sin cambiar.
// El cleanup cancela el temporizador anterior en cada pulsación.
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
