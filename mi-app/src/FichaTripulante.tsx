type FichaTripulanteProps = {
  nombre: string
  rol: string
  especie?: string
}

function FichaTripulante({ nombre, rol, especie = 'humana' }: FichaTripulanteProps) {
  return (
    <article>
      <h2>{nombre}</h2>
      <p>Rol: {rol}</p>
      <p>Especie: {especie}</p>
    </article>
  )
}

export default FichaTripulante
