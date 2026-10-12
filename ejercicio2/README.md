# Async Odyssey · Garaje

> «El event loop no espera a nadie.»

Proyecto de la **Unidad 2 · Misión 2 (JavaScript avanzado y herramientas del frontend)**.
Aplicación hecha con **Vite** que consume la API pública **NHTSA vPIC** (Departamento de Transporte de EE. UU.)
con `fetch` + `async/await`, módulos ES y métodos de array, y pinta los datos en el DOM con estados de carga y de error.

## Qué hace

- **Catálogo:** eliges una marca (20 disponibles) y un año, y se muestran los turismos de ese año agrupados por inicial. Cada modelo se dibuja como una **matrícula**.
- **Búsqueda y orden** sobre los datos ya cargados (A→Z, Z→A, nombre más largo), sin volver a pedir nada a la API.
- **Duelo de marcas:** consulta las 20 marcas **a la vez** y dibuja un ranking de barras con cuántos modelos tuvo cada una en el año elegido.
- **Estados visibles:** matrículas esqueleto animadas mientras carga, mensaje de error con botón «Reintentar», y mensajes distintos para «sin datos» y «sin coincidencias».
- **Bitácora de la odisea:** panel desplegable con las últimas peticiones, indicando si salieron a la **red** o vinieron de la **caché**, y cuánto tardaron.
- ★ **Bonus:** caché en `localStorage` con caducidad de 1 hora y botón para vaciarla.

## La API

Se usa un único endpoint, sin clave y de solo lectura (GET):

```
https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/{marca}/modelyear/{año}/vehicletype/car?format=json
```

Devuelve `{ Count, Message, Results: [{ Make_ID, Make_Name, Model_ID, Model_Name }] }`.

## Cómo ejecutarlo

Requiere Node.js 20.19 o superior. Desde esta carpeta (`ejercicio2/`):

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # build de producción en dist/
npm run preview  # sirve el build generado
```

## Estructura

```
index.html          Estructura de la página
src/
  main.js           Punto de entrada: estado, eventos y orquestación
  api.js            Capa de datos: peticiones a NHTSA y normalización de las respuestas
  http.js           fetchJSON: fetch + response.ok + timeout + errores con mensajes claros
  cache.js          Caché en localStorage (TTL) y bitácora de peticiones
  logic.js          Lógica pura con filter/map/reduce/toSorted (sin DOM ni red)
  render.js         Pintado en el DOM (matrículas, carga, error, vacío, ranking, bitácora)
  style.css         Estilos
```

Cada módulo tiene una única responsabilidad: `render.js` no conoce la red, `api.js` no conoce el DOM y `logic.js` no depende de ninguno de los dos.

## Decisiones técnicas

- **Asincronía:** `async/await` con `try/catch` y comprobación de `response.ok` (`fetch` no lanza error con un 404 o un 500). El duelo de marcas lanza las 20 peticiones en paralelo con `Promise.allSettled`, de modo que si una falla el resto se muestra igualmente y se avisa de cuántas fallaron.
- **Respuestas obsoletas:** si el usuario cambia de marca mientras hay una petición en vuelo, un identificador (`requestId`) descarta la respuesta vieja para que no pise a la nueva.
- **Robustez:** timeout con `AbortController`, captura de JSON inválido y de caída de red, `normalizeModel()` descarta datos inservibles (nulos, sin id, nombre vacío) y duplicados, y `localStorage` se usa dentro de `try/catch` por si no está disponible o está lleno.
- **Seguridad:** todo texto que viene de la API se escapa antes de insertarlo en el HTML.
- **Métodos de array:** `map`, `filter`, `reduce`, `toSorted`, `Set` y `Object.entries` para transformar los datos antes de pintarlos, sin bucles manuales.

## Uso de IA

**Herramienta:** Claude (Anthropic, modelo Claude Sonnet 5.5).

**Qué hizo la IA:** generó todo el código de los módulos (`api`, `http`, `cache`, `logic`, `render`, `main`), los estilos, el diseño de matrícula y este README. El autor no escribió el código a mano.

**Qué decidió el autor:** dirigió el trabajo con prompts, eligió el tema (coches) y la API (NHTSA vPIC, después de pedir alternativas a PokeAPI), y fijó el objetivo de cumplir la rúbrica de la misión.

**Prompts reales relevantes:**
1. «Coge la rúbrica para sacar la mayor puntuación» (pegando el enunciado y la rúbrica de la misión).
2. «Quiero la de coches, hazlo sobre esa» (tras pedir APIs distintas a la de Pokémon y comprobar cuáles respondían).

**Cómo se verificó lo generado:**
- Los endpoints de NHTSA se probaron con peticiones reales antes de escribir el código (Tesla, Ford, Ferrari, Lamborghini, Mercedes-Benz y Toyota en distintos años).
- La sintaxis de todos los módulos se comprobó con `node --check`.
- Se probaron con Node, usando `fetch` y `localStorage` simulados, el camino feliz, la caché (la segunda petición no sale a la red), respuestas vacías, datos raros, error 500, caída de red, JSON inválido y el fallo parcial del duelo.
- **No se pudo ejecutar `npm install` ni `npm run build` en el entorno donde se generó el código** (sin acceso al registro de npm). Se recomienda ejecutar `npm install && npm run build` en local para confirmarlo.

## Autopsia: las 2 decisiones más discutibles

**1. Lista fija de 20 marcas en el código (`MAKES` en `api.js`).**
- *Por qué:* la API tiene un endpoint que devuelve todas las marcas, pero incluye cientos de fabricantes oscuros, remolques y marcas sin turismos. Una lista curada y comprobada da un selector usable y garantiza que cada marca devuelve datos.
- *Alternativa descartada:* pedir las marcas a la API al arrancar. Sería más completo y no habría que mantener la lista, pero añade una petición más, un selector enorme y muchas marcas que devolverían resultados vacíos.
- *Coste asumido:* si NHTSA cambia sus datos o falta una marca que el usuario quiere, hay que editar el código.

**2. Caché en `localStorage` con caducidad de 1 hora, indexada por URL.**
- *Por qué:* sobrevive a recargar la página, es simple y no necesita librerías. Una hora basta porque los catálogos de modelos por año casi no cambian.
- *Alternativa descartada:* un `Map` en memoria. Es más simple y nunca se queda sin cuota, pero se pierde al recargar y no cumple bien el objetivo de «no repetir peticiones ya hechas».
- *Coste asumido:* guarda la respuesta cruda completa (ocupa más), puede servir datos de hasta una hora de antigüedad y `localStorage` puede estar lleno o desactivado. Por eso toda lectura y escritura va en `try/catch` y la app funciona igual sin caché.

## Créditos

Datos: [NHTSA vPIC API](https://vpic.nhtsa.dot.gov/api/), información pública del Departamento de Transporte de EE. UU. Proyecto con fines educativos.
