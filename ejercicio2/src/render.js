// Render: pinta en el DOM. No hace peticiones ni transforma datos.

const status = document.querySelector('#status')
const list = document.querySelector('#jokes')
const filter = document.querySelector('#filter')

export function showStatus(message, { error = false, retry } = {}) {
  status.textContent = message
  status.className = error ? 'error' : ''
  if (retry) {
    const button = document.createElement('button')
    button.textContent = 'Reintentar'
    button.addEventListener('click', retry)
    status.append(' ', button)
  }
}

export function renderFilter(counts) {
  const options = Object.entries(counts).map(([cat, n]) => new Option(`${cat} (${n})`, cat))
  filter.replaceChildren(new Option('Todas', 'todas'), ...options)
}

export function renderJokes(jokes) {
  list.replaceChildren(
    ...jokes.map((j) => {
      const card = document.createElement('li')
      card.className = `card ${j.category}`
      const tag = document.createElement('small')
      tag.textContent = j.category
      const text = document.createElement('p')
      text.textContent = j.text
      card.append(tag, text)
      return card
    })
  )
  if (jokes.length === 0) showStatus('No hay chistes con ese filtro.')
  else showStatus('')
}
