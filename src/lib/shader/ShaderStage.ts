import * as THREE from "three";
import gsap from "gsap";
import fragmentShader from "../../shaders/organic.frag.glsl?raw";
import defaults from "../../config/shader.config.json";

export type ShaderSettings = typeof defaults;
export type Palette = [string, string, string];

/** Configuración que cada página declara en <html data-shader-*>. */
export interface PageShaderState {
  palettes: Palette[];
  variant: number;
  opacity: number;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FALLBACK_PALETTE: Palette = ["#c4a060", "#e6c98a", "#fff0ce"];

export function cloneDefaults(): ShaderSettings {
  return structuredClone(defaults);
}

function toColor(value: string | undefined, fallback: string) {
  const color = new THREE.Color(fallback);
  if (value) {
    try {
      color.set(value.trim());
    } catch {
      /* color inválido: se usa el fallback */
    }
  }
  return color;
}

function paletteToColors(palette: Palette) {
  return palette.map((value, index) => toColor(value, FALLBACK_PALETTE[index])) as [
    THREE.Color,
    THREE.Color,
    THREE.Color,
  ];
}

/** Lee la configuración del shader declarada por la página actual. */
export function readPageState(body: HTMLElement = document.documentElement): PageShaderState {
  let palettes: Palette[] = [FALLBACK_PALETTE];
  try {
    const parsed = JSON.parse(body.dataset.shaderPalettes || "[]");
    if (Array.isArray(parsed) && parsed.length) palettes = parsed;
  } catch {
    /* se mantiene la paleta por defecto */
  }
  return {
    palettes,
    variant: Number(body.dataset.shaderVariant ?? 0),
    opacity: Number(body.dataset.shaderOpacity ?? 1),
  };
}

export class ShaderStage {
  readonly settings: ShaderSettings;
  readonly root: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private material: THREE.ShaderMaterial;
  private uniforms: Record<string, THREE.IUniform>;
  private reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  private sequence: [THREE.Color, THREE.Color, THREE.Color][] = [paletteToColors(FALLBACK_PALETTE)];
  private hoverPalette: [THREE.Color, THREE.Color, THREE.Color] | null = null;
  private hoverVariant: number | null = null;
  private pageVariant = 0;
  private targetOpacity = 1;
  private target = paletteToColors(FALLBACK_PALETTE);
  private overrideColors = paletteToColors(FALLBACK_PALETTE);

  private pointerTarget = new THREE.Vector2(0.5, 0.5);
  private pointerActive = 0;
  private elapsed = 0;
  private time = 0;
  private lastFrame = performance.now();
  private variantTween: gsap.core.Tween | null = null;
  private pagePaletteTween: gsap.core.Tween | null = null;
  private pagePaletteIsAnimating = false;
  private pageTransitionActive = false;
  private scrollOffset = 0;
  private lastTokenWrite = 0;
  private lastTokens = "";

  constructor(root: HTMLElement, canvas: HTMLCanvasElement, settings: ShaderSettings) {
    this.root = root;
    this.settings = settings;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);

    const s = settings;
    this.uniforms = {
      uTime: { value: 0 },
      uReveal: { value: this.reducedMotion ? 1 : 0 },
      uOpacity: { value: 1 },
      uScroll: { value: 0 },
      uPointerActive: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uColorA: { value: this.target[0].clone() },
      uColorB: { value: this.target[1].clone() },
      uColorC: { value: this.target[2].clone() },
      uVariantA: { value: 0 },
      uVariantB: { value: 0 },
      uVariantMix: { value: 0 },
      uIntensity: { value: s.pattern.intensity },
      uFlowScale: { value: s.pattern.flowScale },
      uFlowStrength: { value: s.pattern.flowStrength },
      uFieldScale: { value: s.pattern.fieldScale },
      uBandFrequency: { value: s.pattern.bandFrequency },
      uLineWidth: { value: s.pattern.lineWidth },
      uLineSoftness: { value: s.pattern.lineSoftness },
      uHaloStrength: { value: s.pattern.haloStrength },
      uPointerRadius: { value: s.pointer.radius },
      uPointerStrength: { value: s.pointer.strength },
      uCover: { value: 0 },
      uCoverEdge: { value: s.transition.edge },
      uCoverScale: { value: s.transition.noiseScale },
      uCoverDirection: { value: s.transition.direction },
      uCoverGlow: { value: s.transition.glow },
      uCoverLines: { value: s.transition.lineContrast },
    };

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material));

    window.addEventListener("resize", this.resize, { passive: true });
    window.addEventListener("mousemove", this.onMouseMove, { passive: true });
    window.addEventListener("touchmove", this.onTouchMove, { passive: true });
    window.addEventListener("touchend", this.onPointerLeave, { passive: true });
    window.addEventListener("touchcancel", this.onPointerLeave, { passive: true });
    document.documentElement.addEventListener("pointerleave", this.onPointerLeave, { passive: true });
    window.addEventListener("blur", this.onPointerLeave);
    this.resize();
    gsap.ticker.add(this.render);
  }

  /* ------------------------------------------------------------------ */
  /* API pública                                                          */
  /* ------------------------------------------------------------------ */

  /** Aplica la configuración de una página (paletas, variante y visibilidad). */
  applyPage(state: PageShaderState, { immediate = false } = {}) {
    const covered = this.isCovered;
    if (covered && this.variantTween?.isActive()) this.variantTween.progress(1);
    const nextSequence = state.palettes.map(paletteToColors);
    const samePaletteSequence =
      nextSequence.length === this.sequence.length &&
      nextSequence.every((palette, index) =>
        palette.every((color, colorIndex) => color.equals(this.sequence[index][colorIndex])),
      );
    this.sequence = nextSequence;
    this.pageVariant = state.variant;
    this.targetOpacity = state.opacity;
    this.hoverPalette = null;
    this.hoverVariant = null;
    if (immediate || !covered) this.updateVariant(immediate);
    if (immediate) {
      this.computeTarget();
      this.uniforms.uColorA.value.copy(this.target[0]);
      this.uniforms.uColorB.value.copy(this.target[1]);
      this.uniforms.uColorC.value.copy(this.target[2]);
      this.uniforms.uOpacity.value = state.opacity;
    } else if (this.isCovered && !samePaletteSequence) {
      this.computeTarget();
      this.transitionPagePalette(this.target);
    }
  }

  /** Fija temporalmente una paleta (p. ej. al hacer hover en un botón). */
  setHover(palette: Palette | null, variant: number | null = null) {
    this.hoverPalette = palette ? paletteToColors(palette) : null;
    this.hoverVariant = palette ? variant : null;
    this.updateVariant(false);
  }

  /** Vuelve a leer los colores manuales del panel. */
  refreshOverrideColors() {
    const { colorA, colorB, colorC } = this.settings.color;
    this.overrideColors = paletteToColors([colorA, colorB, colorC]);
    this.updateVariant(false);
  }

  /** Revela el patrón de arriba hacia abajo (primera carga). */
  reveal(duration = 2.6) {
    if (this.reducedMotion) {
      this.uniforms.uReveal.value = 1;
      return gsap.timeline();
    }
    return gsap.fromTo(
      this.uniforms.uReveal,
      { value: 0 },
      { value: 1, duration, ease: "power2.inOut", overwrite: true },
    );
  }

  /** Cubre la pantalla con el shader. Resuelve cuando está totalmente cubierta. */
  cover() {
    this.root.classList.add("is-covering");
    this.pageTransitionActive = true;
    const duration = this.reducedMotion ? 0.2 : this.settings.transition.coverDuration;
    return gsap.to(this.uniforms.uCover, {
      value: 1,
      duration,
      ease: "power2.inOut",
      overwrite: true,
    });
  }

  /** Descubre la pantalla mostrando la nueva página. */
  uncover(delay = this.settings.transition.holdDuration) {
    const duration = this.reducedMotion ? 0.2 : this.settings.transition.uncoverDuration;
    this.uniforms.uReveal.value = 1;
    const scrollScale = this.settings.pattern.scrollFactor / Math.max(window.innerHeight, 1);
    this.scrollOffset = this.uniforms.uScroll.value - window.scrollY * scrollScale;
    return gsap.to(this.uniforms.uCover, {
      value: 0,
      duration,
      delay: this.reducedMotion ? 0 : delay,
      ease: "power2.inOut",
      overwrite: true,
      onComplete: () => {
        this.pageTransitionActive = false;
        this.root.classList.remove("is-covering");
      },
    });
  }

  /** Fuerza a reescribir los tokens vivos (Astro reemplaza los atributos de <html> al navegar). */
  invalidateTokens() {
    this.lastTokens = "";
    this.lastTokenWrite = 0;
  }

  get isCovered() {
    return this.uniforms.uCover.value > 0.001;
  }

  transitionPageVariant() {
    this.updateVariant(false);
  }

  private transitionPagePalette(colors: [THREE.Color, THREE.Color, THREE.Color]) {
    this.pagePaletteTween?.kill();
    const uniforms = [
      this.uniforms.uColorA.value,
      this.uniforms.uColorB.value,
      this.uniforms.uColorC.value,
    ];
    const start = uniforms.map(({ r, g, b }) => ({ r, g, b }));
    const end = colors.map(({ r, g, b }) => ({ r, g, b }));
    const progress = { value: 0 };
    const duration = this.reducedMotion ? 0 : Math.max(this.settings.transition.uncoverDuration, 0.8);
    this.pagePaletteIsAnimating = true;

    this.pagePaletteTween = gsap.to(progress, {
      value: 1,
      duration,
      ease: "sine.inOut",
      onUpdate: () => {
        uniforms.forEach((color, index) => {
          color.setRGB(
            THREE.MathUtils.lerp(start[index].r, end[index].r, progress.value),
            THREE.MathUtils.lerp(start[index].g, end[index].g, progress.value),
            THREE.MathUtils.lerp(start[index].b, end[index].b, progress.value),
          );
        });
      },
      onComplete: () => {
        this.pagePaletteIsAnimating = false;
      },
      onInterrupt: () => {
        this.pagePaletteIsAnimating = false;
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /* Internos                                                             */
  /* ------------------------------------------------------------------ */

  private desiredVariant() {
    const { variantOverride } = this.settings.color;
    if (variantOverride >= 0) return variantOverride;
    return this.hoverVariant ?? this.pageVariant;
  }

  private updateVariant(immediate: boolean) {
    const next = this.desiredVariant();
    const u = this.uniforms;
    const showing = u.uVariantMix.value > 0.5 ? u.uVariantB.value : u.uVariantA.value;

    if (immediate || this.reducedMotion) {
      this.variantTween?.kill();
      u.uVariantA.value = next;
      u.uVariantB.value = next;
      u.uVariantMix.value = 0;
      return;
    }
    if (u.uVariantB.value === next && this.variantTween?.isActive()) return;
    if (showing === next && !this.variantTween?.isActive()) return;

    this.variantTween?.kill();
    u.uVariantA.value = showing;
    u.uVariantB.value = next;
    u.uVariantMix.value = 0;
    this.variantTween = gsap.to(u.uVariantMix, {
      value: 1,
      duration: this.settings.color.variantDuration,
      ease: "sine.inOut",
      onComplete: () => {
        u.uVariantA.value = next;
        u.uVariantMix.value = 0;
      },
    });
  }

  private computeTarget() {
    if (this.settings.color.override) {
      this.target.forEach((color, i) => color.copy(this.overrideColors[i]));
      return;
    }
    if (this.hoverPalette) {
      this.target.forEach((color, i) => color.copy(this.hoverPalette![i]));
      return;
    }
    const sequence = this.sequence;
    if (sequence.length === 1 || this.reducedMotion) {
      this.target.forEach((color, i) => color.copy(sequence[0][i]));
      return;
    }
    const position = this.elapsed / Math.max(this.settings.color.cycleDuration, 0.1);
    const index = Math.floor(position) % sequence.length;
    const nextIndex = (index + 1) % sequence.length;
    const amount = THREE.MathUtils.smoothstep(position % 1, 0, 1);
    this.target.forEach((color, i) =>
      color.lerpColors(sequence[index][i], sequence[nextIndex][i], amount),
    );
  }

  private syncSettings() {
    const { pattern, pointer, transition } = this.settings;
    const u = this.uniforms;
    u.uIntensity.value = pattern.intensity;
    u.uFlowScale.value = pattern.flowScale;
    u.uFlowStrength.value = pattern.flowStrength;
    u.uFieldScale.value = pattern.fieldScale;
    u.uBandFrequency.value = pattern.bandFrequency;
    u.uLineWidth.value = pattern.lineWidth;
    u.uLineSoftness.value = pattern.lineSoftness;
    u.uHaloStrength.value = pattern.haloStrength;
    u.uPointerRadius.value = pointer.radius;
    u.uPointerStrength.value = pointer.strength;
    u.uCoverEdge.value = transition.edge;
    u.uCoverScale.value = transition.noiseScale;
    u.uCoverDirection.value = transition.direction;
    u.uCoverGlow.value = transition.glow;
    u.uCoverLines.value = transition.lineContrast;
  }

  resize = () => {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, this.settings.render.maxPixelRatio),
    );
    this.renderer.setSize(width, height, false);
    this.uniforms.uResolution.value.set(width, height);
  };

  private updatePointerPosition = (clientX: number, clientY: number) => {
    this.pointerTarget.set(
      THREE.MathUtils.clamp(clientX / window.innerWidth, 0, 1),
      THREE.MathUtils.clamp(1 - clientY / window.innerHeight, 0, 1),
    );
    this.pointerActive = 1;
  };

  private onMouseMove = (event: MouseEvent) => {
    this.updatePointerPosition(event.clientX, event.clientY);
  };

  private onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (touch) this.updatePointerPosition(touch.clientX, touch.clientY);
  };

  private onPointerLeave = () => {
    this.pointerActive = 0;
  };

  private render = () => {
    const now = performance.now();
    const dt = Math.min((now - this.lastFrame) / 1000, 0.1);
    this.lastFrame = now;
    const u = this.uniforms;
    const s = this.settings;

    if (!this.reducedMotion) {
      if (!this.pagePaletteIsAnimating) this.elapsed += dt;
      this.time += dt * s.pattern.speed;
    }
    this.syncSettings();
    this.computeTarget();

    // Suavizado exponencial: los colores siguen siempre a la paleta objetivo.
    const colorAmount = 1 - Math.exp(-dt * s.color.colorEase);
    if (!this.pagePaletteIsAnimating) {
      u.uColorA.value.lerp(this.target[0], colorAmount);
      u.uColorB.value.lerp(this.target[1], colorAmount);
      u.uColorC.value.lerp(this.target[2], colorAmount);
    }
    u.uOpacity.value += (this.targetOpacity - u.uOpacity.value) * colorAmount;

    u.uTime.value = this.time;
    if (!this.pageTransitionActive) {
      u.uScroll.value =
        (window.scrollY / Math.max(window.innerHeight, 1)) * s.pattern.scrollFactor +
        this.scrollOffset;
    }
    u.uPointer.value.lerp(this.pointerTarget, s.pointer.follow);
    u.uPointerActive.value += (this.pointerActive - u.uPointerActive.value) * s.pointer.fade;

    this.writeLiveTokens(now);
    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Publica los colores actuales del shader como custom properties
   * (--live-a, --live-b, --live-c) para que los tokens CSS los sigan.
   * Se limita a ~12 escrituras por segundo y solo si cambian.
   */
  private writeLiveTokens(now: number) {
    if (now - this.lastTokenWrite < 80) return;
    this.lastTokenWrite = now;
    const u = this.uniforms;
    const values = [u.uColorA, u.uColorB, u.uColorC].map(
      (uniform) => `#${(uniform.value as THREE.Color).getHexString()}`,
    );
    const key = values.join();
    if (key === this.lastTokens) return;
    this.lastTokens = key;
    const style = document.documentElement.style;
    style.setProperty("--live-a", values[0]);
    style.setProperty("--live-b", values[1]);
    style.setProperty("--live-c", values[2]);
  }
}
