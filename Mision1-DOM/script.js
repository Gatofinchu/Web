/* ============================================================
   TRES EN RAYA: CAZADOR DE JEFES
   ============================================================
   Idea del juego: te enfrentas a 3 jefes con dificultad creciente.
   Cada jefe tiene, EN LA MISMA RONDA:
     - Una habilidad especial que TÚ puedes usar una vez.
     - Una trampa que EL JEFE puede usar una vez (para compensar
       que tienes una habilidad y así seguir siendo un reto).
   Todo el estado del juego vive en variables JS; el HTML solo
   se actualiza para reflejar esas variables (nunca al revés).
   ============================================================ */

// ---------- 1. DEFINICIÓN DE LOS JEFES ----------
// Cada jefe es un objeto con: su nombre, la dificultad de su IA,
// qué trampa puede usar y qué habilidad tiene el jugador ese turno.
const jefes = [
  { nombre: "Novato",    dificultad: "random",  trampa: "doble",           habilidad: "robar"    },
  { nombre: "Estratega", dificultad: "bloquea", trampa: "roboInverso",     habilidad: "bloquear" },
  { nombre: "Maestro",   dificultad: "optimo",  trampa: "deshacerInverso", habilidad: "extra"    },
];

// ---------- 1b. PIXEL ART DE CADA JEFE (dibujo original, no de ningún juego) ----------
// Cada monstruo se define como MEDIO patrón (6 columnas: de fuera hacia el
// centro) y se dibuja completo reflejándolo en espejo hasta 11 columnas.
// Así solo hay que diseñar la mitad y el monstruo sale simétrico gratis.
// Códigos: '.' vacío · '1' cuerpo · '2' cuerpo claro (sombreado) · '3' ojo · '4' pupila
const PIXEL_CLASES = {
  1: "pixel-cuerpo",
  2: "pixel-cuerpo-claro",
  3: "pixel-ojo",
  4: "pixel-pupila",
};

const monstruos = [
  {
    // Novato: un slime redondeado y amistoso.
    colorJefe: "#2f855a",
    colorJefeClaro: "#48bb78",
    mitad: [
      "......",
      "...11.",
      "..1111",
      ".11111",
      "113411",
      "111111",
      "112211",
      "..111.",
    ],
  },
  {
    // Estratega: un fantasma con base ondulada.
    colorJefe: "#553c9a",
    colorJefeClaro: "#805ad5",
    mitad: [
      ".1111.",
      "111111",
      "111111",
      "113411",
      "111111",
      "111111",
      "111211",
      "11.11.",
    ],
  },
  {
    // Maestro: un monstruo con cuernos, el más temible.
    colorJefe: "#9b2c2c",
    colorJefeClaro: "#e53e3e",
    mitad: [
      "1.....",
      "11....",
      ".11111",
      "111111",
      "113411",
      "111111",
      "111211",
      ".1111.",
    ],
  },
];

// Las 8 combinaciones que hacen ganar una partida de 3 en raya.
const COMBINACIONES_GANADORAS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas
  [0, 4, 8], [2, 4, 6],            // diagonales
];

// ---------- 2. ESTADO DEL JUEGO ----------
// "tablero" es la única fuente de verdad: 9 posiciones que valen
// null (vacía), "X" (jugador) u "O" (jefe).
let tablero = Array(9).fill(null);
let bloqueadas = [];           // índices congelados por la habilidad "bloquear"
let historialJugador = [];     // índices donde el jugador ha puesto una X, en orden
let historialJefe = [];        // índices donde el jefe ha puesto una O, en orden

let jefeActual = 0;            // 0 = Novato, 1 = Estratega, 2 = Maestro
let vidas = 3;
let rondasGanadas = 0;

let turno = "jugador";         // "jugador" o "jefe"
let habilidadDisponible = true;
let modoHabilidad = false;     // true mientras esperamos que el jugador elija el objetivo
let trampaUsada = false;

// ---------- 3. REFERENCIAS AL DOM (se cogen una sola vez) ----------
const elTablero = document.getElementById("tablero");
const elCasillas = document.querySelectorAll(".casilla");
const elMensaje = document.getElementById("mensaje");
const elIndicadorJefe = document.getElementById("indicador-jefe");
const elIndicadorVidas = document.getElementById("indicador-vidas");
const elMarcador = document.getElementById("marcador");
const elBotonHabilidad = document.getElementById("boton-habilidad");
const elBotonReiniciar = document.getElementById("boton-reiniciar");
const elMonstruo = document.getElementById("monstruo");

// ============================================================
// 4. FUNCIONES DE LÓGICA PURA (no tocan el DOM, solo calculan)
// ============================================================

function comprobarGanador(tab) {
  for (const [a, b, c] of COMBINACIONES_GANADORAS) {
    if (tab[a] && tab[a] === tab[b] && tab[a] === tab[c]) {
      return tab[a]; // devuelve "X" u "O"
    }
  }
  return null;
}

function tableroLleno(tab) {
  return tab.every((casilla) => casilla !== null);
}

function casillasLibres() {
  return tablero
    .map((valor, indice) => (valor === null && !bloqueadas.includes(indice) ? indice : null))
    .filter((indice) => indice !== null);
}

// Decide la jugada del jefe según su dificultad. Devuelve un índice o undefined.
function elegirMovimientoJefe(dificultad) {
  const libres = casillasLibres();
  if (libres.length === 0) return undefined;

  if (dificultad === "random") {
    return libres[Math.floor(Math.random() * libres.length)];
  }

  if (dificultad === "bloquea") {
    // Si el jugador podría ganar en su siguiente jugada, el jefe ocupa esa casilla.
    for (const indice of libres) {
      const copia = [...tablero];
      copia[indice] = "X";
      if (comprobarGanador(copia) === "X") return indice;
    }
    return libres[Math.floor(Math.random() * libres.length)];
  }

  if (dificultad === "optimo") {
    // 1) Si el jefe puede ganar ya, que gane.
    for (const indice of libres) {
      const copia = [...tablero];
      copia[indice] = "O";
      if (comprobarGanador(copia) === "O") return indice;
    }
    // 2) Si no, que bloquee al jugador.
    for (const indice of libres) {
      const copia = [...tablero];
      copia[indice] = "X";
      if (comprobarGanador(copia) === "X") return indice;
    }
    // 3) Si no, que coja el centro.
    if (libres.includes(4)) return 4;
    // 4) Si no, una esquina.
    const esquinas = [0, 2, 6, 8].filter((i) => libres.includes(i));
    if (esquinas.length > 0) return esquinas[Math.floor(Math.random() * esquinas.length)];
    // 5) Si no queda nada mejor, al azar.
    return libres[Math.floor(Math.random() * libres.length)];
  }
}

// ============================================================
// 5. FUNCIONES QUE ACTUALIZAN EL DOM (pintan el estado actual)
// ============================================================

// Decide si una casilla debe poder pulsarse, según si estamos en juego
// normal o esperando el objetivo de una habilidad (que acepta casillas
// distintas: "robar" necesita una casilla con O; "bloquear" y "extra"
// necesitan una casilla vacía).
function casillaEsClicable(indice) {
  const valor = tablero[indice];

  if (modoHabilidad) {
    const tipo = jefes[jefeActual].habilidad;
    if (tipo === "robar") return valor === "O";
    if (tipo === "bloquear" || tipo === "extra") {
      return valor === null && !bloqueadas.includes(indice);
    }
    return false;
  }

  return valor === null && !bloqueadas.includes(indice);
}

function renderTablero() {
  elCasillas.forEach((casilla, indice) => {
    const valor = tablero[indice];
    casilla.textContent = valor ?? "";
    casilla.classList.toggle("marca-x", valor === "X");
    casilla.classList.toggle("marca-o", valor === "O");
    casilla.classList.toggle("bloqueada", bloqueadas.includes(indice));
    casilla.disabled = turno !== "jugador" || !casillaEsClicable(indice);
  });
}

function actualizarMensaje(texto, esTrampa = false) {
  elMensaje.textContent = texto;
  elMensaje.classList.toggle("aviso-trampa", esTrampa);
}

function actualizarIndicadores() {
  const jefe = jefes[jefeActual];
  elIndicadorJefe.textContent = `Jefe ${jefeActual + 1}/3: ${jefe.nombre}`;
  elIndicadorVidas.textContent = `Vidas: ${"❤️".repeat(vidas)}`;
  elMarcador.textContent = `Rondas ganadas: ${rondasGanadas}`;
}

// Construye el pixel art de un monstruo a partir de su medio patrón,
// reflejándolo en espejo para completar las 11 columnas.
//
// "mitad" es un array de strings como "..1111" (una fila cada uno, 6
// caracteres = 6 columnas, de fuera hacia el centro). Para no tener que
// diseñar el monstruo entero a mano, cada fila se completa reflejando
// sus primeros caracteres al revés: por ejemplo "..1111" se convierte en
// "..1111" + "1111.." invertido y recortado = "..1111" + "111.." →
// once caracteres finales, simétricos respecto a la última columna.
function construirPixelArt(contenedor, mitad) {
  const filas = mitad.length;
  const columnas = mitad[0].length * 2 - 1; // la última columna del medio patrón es el eje central

  // grid-template-columns/rows le dice al CSS Grid cuántas celdas dibujar;
  // así no hace falta un valor fijo en el CSS para cada monstruo.
  contenedor.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;
  contenedor.style.gridTemplateRows = `repeat(${filas}, 1fr)`;
  contenedor.innerHTML = ""; // limpia el monstruo anterior antes de dibujar el nuevo

  mitad.forEach((mediaFila) => {
    // slice(0, -1): todo menos el último carácter (el eje central no se
    // duplica, o saldría una columna de más). reverse() le da la vuelta
    // para que el reflejo quede a continuación, como en un espejo real.
    const mitadInvertida = mediaFila.slice(0, -1).split("").reverse().join("");
    const filaCompleta = mediaFila + mitadInvertida;

    // Un <div class="pixel"> por cada carácter de la fila ya completa.
    for (const caracter of filaCompleta) {
      const pixel = document.createElement("div");
      pixel.className = "pixel";
      if (caracter !== ".") {
        // PIXEL_CLASES traduce el código ("1", "2"...) a la clase CSS que
        // le da su color (ver style.css: .pixel-cuerpo, .pixel-ojo...).
        pixel.classList.add(PIXEL_CLASES[caracter]);
      } else {
        // Un hueco: se deja invisible en vez de no crear el div, porque
        // en un grid cada celda ocupa su sitio se vea o no. Si se
        // saltara el div, todas las columnas siguientes de esa fila se
        // desplazarían una posición y el dibujo saldría descuadrado.
        pixel.style.visibility = "hidden";
      }
      contenedor.appendChild(pixel);
    }
  });
}

// Pinta el color y el pixel art del jefe actual. Se llama cada vez que
// cambiamos de jefe (o reiniciamos), nunca durante la ronda en curso.
function actualizarMonstruo() {
  const monstruo = monstruos[jefeActual];
  // setProperty() cambia el VALOR de una variable CSS desde JS. Como el
  // CSS ya usa var(--color-jefe) en varios sitios (título, pixel art,
  // borde al pasar el ratón...), con esta única línea se repinta todo
  // eso a la vez sin tocar ninguna clase.
  document.documentElement.style.setProperty("--color-jefe", monstruo.colorJefe);
  document.documentElement.style.setProperty("--color-jefe-claro", monstruo.colorJefeClaro);
  elMonstruo.classList.remove("derrotado"); // por si venía de la animación de muerte del jefe anterior
  construirPixelArt(elMonstruo, monstruo.mitad);
}

function actualizarBotonHabilidad() {
  const nombresHabilidad = {
    robar: "Robar casilla",
    bloquear: "Bloquear casilla",
    extra: "Añadir casilla extra",
  };
  const nombre = nombresHabilidad[jefes[jefeActual].habilidad];
  elBotonHabilidad.textContent = `${nombre} (${habilidadDisponible ? 1 : 0})`;
  elBotonHabilidad.disabled = !habilidadDisponible || turno !== "jugador";
  elBotonHabilidad.classList.toggle("esperando-objetivo", modoHabilidad);
}

// ============================================================
// 6. TRAMPAS DE LOS JEFES
// ============================================================

// Ejecuta la trampa del jefe y DEVUELVE el texto a mostrar (no lo pinta
// directamente), porque quien llama a esta función decide cómo combinar
// ese texto con el resto del mensaje de turno (ver turnoJefe).
function ejecutarTrampa(tipo) {
  const nombreJefe = jefes[jefeActual].nombre;

  if (tipo === "doble") {
    // El jefe coloca una ficha... y si la partida sigue viva, coloca otra más.
    const primerIndice = elegirMovimientoJefe(jefes[jefeActual].dificultad);
    if (primerIndice === undefined) return "";
    tablero[primerIndice] = "O";
    historialJefe.push(primerIndice);

    if (!comprobarGanador(tablero) && !tableroLleno(tablero)) {
      const segundoIndice = elegirMovimientoJefe(jefes[jefeActual].dificultad);
      if (segundoIndice !== undefined) {
        tablero[segundoIndice] = "O";
        historialJefe.push(segundoIndice);
      }
    }
    return `¡${nombreJefe} hace trampa: doble jugada!`;
  }

  if (tipo === "roboInverso") {
    // El jefe convierte una de tus X en una O, en vez de mover normalmente.
    if (historialJugador.length > 0) {
      const indice = historialJugador[Math.floor(Math.random() * historialJugador.length)];
      tablero[indice] = "O";
      historialJugador = historialJugador.filter((i) => i !== indice);
      historialJefe.push(indice);
    }
    return `¡${nombreJefe} hace trampa: te ha robado una casilla!`;
  }

  if (tipo === "deshacerInverso") {
    // El jefe borra tu última jugada, en vez de mover normalmente.
    if (historialJugador.length > 0) {
      const indice = historialJugador.pop();
      tablero[indice] = null;
    }
    return `¡${nombreJefe} hace trampa: ha deshecho tu última jugada!`;
  }

  return "";
}

// ============================================================
// 7. HABILIDAD DEL JUGADOR
// ============================================================

function usarHabilidad() {
  if (!habilidadDisponible || turno !== "jugador") return;

  const tipo = jefes[jefeActual].habilidad;

  // Las tres habilidades ("robar", "bloquear" y "extra") necesitan que el
  // jugador elija una casilla objetivo, así que solo activamos el "modo
  // habilidad" y esperamos ese click (ver manejarClicTablero).
  modoHabilidad = true;
  renderTablero(); // recalcula qué casillas son clicables en este modo
  actualizarBotonHabilidad();

  const mensajes = {
    robar: "Elige una casilla del jefe (O) para robarla",
    bloquear: "Elige una casilla vacía para bloquearla",
    extra: "Elige una casilla vacía para colocar una ficha extra",
  };
  actualizarMensaje(mensajes[tipo]);
}

// ============================================================
// 8. CLICKS EN EL TABLERO (delegación de eventos: UN solo listener)
// ============================================================

// Único listener puesto en el CONTENEDOR del tablero (elTablero), no en
// cada una de las 9 casillas: es "delegación de eventos". El click sube
// (burbujea) desde el <button> hasta aquí, y evento.target nos dice
// exactamente en qué casilla se hizo click. Con esto basta un solo
// addEventListener en vez de nueve.
function manejarClicTablero(evento) {
  if (turno !== "jugador") return; // por seguridad: si no es tu turno, ignora el click
  if (!evento.target.classList.contains("casilla")) return; // click en el hueco entre casillas, no en un botón

  const indice = Number(evento.target.dataset.index); // el data-index del HTML nos dice qué casilla es (0-8)

  // --- Estamos esperando el objetivo de una habilidad ---
  // Esta rama solo se ejecuta si antes se pulsó el botón de habilidad
  // (usarHabilidad puso modoHabilidad = true). Cada habilidad valida un
  // tipo de casilla distinto antes de aplicarse.
  if (modoHabilidad) {
    const tipo = jefes[jefeActual].habilidad;
    const casillaVacia = tablero[indice] === null && !bloqueadas.includes(indice);

    if (tipo === "robar" && tablero[indice] === "O") {
      // Robar: la O elegida se convierte en X, y se mueve de un
      // historial al otro para que ambas listas seguan siendo ciertas
      // (por ejemplo, para que "roboInverso" no intente robar una
      // casilla que ya no es del jugador).
      tablero[indice] = "X";
      historialJefe = historialJefe.filter((i) => i !== indice);
      historialJugador.push(indice);
    } else if (tipo === "bloquear" && casillaVacia) {
      // Bloquear: la casilla no se pinta, solo se añade a "bloqueadas"
      // (renderTablero() es quien decide, con esa lista, cómo se ve y
      // si se puede pulsar).
      bloqueadas.push(indice);
    } else if (tipo === "extra" && casillaVacia) {
      // "Añadir casilla extra": coloca una X de regalo. No es tu jugada
      // normal, así que el turno NO pasa al jefe todavía (ver más abajo).
      tablero[indice] = "X";
      historialJugador.push(indice);
    } else {
      // Click en una casilla que no vale para esta habilidad (por
      // ejemplo, pulsar una casilla vacía mientras "robar" pide una O):
      // no hacemos nada y seguimos esperando un click válido.
      return;
    }

    // A partir de aquí la habilidad SÍ se ha usado: se gasta (una sola
    // vez por ronda) y se sale del modo de espera.
    habilidadDisponible = false;
    modoHabilidad = false;

    if (tipo === "extra") {
      // "extra" es la única habilidad que no cede el turno automáticamente:
      // primero comprobamos si esa ficha de regalo, ella sola, ya te ha
      // hecho ganar o ha llenado el tablero (mismas comprobaciones que
      // hace finalizarTurnoJugador para una jugada normal).
      const resultado = comprobarGanador(tablero);
      if (resultado === "X") {
        renderTablero();
        return ganarRonda();
      }
      if (tableroLleno(tablero)) {
        renderTablero();
        return empatarRonda();
      }
      // El tablero sigue vivo: el jugador conserva su turno y hace su
      // jugada normal a continuación, con la ficha extra ya puesta.
      renderTablero();
      actualizarBotonHabilidad();
      actualizarMensaje("¡Ficha extra colocada! Ahora haz tu jugada normal.");
      return;
    }

    // "robar" y "bloquear" sí cuentan como el turno completo del
    // jugador, así que aquí terminamos su turno normalmente.
    renderTablero();
    actualizarBotonHabilidad();
    finalizarTurnoJugador();
    return;
  }

  // --- Jugada normal (sin ninguna habilidad activa) ---
  if (tablero[indice] !== null || bloqueadas.includes(indice)) return; // casilla ocupada o congelada: no se puede jugar ahí
  tablero[indice] = "X";
  historialJugador.push(indice);
  renderTablero();
  finalizarTurnoJugador();
}

// ============================================================
// 9. FLUJO DE TURNOS
// ============================================================

function finalizarTurnoJugador() {
  const resultado = comprobarGanador(tablero);
  if (resultado === "X") return ganarRonda();
  if (tableroLleno(tablero)) return empatarRonda();

  turno = "jefe";
  renderTablero(); // IMPORTANTE: vuelve a pintar para que las casillas se
                    // deshabiliten ya durante el turno del jefe, no solo
                    // al final. Si se te olvida este renderTablero() aquí,
                    // el tablero se queda con el aspecto "clicable" del
                    // turno anterior aunque el juego ya no acepte clicks.
  actualizarBotonHabilidad();
  actualizarMensaje(`Turno de ${jefes[jefeActual].nombre}...`);
  setTimeout(turnoJefe, 600); // pequeña pausa para que se note el turno del jefe
}

function turnoJefe() {
  const PROBABILIDAD_TRAMPA = 0.35; // 35% de posibilidades CADA turno de jefe, no un turno fijo (ver Autopsia en el README)
  let mensajeTrampa = "";

  // trampaUsada limita la trampa a una vez por ronda; si no toca trampa
  // (o ya se usó), el jefe simplemente mueve según su dificultad.
  if (!trampaUsada && Math.random() < PROBABILIDAD_TRAMPA) {
    trampaUsada = true;
    mensajeTrampa = ejecutarTrampa(jefes[jefeActual].trampa);
  } else {
    const indice = elegirMovimientoJefe(jefes[jefeActual].dificultad);
    if (indice !== undefined) {
      tablero[indice] = "O";
      historialJefe.push(indice);
    }
  }

  const resultado = comprobarGanador(tablero);
  if (resultado === "O") {
    renderTablero(); // turno sigue siendo "jefe": el tablero queda bloqueado
    return perderVida(); // hasta que prepararRonda() lo reinicie
  }
  if (tableroLleno(tablero)) {
    renderTablero();
    return empatarRonda();
  }

  // Solo aquí, con el turno ya decidido de verdad, pintamos el tablero.
  turno = "jugador";
  renderTablero();
  actualizarBotonHabilidad();
  actualizarMensaje(
    mensajeTrampa ? `${mensajeTrampa} Ahora, tu turno.` : "Tu turno",
    Boolean(mensajeTrampa)
  );
}

// ============================================================
// 10. RESULTADOS DE RONDA
// ============================================================

// Tiene que coincidir con la duración de "animation: muerte" en style.css
// (0.7s): si un día cambias una de las dos, cambia también la otra, o el
// jefe siguiente aparecerá antes de que termine la animación del anterior.
const DURACION_MUERTE_MS = 700;

// Suelta unos cuantos cuadraditos de colores cayendo, solo para la victoria final.
// Cada pieza es un <div class="confeti"> (su forma y su caída están en
// style.css); aquí solo se decide, por cada una, DÓNDE empieza (left al
// azar), DE QUÉ COLOR es y CUÁNTO tarda en caer, y se borra sola del DOM
// en cuanto termina su animación para no dejar basura acumulada.
function lanzarConfeti() {
  const colores = ["#2f855a", "#553c9a", "#9b2c2c", "#ecc94b", "#3182ce"];
  for (let i = 0; i < 26; i++) {
    const pieza = document.createElement("div");
    pieza.className = "confeti";
    pieza.style.left = `${Math.random() * 100}vw`;
    pieza.style.background = colores[Math.floor(Math.random() * colores.length)];
    pieza.style.animationDuration = `${1.4 + Math.random() * 1.2}s`;
    document.body.appendChild(pieza);
    pieza.addEventListener("animationend", () => pieza.remove());
  }
}

// Se llama en cuanto el jugador gana la ronda actual. Se divide en dos
// mitades separadas por un setTimeout: primero se deja ver morir al
// jefe (con el tablero ya bloqueado), y SOLO cuando esa animación ha
// terminado se avanza de verdad al siguiente jefe. Si avanzáramos antes,
// el jugador vería aparecer al jefe nuevo a mitad de la animación del
// anterior, que quedaría muy raro.
function ganarRonda() {
  rondasGanadas++;

  // Bloqueamos el tablero y lanzamos la animación de "muerte" del jefe
  // ANTES de tocar jefeActual, para poder seguir mostrando su nombre.
  turno = "fin";
  renderTablero();
  actualizarBotonHabilidad();
  actualizarIndicadores();
  actualizarMensaje(`¡Has vencido a ${jefes[jefeActual].nombre}!`);
  elMonstruo.classList.add("derrotado");

  // Esperamos a que termine la animación antes de preparar la siguiente ronda,
  // para que el jugador vea morir al jefe en vez de que desaparezca de golpe.
  setTimeout(() => {
    jefeActual++;

    if (jefeActual >= jefes.length) {
      // Has vencido a los 3: prepararRonda() ya deja el tablero limpio y
      // reconstruye el monstruo (aquí, el del jefe 0 = Novato, por si
      // el jugador pulsa R y quiere dar otra vuelta), pero justo después
      // forzamos turno = "fin" para que ese tablero limpio NO sea
      // jugable: la partida ha terminado del todo, no es una ronda más.
      jefeActual = 0;
      prepararRonda();
      turno = "fin";
      renderTablero();
      actualizarBotonHabilidad();
      actualizarMensaje("🏆 ¡Has vencido a los 3 jefes! Pulsa R para volver a jugar.");
      lanzarConfeti();
      return;
    }

    // Queda algún jefe más: prepararRonda() ya deja turno = "jugador" y
    // dibuja al jefe siguiente (actualizarMonstruo se llama dentro de ella).
    prepararRonda();
    actualizarMensaje(`¡Has ganado! Empieza el siguiente jefe: ${jefes[jefeActual].nombre}`);
  }, DURACION_MUERTE_MS);
}

function empatarRonda() {
  actualizarMensaje("Empate. Pulsa R para repetir contra el mismo jefe.");
  turno = "jugador";
  actualizarBotonHabilidad();
}

function perderVida() {
  vidas--;
  if (vidas <= 0) {
    actualizarMensaje(`💀 Game Over contra ${jefes[jefeActual].nombre}. Pulsa R para empezar de nuevo.`);
    jefeActual = 0;
    vidas = 3;
    rondasGanadas = 0;
    prepararRonda();
    return;
  }
  actualizarMensaje(`Has perdido esta partida contra ${jefes[jefeActual].nombre}. Te quedan ${vidas} vidas.`);
  prepararRonda();
}

// Reinicia el tablero para un nuevo intento, manteniendo vidas y rondas
// ganadas. Se llama tanto al empezar la partida como tras cada empate,
// derrota o victoria de ronda: es el único sitio que resetea TODO el
// estado de una ronda, para no tener esa lógica repetida en cada caso.
function prepararRonda() {
  tablero = Array(9).fill(null);
  bloqueadas = [];
  historialJugador = [];
  historialJefe = [];
  turno = "jugador";
  habilidadDisponible = true;
  modoHabilidad = false;
  trampaUsada = false;

  actualizarMonstruo(); // redibuja el jefe actual (color + pixel art) y le quita "derrotado"
  renderTablero();
  actualizarIndicadores();
  actualizarBotonHabilidad();
}

// El botón / tecla "R": reinicia solo el intento actual (no el progreso).
function reiniciarIntento() {
  prepararRonda();
  actualizarMensaje("Tu turno");
}

// ============================================================
// 11. EVENTOS GLOBALES Y ARRANQUE DEL JUEGO
// ============================================================

// Solo TRES listeners en total para todo el juego: uno por delegación
// en el tablero (las 9 casillas comparten este mismo), uno en el botón
// de habilidad y uno en el de reiniciar.
elTablero.addEventListener("click", manejarClicTablero);
elBotonHabilidad.addEventListener("click", usarHabilidad);
elBotonReiniciar.addEventListener("click", reiniciarIntento);

// Atajos de teclado globales, en el propio "document" (no en un elemento
// concreto) para que funcionen esté el foco donde esté en la página.
document.addEventListener("keydown", (evento) => {
  const tecla = evento.key.toLowerCase(); // toLowerCase para que "R" y "r" hagan lo mismo
  if (tecla === "r") reiniciarIntento();
  if (tecla === "d") document.body.classList.toggle("dark"); // truco secreto (bonus)
});

// Estado inicial al cargar la página: usamos la misma función que reinicia
// una ronda cualquiera, así no hay una versión "de arranque" duplicada.
prepararRonda();
