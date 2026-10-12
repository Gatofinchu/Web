import FichaTripulante from './FichaTripulante'

function App() {
  return (
    <>
      <FichaTripulante nombre="Ellen Ripley" rol="Capitana" />
      <FichaTripulante nombre="Spock" rol="Oficial científico" especie="vulcaniano" />
      <FichaTripulante nombre="Han Solo" rol="Piloto" />
      <FichaTripulante nombre="Chewbacca" rol="Copiloto" especie="wookiee" />
    </>
  )
}

export default App
