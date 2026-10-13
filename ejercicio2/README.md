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


npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción en dist/


## Uso de IA

- **Herramienta:** Claude (Anthropic).
- **Qué hizo la IA:** casi todo el código (`api.js`, `logic.js`, `render.js`, `main.js`, `index.html`, `style.css`) y el borrador de este README. La elección de JokeAPI y la idea de la app (pedir chistes con un botón) fueron mías.
- **Prompts reales relevantes:**
  1. «Mira la rúbrica que te he pasado y dame ideas de como puedo introducir todo lo que me piden hacia mi aplicación de chistes»
  2. «Tengo problemas con el node, no me funciona, coge el error y corrigelo» (Tuve problemas al continuar el proyecto desde el ordenador de mi casa, pero con Claude lo pude solucionar) 
-**VERIFICACION**Para verificar el trabajo, iba todo el rato actualizando mi localhost para ver como se iba actualizando, con la IA, iba añadiendo cosas e iba viendo su progreso.
- **MANUAL** A mano he escrito este README.md, de código, todo con la IA, incluso pequeños cambio que podia hacer, como cambios de variables o cosas similares.

## Autopsia

Las dos decisiones más discutibles del código:

1. **Elegir una app sencilla de chistes y descartar otras opciones más ambiciosas.** Con ayuda de la IA llegué a tener una aplicación de coches (API NHTSA vPIC) con catálogo por marca y año, comparativa de marcas en paralelo y caché, y valoré ampliarla con precios, ventas y más datos de coches. La descarté por complejidad: más código, más casos raros en los datos y más cosas que yo tendría que entender y defender línea a línea. Prefiero una app más pequeña que domino por completo. *Alternativas descartadas:* la app de coches con precios y ventas, y PokeAPI, que también había valorado al principio.
2. **Construir las tarjetas con `createElement` y `textContent`** en lugar de `innerHTML` con plantillas de texto. Es más largo, pero el contenido de la API nunca se interpreta como HTML, así que no hay riesgo de inyectar código. *Alternativa descartada:* `innerHTML` con template strings, más corto y legible, pero inseguro si la API devolviera HTML.
