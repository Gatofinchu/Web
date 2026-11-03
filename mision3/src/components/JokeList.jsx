import JokeCard from './JokeCard.jsx'

export default function JokeList({ jokes, favoriteKeys, onToggleFavorite }) {
  return (
    <ul className="jokes">
      {jokes.map((joke) => (
        <JokeCard
          key={joke.key}
          joke={joke}
          isFavorite={favoriteKeys.has(joke.key)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </ul>
  )
}
