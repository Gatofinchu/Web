export default function JokeCard({ joke, isFavorite, onToggleFavorite }) {
  return (
    <li className={`card ${joke.category}`}>
      <small>{joke.category}</small>
      <p>{joke.text}</p>
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
