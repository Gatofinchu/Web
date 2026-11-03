import { useMemo, useState } from 'react'
import { useFetch } from './hooks/useFetch.js'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { useDebounce } from './hooks/useDebounce.js'
import { JOKES_URL, normalize, countByCategory } from './jokes.js'
import Controls from './components/Controls.jsx'
import SearchBox from './components/SearchBox.jsx'
import StatusMessage from './components/StatusMessage.jsx'
import JokeList from './components/JokeList.jsx'

export default function App() {
  // Estado mínimo: lo demás se deriva de estos cuatro valores.
  const { data, loading, error, reload } = useFetch(JOKES_URL)
  const [favorites, setFavorites] = useLocalStorage('reactor-core:favorites', [])
  const [category, setCategory] = useState('todas')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [search, setSearch] = useState('')

  // Valores derivados (no se guardan en estado).
  const fetched = useMemo(() => normalize(data), [data])
  const source = onlyFavorites ? favorites : fetched
  const counts = countByCategory(source)
  const query = useDebounce(search, 300).trim().toLowerCase()
  const visible = source.filter(
    (j) =>
      (category === 'todas' || j.category === category) &&
      (query === '' || j.text.toLowerCase().includes(query))
  )
  const favoriteKeys = new Set(favorites.map((j) => j.key))

  function toggleFavorite(joke) {
    setFavorites((prev) =>
      prev.some((j) => j.key === joke.key) ? prev.filter((j) => j.key !== joke.key) : [...prev, joke]
    )
  }

  function changeSource(next) {
    setOnlyFavorites(next)
    setCategory('todas') // la categoría elegida puede no existir en la otra lista
  }

  function showFresh() {
    changeSource(false)
    reload()
  }

  return (
    <main>
      <h1>Reactor Core 😄</h1>
      <Controls
        counts={counts}
        category={category}
        onCategoryChange={setCategory}
        onlyFavorites={onlyFavorites}
        onToggleFavorites={() => changeSource(!onlyFavorites)}
        favoritesCount={favorites.length}
        onReload={showFresh}
      />

      <SearchBox value={search} onChange={setSearch} />

      {!onlyFavorites && loading && <StatusMessage>Cargando chistes...</StatusMessage>}
      {!onlyFavorites && error && (
        <StatusMessage error onRetry={reload}>
          No se pudieron cargar los chistes: {error.message}
        </StatusMessage>
      )}
      {!loading && !error && visible.length === 0 && (
        <StatusMessage>
          {onlyFavorites ? 'Aún no tienes favoritos.' : 'No hay chistes con ese filtro.'}
        </StatusMessage>
      )}

      <JokeList jokes={visible} favoriteKeys={favoriteKeys} onToggleFavorite={toggleFavorite} />
    </main>
  )
}
