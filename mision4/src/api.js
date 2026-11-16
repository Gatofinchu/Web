import { bookRecordSchema, bookSchema } from './schema.js';

// Simulamos un backend con localStorage: latencia artificial y fallos aleatorios
// para poder probar los estados de carga, error y éxito.
const STORAGE_KEY = 'mision4-books';
const FAILURE_RATE = 0.1;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function readRawBooks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Valida cada registro de la respuesta con safeParse: un dato corrupto
// se descarta sin tumbar toda la lista.
export async function fetchBooks() {
  await wait(600);
  const books = [];
  let discarded = 0;

  for (const item of readRawBooks()) {
    const result = bookRecordSchema.safeParse(item);
    if (result.success) {
      books.push(result.data);
    } else {
      discarded += 1;
    }
  }

  return { books, discarded };
}

// Solo para la demo del reto bonus: mete en el "servidor" un registro que no cumple
// el esquema (valoración 9, sin autor, fecha inválida) para ver que safeParse lo atrapa.
export async function injectCorruptBook() {
  await wait(200);
  const corrupt = {
    id: 'corrupto-' + Date.now(),
    title: 'Registro roto',
    rating: 9,
    year: 'mil novecientos',
    createdAt: 'ayer',
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([corrupt, ...readRawBooks()]));
}

export async function createBook(input) {
  await wait(500);

  if (Math.random() < FAILURE_RATE) {
    throw new Error('El servidor no respondió. Tu libro no se ha guardado; inténtalo de nuevo.');
  }

  // Segunda validación en la "frontera" del servidor, igual que haría un API real.
  const payload = bookSchema.parse(input);
  const record = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...readRawBooks()]));
  return record;
}
