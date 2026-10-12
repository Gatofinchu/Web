// BONUS: caché en localStorage con caducidad (TTL) para no repetir peticiones.
// Además guarda una "bitácora" de peticiones que la interfaz muestra al usuario.

import { fetchJSON } from './http.js';

const PREFIX = 'ejercicio2:';
const DEFAULT_TTL = 60 * 60 * 1000; // 1 hora
const MAX_LOG_ENTRIES = 12;

export const cacheStats = { hits: 0, misses: 0 };
let requestLog = [];

export const getRequestLog = () => requestLog;

function logRequest(source, url, startedAt) {
  const { pathname, search } = new URL(url);
  const entry = {
    source, // 'cache' | 'red'
    path: pathname.replace('/api/vehicles', '') + search,
    ms: Math.round(performance.now() - startedAt),
  };
  requestLog = [entry, ...requestLog].slice(0, MAX_LOG_ENTRIES);
}

function readEntry(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // JSON corrupto o localStorage no disponible
  }
}

function writeEntry(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Cuota llena o modo privado: la app sigue funcionando sin caché.
  }
}

/** Devuelve los datos cacheados si existen y no han caducado; si no, null. */
function getCached(key, ttl) {
  const entry = readEntry(key);
  const isFresh = entry && typeof entry.savedAt === 'number' && Date.now() - entry.savedAt <= ttl;
  return isFresh ? entry.data : null;
}

/** fetchJSON con caché: solo va a la red si no hay copia válida guardada. */
export async function cachedFetch(url, ttl = DEFAULT_TTL) {
  const startedAt = performance.now();

  const cached = getCached(url, ttl);
  if (cached) {
    cacheStats.hits++;
    logRequest('cache', url, startedAt);
    return cached;
  }

  cacheStats.misses++;
  const data = await fetchJSON(url);
  writeEntry(url, data);
  logRequest('red', url, startedAt);
  return data;
}

/** Borra solo las entradas de esta app. Devuelve cuántas eliminó. */
export function clearCache() {
  const ownKeys = Object.keys(localStorage).filter((key) => key.startsWith(PREFIX));
  ownKeys.forEach((key) => localStorage.removeItem(key));
  cacheStats.hits = 0;
  cacheStats.misses = 0;
  requestLog = [];
  return ownKeys.length;
}
