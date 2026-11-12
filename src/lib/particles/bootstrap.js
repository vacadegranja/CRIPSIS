import { ParticleScene } from "./ParticleScene.js";

const SCENE_KEY = "__cripsisParticleScene";

function currentTexture() {
  return document.body?.dataset.particleImage;
}

export function initializeParticleScene() {
  const canvas = document.querySelector("[data-particle-canvas]");
  if (!canvas) return;

  if (!window[SCENE_KEY]) {
    window[SCENE_KEY] = new ParticleScene({ canvas });
  }

  window[SCENE_KEY].setImage(currentTexture(), {
    immediate: !window[SCENE_KEY].currentUrl,
  });
}

initializeParticleScene();

document.addEventListener("astro:before-preparation", () => {
  window[SCENE_KEY]?.scatter();
});

document.addEventListener("astro:page-load", initializeParticleScene);
