# Tres en Raya: Cazador de Jefes

David de la Mano

Proyecto para la misión M1 - El Despertar del DOM (Web Development I, U-tad).

Es un tres en raya normal pero contra 3 jefes seguidos, cada uno más difícil. En cada ronda tengo una habilidad que puedo usar una vez, y el jefe tiene una trampa suya para compensar. Todo hecho con HTML, CSS y JavaScript.

## Cómo probarlo

Se abre index.html en el navegador. Se juega haciendo click en una casilla libre, el jefe mueve solo después de un momento. Si le ganas la ronda pasas al siguiente jefe. Hay un botón debajo del tablero para usar tu habilidad, una vez por ronda. Tecla secreta: pulsando "d" se pone en modo oscuro.

## Uso de IA

He usado IA para todo el proyecto, Claude de Anthropic, siguiendo la regla de la asignatura de que se puede usar IA para todo pero hay que poder defenderlo línea a línea. No le pedí todo de golpe, fuimos haciendo el proyecto por partes.

Primero hablamos de qué juego hacer, sin tocar código todavía. Empezó siendo un tres en raya normal, luego lo cambiamos a que fuera contra jefes en plan PvE, y de ahí salió lo de que cada jefe tuviera su trampa y yo una habilidad para compensar.

Con eso ya claro, le pedí que me hiciera el index.html, el style.css y el script.js enteros, con el tablero, el estado del juego, la IA de los 3 jefes y las 3 habilidades y 3 trampas. Con eso ya se podía jugar de principio a fin.

Ya con el juego funcionando le pedí que le diera mejor apariencia: colores distintos por jefe, una tipografía más de videojuego retro, animaciones, un dibujo pixel art para cada jefe y que el jefe se viera "morir" cuando le ganas. Jugando bastante para probar todo esto salieron varios bugs de la parte de antes, por ejemplo una casilla que no se dejaba pulsar cuando tenía que poder usarse para la habilidad de robar, o un mensaje de trampa que se ponía y quitaba tan rápido que no se llegaba a leer. Esos bugs los fuimos arreglando antes de dar el proyecto por terminado.

Algunos de los prompts que usé, más o menos:

- Al principio le pregunté qué tipo de juego se podía hacer para esta misión, sin especificar mucho más.
- Antes de que escribiera código le pedí que me organizara los pasos a seguir, para no meterme directamente a hacerlo todo de una vez.
- Más adelante, cuando encontramos que la casilla del jefe no se podía pulsar para robarla con la habilidad, le pedí directamente que arreglara ese bug.

## Autopsia

La trampa del jefe sale con un 35% de probabilidad cada turno suyo, en vez de salir siempre en un turno fijo. Pensé en ponerla siempre en el segundo turno por ejemplo, pero así sería fácil de predecir y esquivar. El problema es que con probabilidad puede que una partida no llegues a ver la trampa nunca, pero me pareció mejor eso que hacerla previsible.

La habilidad del jefe 3 (añadir una casilla extra) es la única que no te hace perder el turno al usarla. Las otras dos (robar y bloquear) sí cuentan como tu jugada de esa ronda. Lo hice así porque esta habilidad se supone que es una ficha de más, si contara como tu turno normal ya no sería "extra", sería solo otra forma de mover.
