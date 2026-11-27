import type { GUI } from "dat.gui";
import { cloneDefaults, type ShaderSettings, type ShaderStage } from "./ShaderStage";

const CONFIG_FILENAME = "shader.config.json";

/**
 * El panel se muestra en desarrollo o añadiendo `?gui` a la URL.
 * La tecla "h" lo oculta / muestra (atajo propio de dat.gui).
 */
export function shouldShowGui() {
  return import.meta.env.DEV || new URLSearchParams(window.location.search).has("gui");
}

function downloadConfig(settings: ShaderSettings) {
  const blob = new Blob([`${JSON.stringify(settings, null, 2)}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = CONFIG_FILENAME;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function assignDeep(target: Record<string, any>, source: Record<string, any>) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      assignDeep(target[key], value);
    } else {
      target[key] = value;
    }
  }
}

export async function createShaderGui(stage: ShaderStage, container: HTMLElement) {
  const { GUI } = await import("dat.gui");

  // dat.gui inyecta su <style> en <head>; el ClientRouter de Astro lo elimina al
  // navegar, así que se conserva la referencia y se reinserta tras cada swap.
  const guiStyles = Array.from(document.head.querySelectorAll("style")).filter((style) =>
    style.textContent?.includes(".dg "),
  );
  document.addEventListener("astro:after-swap", () => {
    guiStyles.forEach((style) => {
      if (!style.isConnected) document.head.append(style);
    });
  });
  const s = stage.settings;
  const gui: GUI = new GUI({ autoPlace: false, width: 300, name: "shader" });
  container.append(gui.domElement);

  const pattern = gui.addFolder("Patrón");
  pattern.add(s.pattern, "speed", 0, 4, 0.01).name("velocidad");
  pattern.add(s.pattern, "intensity", 0, 1.5, 0.01).name("intensidad");
  pattern.add(s.pattern, "flowScale", 0.1, 8, 0.01).name("escala flujo");
  pattern.add(s.pattern, "flowStrength", 0, 1.5, 0.01).name("fuerza flujo");
  pattern.add(s.pattern, "fieldScale", 0.5, 12, 0.01).name("escala campo");
  pattern.add(s.pattern, "bandFrequency", 1, 30, 0.1).name("frecuencia bandas");
  pattern.add(s.pattern, "lineWidth", 0, 0.3, 0.001).name("grosor línea");
  pattern.add(s.pattern, "lineSoftness", 0.001, 0.3, 0.001).name("suavidad línea");
  pattern.add(s.pattern, "haloStrength", 0, 1, 0.01).name("halo");
  pattern.add(s.pattern, "scrollFactor", 0, 3, 0.01).name("scroll");
  pattern.open();

  const pointer = gui.addFolder("Cursor");
  pointer.add(s.pointer, "radius", 1, 80, 0.1).name("radio (inverso)");
  pointer.add(s.pointer, "strength", 0, 0.5, 0.001).name("fuerza");
  pointer.add(s.pointer, "follow", 0.01, 1, 0.01).name("seguimiento");
  pointer.add(s.pointer, "fade", 0.01, 1, 0.01).name("desvanecido");

  const color = gui.addFolder("Color");
  color.add(s.color, "cycleDuration", 0.3, 12, 0.1).name("ciclo paletas (s)");
  color.add(s.color, "colorEase", 0.5, 20, 0.1).name("velocidad cambio");
  color.add(s.color, "variantDuration", 0.1, 4, 0.05).name("cambio variante (s)");
  color
    .add(s.color, "variantOverride", { auto: -1, agua: 0, aire: 1, tierra: 2, diagonal: 3 })
    .name("variante")
    .onChange((value: string | number) => {
      s.color.variantOverride = Number(value);
      stage.setHover(null);
    });
  color.add(s.color, "override").name("forzar colores").onChange(() => stage.refreshOverrideColors());
  color.addColor(s.color, "colorA").name("color A").onChange(() => stage.refreshOverrideColors());
  color.addColor(s.color, "colorB").name("color B").onChange(() => stage.refreshOverrideColors());
  color.addColor(s.color, "colorC").name("color C").onChange(() => stage.refreshOverrideColors());

  const transition = gui.addFolder("Transición");
  transition.add(s.transition, "coverDuration", 0.1, 3, 0.05).name("cubrir (s)");
  transition.add(s.transition, "holdDuration", 0, 2, 0.05).name("pausa (s)");
  transition.add(s.transition, "uncoverDuration", 0.1, 3, 0.05).name("descubrir (s)");
  transition.add(s.transition, "edge", 0.005, 0.4, 0.005).name("borde");
  transition.add(s.transition, "noiseScale", 0.2, 10, 0.05).name("escala ruido");
  transition.add(s.transition, "direction", 0, 1, 0.01).name("dirección vertical");
  transition.add(s.transition, "glow", 0, 1, 0.01).name("brillo borde");
  transition.add(s.transition, "lineContrast", 0, 1, 0.01).name("líneas en cubierta");

  const actions = {
    previewTransition: async () => {
      await stage.cover();
      await stage.uncover();
    },
    download: () => downloadConfig(s),
    reset: () => {
      assignDeep(s, cloneDefaults());
      stage.refreshOverrideColors();
      stage.resize();
      gui.updateDisplay();
    },
  };

  const render = gui.addFolder("Render");
  render.add(s.render, "maxPixelRatio", 0.5, 3, 0.05).name("pixel ratio máx").onChange(stage.resize);

  gui.add(actions, "previewTransition").name("▶ probar transición");
  gui.add(actions, "download").name("⬇ descargar configuración");
  gui.add(actions, "reset").name("↺ restablecer");

  // Mantiene los controles sincronizados si algo externo cambia los valores.
  gui.close();
  return gui;
}
