# Reactor Core · Chistes

Proyecto de la **Misión 3 · Reactor Core** («Todo es un componente»).
Reconstrucción en **React 19** (con **Vite**) de la app de chistes de la misión anterior, que consume la API pública [JokeAPI](https://v2.jokeapi.dev).

## Qué hace

- Pide 10 chistes a la vez (en español, con `safe-mode`) y los pinta como tarjetas.
- Filtro por categoría, con el número de chistes de cada una.
- **Buscador:** filtra los chistes por texto mientras escribes, con *debounce* de 300 ms para no filtrar en cada pulsación. Se combina con el filtro de categoría.
- **Copiar:** cada tarjeta tiene un botón para copiar el chiste al portapapeles, con aviso de «¡Copiado!».
- **Favoritos:** cada tarjeta tiene una estrella; los favoritos se guardan en `localStorage` y sobreviven a recargar la página. Un botón alterna entre los chistes nuevos y tus favoritos.
- Estados visibles: "Cargando...", error con botón **Reintentar**, y mensajes cuando no hay resultados o no hay favoritos.

## Cómo ejecutarlo

Requiere Node.js. Desde esta carpeta:

```bash
npm install
npm run dev
```

Abre el enlace que muestra la terminal (normalmente http://localhost:5173).

## Estructura

```
src/
├── main.jsx               # punto de entrada (createRoot)
├── App.jsx                # único sitio con estado; deriva el resto
├── jokes.js               # funciones puras: normalizar y contar
├── hooks/
│   ├── useFetch.js        # ★ custom hook: fetch + loading/error + cancelación
│   ├── useDebounce.js     # ★ custom hook: valor con retraso para el buscador
│   └── useLocalStorage.js # ★ custom hook: useState persistente
└── components/
    ├── Controls.jsx       # botones y filtro (sin estado propio)
    ├── SearchBox.jsx      # campo de búsqueda controlado
    ├── StatusMessage.jsx  # cargando / error / vacío
    ├── JokeList.jsx       # lista con keys estables
    └── JokeCard.jsx       # una tarjeta
```

## Decisiones de React

- **Estado mínimo:** solo `category`, `onlyFavorites`, `favorites` y lo que devuelve `useFetch`. Los chistes normalizados, los contadores por categoría, la lista visible y el conjunto de favoritos se **derivan** en cada render; no se duplican en estado.
- **Lifting state:** el estado vive en `App` y baja por props a `Controls` y `JokeList`; los hijos avisan con callbacks (`onCategoryChange`, `onToggleFavorite`...).
- **Efectos:** hay cuatro `useEffect`, todos con cleanup o dependencias justificadas. `useFetch` cancela la petición con `AbortController` (`[url, attempt]`); `useLocalStorage` sincroniza el valor (`[key, value]`); `useDebounce` cancela el temporizador anterior (`[value, delay]`); y `JokeCard` oculta el aviso «¡Copiado!» con un temporizador que se limpia (`[copied]`).
- **Listas:** la `key` de cada tarjeta es `categoría-id`, porque el id de JokeAPI se repite entre categorías.
- **Bonus:** tres custom hooks reutilizables: `useFetch`, `useLocalStorage` y `useDebounce`.

## Uso de IA

- **Herramienta:** Claude (Anthropic).
- **Qué hizo la IA:** casi todo el código (componentes, hooks, estilos) y el borrador de este README. La idea de reutilizar la app de chistes de la misión 2 y pasar el enunciado fueron míos.
- **Prompt real relevante:** «Reconstruye (o reinventa) tu app de la misión anterior en React 19: componentes, props, estado y efectos» (enunciado de la M3 pasado a Claude, pidiendo crear un repositorio nuevo para ella).
- **Verificación:** _(completa esto con lo que hagas tú: probar en localhost, revisar el código, defender cada parte...)_
- **Hecho a mano:** _(indica aquí lo que escribas o cambies tú)_

## Autopsia

Las dos decisiones más discutibles del código:

1. **Guardar los favoritos como objetos completos y no solo como ids.** Los chistes cambian cada vez que se piden otros nuevos, así que con solo el id no habría de dónde recuperar el texto. Ocupa más en `localStorage`, pero la vista de favoritos funciona sin red. *Alternativa descartada:* guardar solo ids y volver a pedir cada chiste a la API.
2. **Dejar todo el estado en `App` en vez de usar Context o un reductor.** Para una app de este tamaño las props bastan y el flujo se sigue de un vistazo. *Alternativa descartada:* `useReducer` o Context, que añadirían estructura que ahora mismo no se necesita.
