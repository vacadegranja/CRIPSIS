import gsap from "gsap";
import { EASE_OUT, STAGGER, WELCOME } from "../../config/motion.js";

const STORAGE_KEY = "cripsis-welcome-seen";

/** La clase la añade un script inline en <head> solo en la primera carga del documento. */
export function hasWelcome() {
  return (
    document.documentElement.classList.contains("is-welcome") &&
    Boolean(document.querySelector("[data-welcome]"))
  );
}

/** Espera a que carguen fuentes e imágenes visibles, notificando el progreso (0–1). */
function waitForAssets(onProgress: (value: number) => void) {
  const images = Array.from(document.images).filter((img) => img.loading !== "lazy");
  const tasks: Promise<unknown>[] = [
    document.fonts?.ready ?? Promise.resolve(),
    ...images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          }),
    ),
  ];
  let done = 0;
  tasks.forEach((task) =>
    task.then(() => {
      done += 1;
      onProgress(done / tasks.length);
    }),
  );
  const timeout = new Promise((resolve) => setTimeout(resolve, WELCOME.maxLoadSeconds * 1000));
  const minimum = new Promise((resolve) => setTimeout(resolve, WELCOME.minLoadSeconds * 1000));
  return Promise.all([Promise.race([Promise.all(tasks), timeout]), minimum]);
}

/**
 * Muestra la pantalla de bienvenida, hace de preloader y resuelve cuando
 * el usuario pulsa "descubre" y termina el stagger de salida.
 */
export function runWelcome(): Promise<void> {
  const root = document.querySelector<HTMLElement>("[data-welcome]")!;
  const items = Array.from(root.querySelectorAll<HTMLElement>("[data-welcome-item]"));
  const loader = root.querySelector<HTMLElement>("[data-welcome-loader]");
  const bar = root.querySelector<HTMLElement>("[data-welcome-bar]");
  const percent = root.querySelector<HTMLElement>("[data-welcome-percent]");
  const cta = root.querySelector<HTMLButtonElement>("[data-welcome-cta]")!;
  const progress = { value: 0 };

  const renderProgress = () => {
    if (bar) bar.style.transform = `scaleX(${progress.value})`;
    if (percent) percent.textContent = `${Math.round(progress.value * 100)}%`;
  };

  // Entrada: título, descripción y barra en stagger (espejo de la salida).
  gsap.set(cta, { autoAlpha: 0, y: STAGGER.distance });
  gsap.fromTo(
    items.filter((item) => item !== cta),
    { autoAlpha: 0, y: STAGGER.distance },
    { autoAlpha: 1, y: 0, duration: STAGGER.duration, stagger: WELCOME.introStagger, ease: EASE_OUT },
  );

  return new Promise((resolve) => {
    waitForAssets((value) => {
      gsap.to(progress, { value, duration: 0.4, ease: "power1.out", onUpdate: renderProgress });
    }).then(() => {
      gsap.to(progress, { value: 1, duration: 0.3, onUpdate: renderProgress });
      const ready = gsap.timeline({ delay: 0.3 });
      if (loader) ready.to(loader, { autoAlpha: 0, y: -STAGGER.distance, duration: 0.4, ease: "power2.in" });
      ready
        .set(loader, { display: "none" })
        .to(cta, { autoAlpha: 1, y: 0, duration: STAGGER.duration, ease: EASE_OUT })
        .call(() => {
          cta.disabled = false;
          cta.focus({ preventScroll: true });
        });
    });

    cta.addEventListener(
      "click",
      () => {
        cta.disabled = true;
        try {
          if (WELCOME.oncePerSession) sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {
          /* almacenamiento no disponible */
        }

        // Salida: stagger de opacidad 1 → 0 e y 0 → -30.
        gsap
          .timeline({
            onComplete: () => {
              document.documentElement.classList.remove("is-welcome");
              root.remove();
              resolve();
            },
          })
          .to(items.filter((item) => item !== loader), {
            autoAlpha: 0,
            y: -STAGGER.distance,
            duration: STAGGER.duration,
            stagger: STAGGER.each,
            ease: STAGGER.ease,
          })
          .to(root, { autoAlpha: 0, duration: WELCOME.backdropFade, ease: "power1.inOut" }, "-=0.3");
      },
      { once: true },
    );
  });
}
