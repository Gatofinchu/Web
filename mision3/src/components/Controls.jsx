// Barra de controles. No tiene estado propio: todo llega por props (lifting state).
export default function Controls({
  counts,
  category,
  onCategoryChange,
  onlyFavorites,
  onToggleFavorites,
  favoritesCount,
  onReload,
}) {
  return (
    <div className="controls">
      <button onClick={onReload}>Nuevos chistes</button>

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        aria-label="Filtrar por categoría"
      >
        <option value="todas">Todas</option>
        {Object.entries(counts).map(([name, n]) => (
          <option key={name} value={name}>
            {name} ({n})
          </option>
        ))}
      </select>

      <button className={onlyFavorites ? 'active' : ''} onClick={onToggleFavorites} aria-pressed={onlyFavorites}>
        ★ Favoritos ({favoritesCount})
      </button>
    </div>
  )
}
