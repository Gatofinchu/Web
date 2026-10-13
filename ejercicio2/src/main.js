import './style.css'

const boton = document.querySelector('#btn')
const chiste = document.querySelector('#chiste')

const URL = 'https://v2.jokeapi.dev/joke/Any?lang=es&safe-mode'

async function pedirChiste() {
  chiste.textContent = 'Cargando...'
  try {
    const respuesta = await fetch(URL)
    if (!respuesta.ok) throw new Error('Error ' + respuesta.status)
    const datos = await respuesta.json()

    if (datos.error) {
      chiste.textContent = 'No hay chiste ahora mismo, prueba otra vez.'
    } else if (datos.type === 'single') {
      chiste.textContent = datos.joke
    } else {
      chiste.textContent = datos.setup + '\n\n' + datos.delivery
    }
  } catch (error) {
    chiste.textContent = 'No se pudo cargar el chiste. ' + error.message
  }
}

boton.addEventListener('click', pedirChiste)
