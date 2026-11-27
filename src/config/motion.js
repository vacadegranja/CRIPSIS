/**
 * Constantes de animación (GSAP). Todos los tiempos están en segundos.
 * Modifica estos valores para ajustar las entradas, salidas y el título del home.
 */

/** Curvas por defecto. */
export const EASE_IN = "power3.in";
export const EASE_OUT = "power3.out";
export const EASE_IN_OUT = "power2.inOut";

/**
 * Efecto stagger compartido: la pantalla de bienvenida sale con él
 * (opacidad 1 → 0, y 0 → -30) y los interiores entran con su espejo
 * (opacidad 0 → 1, y 30 → 0) y salen igual que la bienvenida.
 */
export const STAGGER = {
  duration: 0.8,
  each: 0.12,
  /** Desplazamiento en px. Salida: 0 → -distance. Entrada: distance → 0. */
  distance: 30,
  ease: "power2.out",
};

/** Pantalla de bienvenida / preloader. */
export const WELCOME = {
  /** true = solo se muestra la primera vez por sesión del navegador. */
  oncePerSession: false,
  /** Tiempo mínimo visible antes de habilitar el CTA (aunque todo haya cargado). */
  minLoadSeconds: 1.2,
  /** Tiempo máximo esperando recursos; después se habilita el CTA igualmente. */
  maxLoadSeconds: 8,
  /** Retraso entre la entrada del título, la descripción y la barra. */
  introStagger: 0.18,
  /** Fundido del fondo de la pantalla tras el stagger de salida. */
  backdropFade: 0.6,
};

/** Elementos que aparecen al entrar en el viewport con el scroll. */
export const IN_VIEW = {
  /** Punto de disparo de ScrollTrigger ("borde del elemento" "borde del viewport"). */
  start: "top 88%",
  /** Agrupa elementos que entran a la vez para aplicarles el stagger. */
  batchInterval: 0.12,
  /** true = se vuelven a ocultar al salir por arriba / abajo. */
  replay: false,
};

/** Título del home (logo CRIPSIS). */
export const HOME_TITLE = {
  /** Espera tras cargar la página antes de mostrar el título. */
  startDelay: 0.25,
  /** Duración de entrada de cada carácter. */
  glyphInDuration: 0.9,
  /** Separación entre la entrada de un carácter y el siguiente. */
  glyphInStagger: 0.08,
  /** Orden de entrada: "start" | "center" | "end" | "edges" | "random". */
  glyphInFrom: "start",
  /** Desplazamiento vertical inicial de cada carácter (fracción de su alto). */
  glyphInOffset: 0.35,
  /** Desenfoque inicial / oculto de cada carácter, en px. */
  glyphBlur: 10,
  /** Tiempo que el título permanece completo antes de ocultarse. */
  holdSeconds: 3,
  /** Duración de salida de cada carácter. */
  glyphOutDuration: 0.7,
  /** Separación media entre la salida de un carácter y otro (orden aleatorio). */
  glyphOutStagger: 0.14,
  /** Variación aleatoria añadida a cada retraso de salida (0 = ritmo constante). */
  glyphOutJitter: 0.12,
  /** Opacidad final de los caracteres ocultos (0 = invisibles). */
  hiddenOpacity: 0,
  /** Hover sobre un carácter oculto: entrada y salida. */
  hoverInDuration: 0.35,
  hoverOutDuration: 0.6,
};

/** Resto de elementos del home (nav, tagline, botones). */
export const HOME_UI = {
  /** Retraso tras el inicio de la entrada del título. */
  delay: 0.6,
  duration: 0.8,
  stagger: 0.1,
  offsetY: 24,
};

/** Títulos con letras (LetterTitle) de las páginas interiores. */
export const LETTER_TITLE = {
  inDuration: 0.8,
  inStagger: 0.045,
  inOffset: 0.3,
  /** Tiempo con el título completo antes de pasar al estado de reposo. */
  holdSeconds: 1.2,
  restDuration: 0.6,
  restStagger: 0.05,
  /** Debe coincidir con `.letter-title span` en global.css. */
  restOpacity: 0.12,
  restBlur: 3,
};

/** Entrada genérica de bloques de contenido. */
export const CONTENT_IN = {
  duration: STAGGER.duration,
  stagger: STAGGER.each,
  offsetY: STAGGER.distance,
  /** Desenfoque inicial en px (0 = solo opacidad + y). */
  blur: 0,
};

/** Salida genérica de una página antes de navegar. */
export const PAGE_OUT = {
  duration: 0.5,
  stagger: STAGGER.each * 0.6,
  offsetY: -STAGGER.distance,
  blur: 0,
};
