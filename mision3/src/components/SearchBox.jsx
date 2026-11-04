// Campo de búsqueda controlado: el valor vive en App y llega por props.
export default function SearchBox({ value, onChange }) {
  return (
    <input
      type="search"
      className="search"
      placeholder="Buscar en los chistes..."
      aria-label="Buscar chistes por texto"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
