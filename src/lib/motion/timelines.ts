import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CONTENT_IN,
  EASE_IN,
  EASE_OUT,
  HOME_TITLE,
  HOME_UI,
  IN_VIEW,
  LETTER_TITLE,
  PAGE_OUT,
  STAGGER,
} from "../../config/motion.js";

gsap.registerPlugin(ScrollTrigger);

export type PageKind = "home" | "element" | "animal" | "info" | "cam" | "page";

const CLEAR = "opacity,visibility,transform,filter,transition";
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const $$ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(selector));

const toElements = (targets: string | HTMLElement[]) =>
  typeof targets === "string" ? $$(targets) : targets;

/** Elementos ocultos por `html.motion-pending` hasta que arranca la timeline. */
export function releasePending() {
  document.documentElement.classList.remove("motion-pending");
}

/* ---------------------------------------------------------------------- */
/* In-view (ScrollTrigger)                                                  */
/* ---------------------------------------------------------------------- */

let inViewTriggers: ScrollTrigger[] = [];

/** Elimina los triggers de la vista anterior (se llama antes de cada swap). */
export function killInView() {
  inViewTriggers.forEach((trigger) => trigger.kill());
  inViewTriggers = [];
}

/** Separa los elementos visibles ahora de los que quedan bajo el pliegue. */
function splitByViewport(elements: HTMLElement[]) {
  const limit = window.innerHeight * 0.92;
  const now: HTMLElement[] = [];
  const later: HTMLElement[] = [];
  elements.forEach((el) => (el.getBoundingClientRect().top < limit ? now : later).push(el));
  return { now, later };
}

function showInView(elements: Element[]) {
  gsap.to(elements, {
    autoAlpha: 1,
    y: 0,
    duration: STAGGER.duration,
    stagger: STAGGER.each,
    ease: STAGGER.ease,
    overwrite: true,
  });
}

function hideInView(elements: Element[]) {
  gsap.to(elements, {
    autoAlpha: 0,
    y: STAGGER.distance,
    duration: STAGGER.duration,
    stagger: STAGGER.each,
    ease: "power2.in",
    overwrite: true,
  });
}

/** Oculta los elementos y los muestra con el stagger compartido al entrar en el viewport. */
function inView(elements: HTMLElement[]) {
  if (!elements.length) return;
  if (reducedMotion()) return;
  const hiddenState = { autoAlpha: 0, y: STAGGER.distance };
  gsap.set(elements, { ...hiddenState, transition: "none" });

  const triggers = ScrollTrigger.batch(elements, {
    start: IN_VIEW.start,
    interval: IN_VIEW.batchInterval,
    once: !IN_VIEW.replay,
    onEnter: (batch) =>
      IN_VIEW.replay
        ? showInView(batch)
        : gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: STAGGER.duration,
            stagger: STAGGER.each,
            ease: STAGGER.ease,
            overwrite: true,
            clearProps: CLEAR,
          }),
    ...(IN_VIEW.replay && {
      onLeaveBack: (batch: Element[]) => hideInView(batch),
    }),
  });
  inViewTriggers.push(...triggers);
}

/** Permite que los elementos visibles desde el inicio también se reviertan al subir. */
function trackInitiallyVisible(elements: HTMLElement[]) {
  if (!IN_VIEW.replay || reducedMotion() || !elements.length) return;

  let hasLeftBack = false;
  const triggers = ScrollTrigger.batch(elements, {
    start: IN_VIEW.start,
    interval: IN_VIEW.batchInterval,
    onEnter: (batch) => {
      if (!hasLeftBack) return;
      hasLeftBack = false;
      showInView(batch);
    },
    onLeaveBack: (batch) => {
      hasLeftBack = true;
      hideInView(batch);
    },
  });
  inViewTriggers.push(...triggers);
}

/* ---------------------------------------------------------------------- */
/* Piezas reutilizables                                                     */
/* ---------------------------------------------------------------------- */

/** Bloque estándar: opacidad 0 → 1 y y 30 → 0 en stagger; limpia estilos al terminar. */
function contentIn(targets: gsap.TweenTarget, vars: gsap.TweenVars = {}, from: gsap.TweenVars = {}) {
  return gsap.fromTo(
    targets,
    {
      autoAlpha: 0,
      y: CONTENT_IN.offsetY,
      ...(CONTENT_IN.blur ? { filter: `blur(${CONTENT_IN.blur}px)` } : {}),
      // Evita que las transiciones CSS del elemento compitan con GSAP.
      transition: "none",
      ...from,
    },
    {
      autoAlpha: 1,
      y: 0,
      ...(CONTENT_IN.blur ? { filter: "blur(0px)" } : {}),
      duration: CONTENT_IN.duration,
      stagger: CONTENT_IN.stagger,
      ease: STAGGER.ease,
      clearProps: CLEAR,
      ...vars,
    },
  );
}

/**
 * Añade a la timeline los elementos visibles y deja el resto en modo in-view.
 * Es la forma estándar de mostrar listas largas (tarjetas, secciones, etc.).
 */
function revealIn(
  tl: gsap.core.Timeline,
  targets: string | HTMLElement[],
  position: gsap.Position,
  vars: gsap.TweenVars = {},
) {
  const { now, later } = splitByViewport(toElements(targets));
  if (now.length) {
    tl.add(contentIn(now, vars), position);
    trackInitiallyVisible(now);
  }
  inView(later);
  return tl;
}

function navIn() {
  return contentIn(".top-nav > *", { duration: 0.7, stagger: 0.08 }, { y: -16 });
}

/**
 * Títulos LetterTitle: entran letra a letra, se sostienen y luego
 * pasan al reposo (opacidad baja) en orden aleatorio.
 */
function letterTitleIn(root: ParentNode = document) {
  const tl = gsap.timeline();
  const title = root.querySelector(".letter-title");
  if (!title) return tl;
  const words = $$(":scope > span", title);
  const letters = $$(":scope > span > span", title);
  const c = LETTER_TITLE;

  tl.set(words, { opacity: 1, filter: "blur(0px)", transition: "none" })
    .fromTo(
      letters,
      { autoAlpha: 0, yPercent: c.inOffset * 100, filter: "blur(8px)", transition: "none" },
      {
        autoAlpha: 1,
        yPercent: 0,
        filter: "blur(0px)",
        duration: c.inDuration,
        stagger: c.inStagger,
        ease: EASE_OUT,
      },
    )
    .to(
      gsap.utils.shuffle([...letters]),
      {
        opacity: c.restOpacity,
        filter: `blur(${c.restBlur}px)`,
        duration: c.restDuration,
        stagger: c.restStagger,
        ease: "sine.inOut",
      },
      `+=${c.holdSeconds}`,
    )
    // Las palabras también llevan opacidad de reposo en CSS: se igualan antes de limpiar.
    .to(words, { opacity: c.restOpacity, filter: `blur(${c.restBlur}px)`, duration: c.restDuration }, "<")
    .set([...words, ...letters], { clearProps: CLEAR });

  return tl;
}

/* ---------------------------------------------------------------------- */
/* Entradas por vista                                                       */
/* ---------------------------------------------------------------------- */

export interface HomeTitleController {
  timeline: gsap.core.Timeline;
  destroy: () => void;
}

/**
 * Home: todo oculto → aparece el título → tras HOME_TITLE.holdSeconds
 * los caracteres se ocultan en orden aleatorio. El hover los vuelve a mostrar.
 */
export function homeIntro(): HomeTitleController {
  const c = HOME_TITLE;
  const ui = HOME_UI;
  const glyphs = $$<SVGGElement>(".hero-home .home-logo-glyph");
  const hidden = { opacity: c.hiddenOpacity, filter: `blur(${c.glyphBlur}px)`, yPercent: 0 };
  const shown = { opacity: 1, filter: "blur(0px)", yPercent: 0 };
  let titleHidden = false;

  gsap.set(glyphs, { opacity: 0, filter: `blur(${c.glyphBlur}px)`, yPercent: c.glyphInOffset * 100 });
  gsap.set([".top-nav > *", ".home-tagline", ".home-line h3", "footer"], { autoAlpha: 0 });
  releasePending();

  const shuffled = gsap.utils.shuffle([...glyphs]);
  // Bloquea el modo elección (CSS .is-choice-active) hasta que el título se haya mostrado.
  document.body.classList.add("home-intro-running");
  const tl = gsap.timeline({ delay: c.startDelay });

  tl.addLabel("title")
    .to(glyphs, {
      ...shown,
      duration: c.glyphInDuration,
      stagger: { each: c.glyphInStagger, from: c.glyphInFrom as gsap.StaggerVars["from"] },
      ease: EASE_OUT,
    })
    .add(navIn(), `title+=${ui.delay}`)
    .add(
      contentIn(
        [".home-tagline", ".home-line h3"],
        { duration: ui.duration, stagger: ui.stagger },
        { y: ui.offsetY },
      ),
      `title+=${ui.delay + 0.1}`,
    )
    .add(contentIn("footer", { duration: 0.6 }), `title+=${ui.delay + 0.2}`)
    .addLabel("hide", `title+=${c.holdSeconds + c.glyphInDuration}`)
    .call(() => {
      titleHidden = true;
      document.body.classList.remove("home-intro-running");
    }, [], "hide");

  shuffled.forEach((glyph, index) => {
    const jitter = gsap.utils.random(0, c.glyphOutJitter);
    tl.to(
      glyph,
      { ...hidden, duration: c.glyphOutDuration, ease: "sine.inOut" },
      `hide+=${index * c.glyphOutStagger + jitter}`,
    );
  });

  // Hover / foco: muestra el carácter y lo vuelve a ocultar al salir.
  const listeners: Array<[Element, string, EventListener]> = [];
  glyphs.forEach((glyph) => {
    const enter = () => {
      gsap.to(glyph, { ...shown, yPercent: -4, duration: c.hoverInDuration, ease: EASE_OUT, overwrite: "auto" });
    };
    const leave = () => {
      gsap.to(glyph, {
        ...(titleHidden ? hidden : shown),
        duration: c.hoverOutDuration,
        ease: "sine.inOut",
        overwrite: "auto",
      });
    };
    for (const [type, fn] of [
      ["pointerenter", enter],
      ["focus", enter],
      ["pointerleave", leave],
      ["blur", leave],
    ] as const) {
      glyph.addEventListener(type, fn);
      listeners.push([glyph, type, fn]);
    }
  });

  if (reducedMotion()) tl.progress(1);

  return {
    timeline: tl,
    destroy: () => {
      tl.kill();
      listeners.forEach(([el, type, fn]) => el.removeEventListener(type, fn));
    },
  };
}

function hideForIntro(selectors: string[]) {
  gsap.set(selectors.join(","), { autoAlpha: 0 });
  releasePending();
}

export function elementIntro() {
  hideForIntro([".top-nav > *", ".category-hero > p"]);
  const tl = gsap.timeline();
  tl.add(navIn())
    .add(letterTitleIn($$(".category-hero")[0] ?? document), 0.1)
    .add(contentIn(".category-hero > p"), 0.45);
  revealIn(tl, ".animal-grid > *, .empty-state", 0.6);
  revealIn(tl, "footer", 0.9);
  return tl;
}

export function animalIntro() {
  hideForIntro([".top-nav > *", ".animal-hero .element-label", ".animal-hero .scientific-name"]);
  const tl = gsap.timeline();
  tl.add(navIn())
    .add(contentIn(".animal-hero .element-label"), 0.05)
    .add(letterTitleIn($$(".animal-hero")[0] ?? document), 0.15)
    .add(contentIn(".animal-hero .scientific-name"), 0.45);
  revealIn(tl, ".animal-hero-image", 0.55, { duration: 1.2 });
  revealIn(tl, ".animal-details > section, .animal-facts > div", 0.85);
  revealIn(tl, ".related-section > h2, .related-section > p, .related-controls, .related-grid", 1.1);
  revealIn(tl, "footer", 1.2);
  return tl;
}

export function infoIntro() {
  hideForIntro([".top-nav > *"]);
  const tl = gsap.timeline();
  tl.add(navIn()).add(
    contentIn(".info-page h1", { letterSpacing: "0.04em" }, { letterSpacing: "0.4em" }),
    0.1,
  );
  // Las tarjetas flotan con una animación CSS de transform: el stagger se aprecia en la opacidad.
  revealIn(tl, ".info-questions > *", 0.4);
  revealIn(tl, "footer", 1);
  return tl;
}

export function camIntro() {
  hideForIntro([".top-nav > *"]);
  const tl = gsap.timeline();
  tl.add(navIn()).add(contentIn(".cam-page", { duration: 1.2 }), 0.2);
  return tl;
}

export function genericIntro() {
  hideForIntro([".top-nav > *"]);
  const tl = gsap.timeline();
  tl.add(navIn());
  revealIn(tl, "#main-content > *", 0.15);
  revealIn(tl, "footer", 0.4);
  return tl;
}

export function playIntro(kind: PageKind) {
  let tl: gsap.core.Timeline;
  switch (kind) {
    case "element":
      tl = elementIntro();
      break;
    case "animal":
      tl = animalIntro();
      break;
    case "info":
      tl = infoIntro();
      break;
    case "cam":
      tl = camIntro();
      break;
    default:
      tl = genericIntro();
  }
  if (reducedMotion()) tl.progress(1);
  ScrollTrigger.refresh();
  return tl;
}

/* ---------------------------------------------------------------------- */
/* Salidas                                                                  */
/* ---------------------------------------------------------------------- */

/** Salida común: el mismo stagger que la bienvenida (opacidad 1 → 0, y 0 → -30). */
export function pageOutro(kind: PageKind) {
  const tl = gsap.timeline({ defaults: { ease: EASE_IN, duration: PAGE_OUT.duration } });
  const out = { autoAlpha: 0, y: PAGE_OUT.offsetY, stagger: PAGE_OUT.stagger, overwrite: true };

  if (kind === "home") {
    tl.to([".hero-home", ".home-line"], out).to([".top-nav", "footer"], { autoAlpha: 0 }, 0);
    return tl;
  }

  const visible = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  };
  const blocks = $$(
    "#main-content .hero > *, #main-content .animal-details > *, #main-content .animal-grid > *, " +
      "#main-content .info-page h1, #main-content .info-questions > *, #main-content .related-section > *, " +
      "#main-content .cam-page, #main-content .empty-state",
  ).filter(visible);

  tl.to(".top-nav > *", { ...out, stagger: 0.04 }, 0)
    .to(blocks, out, 0)
    .to("footer", { autoAlpha: 0 }, 0);
  return tl;
}
