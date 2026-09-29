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
  { nombre: "Maestro",   dificultad: "optimo",  trampa: "deshacerInverso", habilidad: "deshacer" },
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
// distintas: "robar" necesita una casilla con O, "bloquear" una vacía).
function casillaEsClicable(indice) {
  const valor = tablero[indice];

  if (modoHabilidad) {
    const tipo = jefes[jefeActual].habilidad;
    if (tipo === "robar") return valor === "O";
    if (tipo === "bloquear") return valor === null && !bloqueadas.includes(indice);
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
function construirPixelArt(contenedor, mitad) {
  const filas = mitad.length;
  const columnas = mitad[0].length * 2 - 1; // la última columna del medio patrón es el eje central

  contenedor.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;
  contenedor.style.gridTemplateRows = `repeat(${filas}, 1fr)`;
  contenedor.innerHTML = "";

  mitad.forEach((mediaFila) => {
    const mitadInvertida = mediaFila.slice(0, -1).split("").reverse().join("");
    const filaCompleta = mediaFila + mitadInvertida;

    for (const caracter of filaCompleta) {
      const pixel = document.createElement("div");
      pixel.className = "pixel";
      if (caracter !== ".") {
        pixel.classList.add(PIXEL_CLASES[caracter]);
      } else {
        pixel.style.visibility = "hidden"; // hueco: ocupa espacio en la rejilla pero no se ve
      }
      contenedor.appendChild(pixel);
    }
  });
}

// Pinta el color y el pixel art del jefe actual. Se llama cada vez que
// cambiamos de jefe (o reiniciamos), nunca durante la ronda en curso.
function actualizarMonstruo() {
  const monstruo = monstruos[jefeActual];
  document.documentElement.style.setProperty("--color-jefe", monstruo.colorJefe);
  document.documentElement.style.setProperty("--color-jefe-claro", monstruo.colorJefeClaro);
  elMonstruo.classList.remove("derrotado");
  construirPixelArt(elMonstruo, monstruo.mitad);
}

function actualizarBotonHabilidad() {
  const nombresHabilidad = {
    robar: "Robar casilla",
    bloquear: "Bloquear casilla",
    deshacer: "Deshacer jugada del jefe",
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

  if (tipo === "deshacer") {
    // Esta habilidad no necesita elegir una casilla: actúa al momento.
    if (historialJefe.length === 0) return;
    const indice = historialJefe.pop();
    tablero[indice] = null;
    habilidadDisponible = false;
    renderTablero();
    actualizarBotonHabilidad();
    finalizarTurnoJugador();
    return;
  }

  // "robar" y "bloquear" necesitan que el jugador elija una casilla objetivo,
  // así que solo activamos el "modo habilidad" y esperamos ese click.
  modoHabilidad = true;
  renderTablero(); // recalcula qué casillas son clicables en este modo
  actualizarBotonHabilidad();
  actualizarMensaje(
    tipo === "robar"
      ? "Elige una casilla del jefe (O) para robarla"
      : "Elige una casilla vacía para bloquearla"
  );
}

// ============================================================
// 8. CLICKS EN EL TABLERO (delegación de eventos: UN solo listener)
// ============================================================

function manejarClicTablero(evento) {
  if (turno !== "jugador") return;
  if (!evento.target.classList.contains("casilla")) return;

  const indice = Number(evento.target.dataset.index);

  // --- Estamos esperando el objetivo de una habilidad ---
  if (modoHabilidad) {
    const tipo = jefes[jefeActual].habilidad;

    if (tipo === "robar" && tablero[indice] === "O") {
      tablero[indice] = "X";
      historialJefe = historialJefe.filter((i) => i !== indice);
      historialJugador.push(indice);
    } else if (tipo === "bloquear" && tablero[indice] === null && !bloqueadas.includes(indice)) {
      bloqueadas.push(indice);
    } else {
      return; // click no válido para esta habilidad: seguimos esperando
    }

    habilidadDisponible = false;
    modoHabilidad = false;
    renderTablero();
    actualizarBotonHabilidad();
    finalizarTurnoJugador();
    return;
  }

  // --- Jugada normal ---
  if (tablero[indice] !== null || bloqueadas.includes(indice)) return;
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
  const PROBABILIDAD_TRAMPA = 0.35;
  let mensajeTrampa = "";

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

const DURACION_MUERTE_MS = 700; // debe coincidir con la duración de @keyframes muerte en style.css

// Suelta unos cuantos cuadraditos de colores cayendo, solo para la victoria final.
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
      jefeActual = 0; // se prepara para una nueva vuelta si el jugador reinicia
      prepararRonda();
      turno = "fin"; // la partida ha terminado del todo: el tablero queda bloqueado
      renderTablero();
      actualizarBotonHabilidad();
      actualizarMensaje("🏆 ¡Has vencido a los 3 jefes! Pulsa R para volver a jugar.");
      lanzarConfeti();
      return;
    }

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

// Reinicia el tablero para un nuevo intento, manteniendo vidas y rondas ganadas.
function prepararRonda() {
  tablero = Array(9).fill(null);
  bloqueadas = [];
  historialJugador = [];
  historialJefe = [];
  turno = "jugador";
  habilidadDisponible = true;
  modoHabilidad = false;
  trampaUsada = false;

  actualizarMonstruo();
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

elTablero.addEventListener("click", manejarClicTablero);
elBotonHabilidad.addEventListener("click", usarHabilidad);
elBotonReiniciar.addEventListener("click", reiniciarIntento);

document.addEventListener("keydown", (evento) => {
  const tecla = evento.key.toLowerCase();
  if (tecla === "r") reiniciarIntento();
  if (tecla === "d") document.body.classList.toggle("dark"); // truco secreto (bonus)
});

// Estado inicial al cargar la página.
prepararRonda();
