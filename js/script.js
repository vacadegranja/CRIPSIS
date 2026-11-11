const biomeColors = {
  "home-line-a": "#c4a060",
  "home-line-t": "#868c3f",
  "home-line-w": "#6087a9",
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const titleLetters = [...document.querySelectorAll("h1 span")];

let titleIntroFrame = null;
let lastPointerPosition = null;

titleLetters.forEach((letter) => {
  letter.addEventListener("pointerenter", () => {
    letter.classList.add("is-hovered");
  });
  letter.addEventListener("pointerleave", () => {
    letter.classList.remove("is-hovered");
  });
  letter.addEventListener("focus", () => {
    letter.classList.add("is-hovered");
  });
  letter.addEventListener("blur", () => {
    letter.classList.remove("is-hovered");
  });
});

window.addEventListener("pointermove", (event) => {
  if (event.pointerType === "mouse" || event.pointerType === "pen") {
    lastPointerPosition = { x: event.clientX, y: event.clientY };
  }
}, { passive: true });

function refreshTitleHover() {
  titleLetters.forEach((letter) => letter.classList.remove("is-hovered"));

  if (!lastPointerPosition) {
    return;
  }

  const hoveredLetter = document
    .elementFromPoint(lastPointerPosition.x, lastPointerPosition.y)
    ?.closest("h1 span");
  hoveredLetter?.classList.add("is-hovered");
}

function restartTitleIntro() {
  if (titleIntroFrame !== null) {
    cancelAnimationFrame(titleIntroFrame);
  }

  titleIntroFrame = requestAnimationFrame(() => {
    titleIntroFrame = null;
    document.body.classList.remove("title-intro-active");
    void document.body.offsetWidth;
    document.body.classList.add("title-intro-active");
    refreshTitleHover();
  });
}

window.addEventListener("load", restartTitleIntro);
window.addEventListener("pageshow", restartTitleIntro);

function startPageTransition(link, color, origin, fromCenter) {
  const bounds = fromCenter
    ? {
        top: window.innerHeight / 2,
        right: window.innerWidth / 2,
        bottom: window.innerHeight / 2,
        left: window.innerWidth / 2,
      }
    : origin.getBoundingClientRect();
  const transition = document.createElement("div");
  transition.className = "page-transition";
  transition.setAttribute("aria-hidden", "true");
  transition.style.backgroundColor = color;
  transition.style.setProperty("--transition-top", `${Math.max(0, bounds.top)}px`);
  transition.style.setProperty(
    "--transition-right",
    `${Math.max(0, window.innerWidth - bounds.right)}px`,
  );
  transition.style.setProperty(
    "--transition-bottom",
    `${Math.max(0, window.innerHeight - bounds.bottom)}px`,
  );
  transition.style.setProperty("--transition-left", `${Math.max(0, bounds.left)}px`);
  document.body.append(transition);

  requestAnimationFrame(() => {
    transition.classList.add("is-active");
  });

  window.setTimeout(() => {
    window.location.assign(link.href);
  }, 750);
}

function enablePageTransition(link, color, origin = link, fromCenter = false) {
  link.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target === "_blank" ||
      reducedMotion.matches
    ) {
      return;
    }

    event.preventDefault();
    startPageTransition(link, color, origin, fromCenter);
  });
}

document.querySelectorAll(".home-sections > a").forEach((link) => {
  const color = [...link.classList]
    .map((className) => biomeColors[className])
    .find(Boolean);

  if (color) {
    enablePageTransition(link, color);
  }
});

document.querySelectorAll(".top-nav a").forEach((link) => {
  const logo = link.querySelector("svg");

  if (logo) {
    enablePageTransition(link, "#000000", logo, true);
  }
});