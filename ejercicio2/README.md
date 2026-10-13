# Async Odyssey · Chistes

Proyecto de la **Unidad 2 · Misión 2** (JavaScript avanzado y herramientas del frontend).
App hecha con **Vite** que consume la API pública [JokeAPI](https://v2.jokeapi.dev) con `fetch` + `async/await`.

## Qué hace

- Pide 10 chistes a la vez (en español, con `safe-mode`) y los pinta como tarjetas.
- Filtro por categoría, con el número de chistes de cada una.
- Botón para pedir chistes nuevos.
- Estados visibles: "Cargando...", mensaje de error con botón **Reintentar** y mensaje cuando el filtro no tiene resultados.

## Cómo ejecutarlo

Requiere Node.js. Desde esta carpeta:

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción en dist/
```

## Estructura

```
src/
  api.js     fetch a la API, response.ok y errores
  logic.js   filter / map / reduce (normalizar, filtrar, contar)
  render.js  pintar en el DOM y estados de carga/error
  main.js    conecta los módulos y los eventos
  style.css  estilos
```

## Uso de métodos de array

- `filter`: descarta chistes incompletos y filtra por categoría.
- `map`: convierte cada chiste crudo en `{ id, category, text }`.
- `reduce`: cuenta chistes por categoría.

## Declaración de uso de IA

He usado **Claude (Anthropic)** como ayuda para montar y organizar este proyecto: proponer la estructura en módulos y escribir parte del código y de este README. Lo he revisado y lo he subido yo.
