// Lógica: transforma y filtra datos con métodos de array. No toca el DOM.

const isValid = (j) =>
  (j?.type === 'single' && Boolean(j.joke)) ||
  (j?.type === 'twopart' && Boolean(j.setup) && Boolean(j.delivery))

// Descarta datos raros y deja solo { id, category, text }.
export const normalize = (raw) =>
  raw.filter(isValid).map((j) => ({
    id: j.id,
    category: j.category,
    text: j.type === 'single' ? j.joke : `${j.setup}\n${j.delivery}`,
  }))

export const filterByCategory = (jokes, category) =>
  category === 'todas' ? jokes : jokes.filter((j) => j.category === category)

// { Misc: 3, Programming: 2 }
export const countByCategory = (jokes) =>
  jokes.reduce((acc, j) => ({ ...acc, [j.category]: (acc[j.category] ?? 0) + 1 }), {})
