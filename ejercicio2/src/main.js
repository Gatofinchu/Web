import './style.css'
import { fetchJokes } from './api.js'
import { normalize, filterByCategory, countByCategory } from './logic.js'
import { showStatus, renderFilter, renderJokes } from './render.js'

let jokes = []

async function load() {
  showStatus('Cargando chistes...')
  try {
    jokes = normalize(await fetchJokes())
    renderFilter(countByCategory(jokes))
    renderJokes(jokes)
  } catch (error) {
    showStatus(`No se pudieron cargar los chistes: ${error.message}`, { error: true, retry: load })
  }
}

document.querySelector('#reload').addEventListener('click', load)
document.querySelector('#filter').addEventListener('change', (e) =>
  renderJokes(filterByCategory(jokes, e.target.value))
)

load()
