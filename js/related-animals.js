function initializeRelatedAnimals() {
  document.querySelectorAll("[data-related]").forEach((root) => {
    if (root.dataset.relatedReady) return;

    const cards = [...root.querySelectorAll("[data-related-card]")];
    const buttons = [...root.querySelectorAll("[data-related-mode]")];
    const emptyState = root.querySelector("[data-related-empty]");
    const status = root.querySelector("[data-related-status]");
    if (!emptyState || !status || buttons.length === 0) return;

    root.dataset.relatedReady = "true";

    function applyFilter(mode) {
      const adaptations = (root.dataset.currentAdaptations ?? "").split(" ");
      let visibleCount = 0;

      cards.forEach((card) => {
        let matches = false;
        if (mode === "element") {
          matches = card.dataset.element === root.dataset.currentElement;
        } else if (mode === "adaptation") {
          matches =
            card.dataset.adaptations
              ?.split(" ")
              .some((adaptation) => adaptations.includes(adaptation)) ?? false;
        } else if (mode === "taxonomy") {
          matches =
            card.dataset.group === root.dataset.currentGroup ||
            card.dataset.family === root.dataset.currentFamily;
        }

        window.clearTimeout(card._relatedTransition);

        if (!matches) {
          if (!card.hidden) {
            card.classList.remove("is-entering", "is-visible");
            card.classList.add("is-leaving");
            card._relatedTransition = window.setTimeout(() => {
              card.hidden = true;
              card.classList.remove("is-leaving");
            }, 250);
          }
        } else {
          if (card.hidden) {
            card.hidden = false;
            card.classList.remove("is-leaving");
            card.classList.add("is-entering");
            requestAnimationFrame(() => {
              card.classList.add("is-visible");
              card._relatedTransition = window.setTimeout(() => {
                card.classList.remove("is-entering", "is-visible");
              }, 250);
            });
          }
          visibleCount += 1;
        }
      });

      emptyState.hidden = visibleCount > 0;
      status.textContent = `${visibleCount} ${
        visibleCount === 1 ? "animal relacionado" : "animales relacionados"
      }`;
    }

    function setMode(button) {
      buttons.forEach((modeButton) => {
        modeButton.setAttribute(
          "aria-pressed",
          String(modeButton === button),
        );
      });
      applyFilter(button.dataset.relatedMode ?? "element");
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => setMode(button));
    });

    const activeButton = buttons.find(
      (button) => button.getAttribute("aria-pressed") === "true",
    );
    setMode(activeButton ?? buttons[0]);
  });
}

initializeRelatedAnimals();
