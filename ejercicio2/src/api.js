// Capa de datos: sabe hablar con la API NHTSA vPIC (Departamento de Transporte
// de EE. UU.) y devuelve objetos limpios y seguros para el resto de la app.

import { cachedFetch } from './cache.js';

const BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

export const MIN_YEAR = 1995;

// Marcas con catálogo en la API (comprobado con peticiones reales).
export const MAKES = [
  'Tesla', 'Toyota', 'Ford', 'Chevrolet', 'Honda', 'Nissan', 'BMW', 'Mercedes-Benz',
  'Audi', 'Volkswagen', 'Porsche', 'Ferrari', 'Lamborghini', 'Mazda', 'Subaru',
  'Kia', 'Hyundai', 'Volvo', 'Lexus', 'Mini',
];

/**
 * Convierte un modelo crudo de la API en el objeto que usa la interfaz.
 * Devuelve null si el dato es inservible, para poder descartarlo.
 */
export function normalizeModel(raw, make) {
  if (!raw || typeof raw.Model_ID !== 'number' || typeof raw.Model_Name !== 'string') return null;

  const name = raw.Model_Name.trim();
  if (!name) return null;

  return { id: raw.Model_ID, name, make };
}

/** Modelos de turismo de una marca en un año concreto. */
export async function fetchModels(make, year) {
  const url =
    `${BASE_URL}/GetModelsForMakeYear/make/${encodeURIComponent(make.toLowerCase())}` +
    `/modelyear/${year}/vehicletype/car?format=json`;

  const data = await cachedFetch(url);
  const results = Array.isArray(data?.Results) ? data.Results : [];

  return results
    .map((raw) => normalizeModel(raw, make))
    .filter(Boolean)
    .filter((model, index, all) => all.findIndex((m) => m.id === model.id) === index); // sin duplicados
}
