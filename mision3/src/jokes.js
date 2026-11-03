// Funciones puras para transformar los datos de JokeAPI. No tocan React.

export const JOKES_URL = 'https://v2.jokeapi.dev/joke/Any?lang=es&safe-mode&amount=10'

const isValid = (j) =>
  (j?.type === 'single' && Boolean(j.joke)) ||
  (j?.type === 'twopart' && Boolean(j.setup) && Boolean(j.delivery))

// Deja solo { key, category, text }. El id de JokeAPI se repite entre categorías,
// por eso la key estable combina categoría + id.
export const normalize = (data) => {
  const raw = data?.jokes ?? (data ? [data] : [])
  return raw.filter(isValid).map((j) => ({
    key: `${j.category}-${j.id}`,
    category: j.category,
    text: j.type === 'single' ? j.joke : `${j.setup}\n${j.delivery}`,
  }))
}

export const countByCategory = (jokes) =>
  jokes.reduce((acc, j) => ({ ...acc, [j.category]: (acc[j.category] ?? 0) + 1 }), {})
