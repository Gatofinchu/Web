// Lógica pura: transforma datos con métodos de array. No toca el DOM ni la red,
// así que es fácil de probar y de razonar.

export const sorters = {
  az: (a, b) => a.name.localeCompare(b.name, 'es', { numeric: true }),
  za: (a, b) => b.name.localeCompare(a.name, 'es', { numeric: true }),
  length: (a, b) => b.name.length - a.name.length,
};

/** Aplica la búsqueda por nombre y el orden elegido. No modifica el array original. */
export function getVisibleModels(models, { query = '', sort = 'az' } = {}) {
  const normalizedQuery = query.trim().toLowerCase();

  return models
    .filter((model) => model.name.toLowerCase().includes(normalizedQuery))
    .toSorted(sorters[sort] ?? sorters.az);
}

/** Letra bajo la que se agrupa un modelo: A-Z, "0-9" o "#" para nombres raros. */
export function getInitial(name) {
  const first = name.charAt(0).toUpperCase();
  if (/[A-Z]/.test(first)) return first;
  if (/\d/.test(first)) return '0-9';
  return '#';
}

/** Agrupa los modelos por inicial: [{ letter: 'A', models: [...] }, ...] */
export function groupByInitial(models) {
  const groups = models.reduce((acc, model) => {
    const letter = getInitial(model.name);
    return { ...acc, [letter]: [...(acc[letter] ?? []), model] };
  }, {});

  return Object.entries(groups)
    .map(([letter, items]) => ({ letter, models: items }))
    .sort((a, b) => a.letter.localeCompare(b.letter));
}

/** Datos resumen de la selección actual. */
export function summarize(models) {
  if (models.length === 0) return { count: 0, longest: null, letters: 0 };

  return {
    count: models.length,
    longest: models.reduce((best, m) => (m.name.length > best.name.length ? m : best)),
    letters: new Set(models.map((m) => getInitial(m.name))).size,
  };
}
