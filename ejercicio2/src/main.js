// Punto de entrada: conecta datos (api), lógica (logic) y presentación (render).

import './style.css';
import { MAKES, MIN_YEAR, fetchModels } from './api.js';
import { cacheStats, clearCache, getRequestLog } from './cache.js';
import { getVisibleModels, groupByInitial, summarize } from './logic.js';
import {
  renderEmpty,
  renderError,
  renderGroups,
  renderLoading,
  renderLog,
  renderSummary,
} from './render.js';

const DEFAULT_MAKE = 'Tesla';
const DEFAULT_YEAR = 2023;

const $ = (selector) => document.querySelector(selector);

const makeSelect = $('#make');
const yearSelect = $('#year');
const searchInput = $('#search');
const sortSelect = $('#sort');
const summary = $('#summary');
const catalog = $('#catalog');
const cacheInfo = $('#cache-info');
const clearCacheBtn = $('#clear-cache');
const logList = $('#request-log');

const state = {
  make: DEFAULT_MAKE,
  year: DEFAULT_YEAR,
  models: [],
  requestId: 0, // identifica la última petición para ignorar respuestas obsoletas
};

function fillSelects() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - MIN_YEAR + 1 }, (_, i) => currentYear - i);

  makeSelect.innerHTML = MAKES.map((make) => `<option value="${make}">${make}</option>`).join('');
  yearSelect.innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join('');

  makeSelect.value = DEFAULT_MAKE;
  yearSelect.value = String(DEFAULT_YEAR);
}

function updateFooter() {
  cacheInfo.textContent = `${cacheStats.hits} desde caché · ${cacheStats.misses} desde la red`;
  renderLog(logList, getRequestLog());
}

function summaryText(visible) {
  const { count, longest, letters } = summarize(visible);
  if (count === 0) return '';
  return (
    `${state.make} ${state.year}: ${count} de ${state.models.length} modelos en ${letters} grupos. ` +
    `Nombre más largo: ${longest.name}.`
  );
}

/** Aplica búsqueda y orden sobre los datos ya cargados (sin volver a pedir nada). */
function render() {
  const visible = getVisibleModels(state.models, {
    query: searchInput.value,
    sort: sortSelect.value,
  });

  if (state.models.length === 0) {
    renderEmpty(catalog, `No hay turismos de ${state.make} registrados en ${state.year}.`);
  } else if (visible.length === 0) {
    renderEmpty(catalog, 'Ningún modelo coincide con tu búsqueda.');
  } else {
    renderGroups(catalog, groupByInitial(visible));
  }

  renderSummary(summary, summaryText(visible));
  updateFooter();
}

async function loadModels() {
  const requestId = ++state.requestId;
  state.make = makeSelect.value;
  state.year = Number(yearSelect.value);

  renderLoading(catalog);
  renderSummary(summary, '');

  try {
    const models = await fetchModels(state.make, state.year);
    if (requestId !== state.requestId) return; // el usuario ya pidió otra cosa
    state.models = models;
    render();
  } catch (error) {
    if (requestId !== state.requestId) return;
    state.models = [];
    renderError(catalog, error.message, loadModels);
    updateFooter();
  }
}

[makeSelect, yearSelect].forEach((el) => el.addEventListener('change', loadModels));
[searchInput, sortSelect].forEach((el) => el.addEventListener('input', render));

clearCacheBtn.addEventListener('click', () => {
  const removed = clearCache();
  updateFooter();
  cacheInfo.textContent = `Caché vaciada (${removed} entradas).`;
});

fillSelects();
loadModels();
