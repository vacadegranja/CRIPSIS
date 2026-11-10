const biomeColors = {
  "home-line-a": "#c4a060",
  "home-line-t": "#868c3f",
  "home-line-w": "#6087a9",
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll(".home-sections > a").forEach((link) => {
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

    const color = biomeColors[
      [...link.classList].find((className) => biomeColors[className])
    ];

    if (!color) {
      window.location.assign(link.href);
      return;
    }

    const bounds = link.getBoundingClientRect();
    const transition = document.createElement("div");
    transition.className = "page-transition";
    transition.setAttribute("aria-hidden", "true");
    transition.style.backgroundColor = color;
    transition.style.setProperty("--transition-top", `${bounds.top}px`);
    transition.style.setProperty(
      "--transition-bottom",
      `${Math.max(0, window.innerHeight - bounds.bottom)}px`,
    );
    document.body.append(transition);

    requestAnimationFrame(() => {
      transition.classList.add("is-active");
    });

    window.setTimeout(() => {
      window.location.assign(link.href);
    }, 750);
  });
});