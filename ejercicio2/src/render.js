// Capa de presentación: solo sabe pintar en el DOM lo que le dan.
// No conoce la red ni la lógica de negocio.

const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

export function renderLoading(container, count = 8) {
  container.setAttribute('aria-busy', 'true');
  container.innerHTML = `<div class="plates">${Array.from(
    { length: count },
    () => '<div class="plate skeleton"></div>',
  ).join('')}</div>`;
}

export function renderError(container, message, onRetry) {
  container.setAttribute('aria-busy', 'false');
  container.innerHTML = `
    <div class="state error" role="alert">
      <p><strong>Avería en la carretera.</strong></p>
      <p>${escapeHTML(message)}</p>
      <button type="button" id="retry">Reintentar</button>
    </div>`;
  container.querySelector('#retry').addEventListener('click', onRetry);
}

export function renderEmpty(container, text) {
  container.setAttribute('aria-busy', 'false');
  container.innerHTML = `<div class="state"><p>${escapeHTML(text)}</p></div>`;
}

/** Cada modelo se pinta como una matrícula: banda azul con la marca y el nombre en grande. */
function plateTemplate(model) {
  const code = model.make.replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase();
  return `
    <article class="plate">
      <span class="plate-band" aria-hidden="true">${escapeHTML(code)}</span>
      <span class="plate-body">
        <span class="plate-name">${escapeHTML(model.name)}</span>
        <span class="plate-id">${escapeHTML(model.make)} · ID ${model.id}</span>
      </span>
    </article>`;
}

export function renderGroups(container, groups) {
  container.setAttribute('aria-busy', 'false');
  container.innerHTML = groups
    .map(
      ({ letter, models }) => `
      <section class="group">
        <h2 class="group-letter">${escapeHTML(letter)}</h2>
        <div class="plates">${models.map(plateTemplate).join('')}</div>
      </section>`,
    )
    .join('');
}

export function renderSummary(element, text) {
  element.textContent = text;
}

export function renderDuelLoading(container, total) {
  container.setAttribute('aria-busy', 'true');
  container.innerHTML = `<div class="state"><p>Consultando ${total} marcas a la vez…</p></div>`;
}

/** Ranking de marcas con barras proporcionales al número de modelos. */
export function renderDuel(container, { year, ranking, failed }) {
  container.setAttribute('aria-busy', 'false');

  const rows = ranking
    .map(
      ({ make, count, percent }) => `
      <li>
        <span class="duel-make">${escapeHTML(make)}</span>
        <span class="duel-bar"><span style="width:${percent}%"></span></span>
        <span class="duel-count">${count}</span>
      </li>`,
    )
    .join('');

  const warning =
    failed > 0 ? `<p class="duel-warning">⚠ ${failed} marca(s) no se pudieron consultar.</p>` : '';

  container.innerHTML = `
    <h3>Turismos por marca en ${year}</h3>
    <ol class="duel-list">${rows}</ol>
    ${warning}`;
}

/** Bitácora: qué peticiones salieron a la red y cuáles vinieron de la caché. */
export function renderLog(list, entries) {
  list.innerHTML = entries
    .map(
      (e) => `
      <li class="log-${e.source}">
        <span class="log-source">${e.source === 'cache' ? 'CACHÉ' : 'RED'}</span>
        <code>${escapeHTML(e.path)}</code>
        <span class="log-ms">${e.ms} ms</span>
      </li>`,
    )
    .join('');
}
