import { useEffect, useState } from 'react'

export default function JokeCard({ joke, isFavorite, onToggleFavorite }) {
  const [copied, setCopied] = useState(false)

  // Oculta el aviso "¡Copiado!" a los 1,5 s; el cleanup evita temporizadores colgados.
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  async function copyJoke() {
    try {
      await navigator.clipboard.writeText(joke.text)
      setCopied(true)
    } catch {
      // Sin permiso de portapapeles: no pasa nada, simplemente no se copia.
    }
  }

  return (
    <li className={`card ${joke.category}`}>
      <small>{joke.category}</small>
      <p>{joke.text}</p>
      <button className="copy" onClick={copyJoke}>
        {copied ? '¡Copiado!' : 'Copiar'}
      </button>
      <button
        className="fav"
        onClick={() => onToggleFavorite(joke)}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      >
        {isFavorite ? '★' : '☆'}
      </button>
    </li>
  )
}
