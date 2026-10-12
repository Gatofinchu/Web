// Capa de red: el único sitio donde se llama a fetch. Traduce los errores
// técnicos a mensajes que el usuario pueda entender.

const DEFAULT_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function fetchJSON(url, { timeout = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });

    // fetch NO lanza error con un 404 o un 500: hay que comprobarlo a mano.
    if (!response.ok) {
      throw new ApiError(`La API respondió con error ${response.status}.`, {
        status: response.status,
      });
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'AbortError') {
      throw new ApiError('La petición tardó demasiado y se canceló.', { cause: error });
    }
    if (error instanceof SyntaxError) {
      throw new ApiError('La API devolvió una respuesta que no es JSON válido.', { cause: error });
    }
    throw new ApiError('No se pudo conectar con la API. Revisa tu conexión.', { cause: error });
  } finally {
    clearTimeout(timer);
  }
}
