// Capa de datos: solo habla con JokeAPI y devuelve los chistes en crudo.

const URL = 'https://v2.jokeapi.dev/joke/Any?lang=es&safe-mode&amount=10'

export async function fetchJokes() {
  const response = await fetch(URL)
  if (!response.ok) throw new Error(`La API respondió con error ${response.status}`)

  const data = await response.json()
  if (data.error) throw new Error(data.message ?? 'La API no devolvió chistes')

  return data.jokes ?? [data]
}
