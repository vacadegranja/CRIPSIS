import * as THREE from "three";
import vertexShader from "../../shaders/particles.vert.glsl?raw";
import fragmentShader from "../../shaders/particles.frag.glsl?raw";
import { PARTICLE_CONFIG } from "../../config/particles.js";
import { ImageSampler } from "./ImageSampler.js";

export class ParticleScene {
  constructor({ canvas, config = PARTICLE_CONFIG }) {
    this.canvas = canvas;
    this.config = config;
    this.sampler = new ImageSampler(config);
    this.clock = new THREE.Clock();
    this.pointerTarget = new THREE.Vector2(99, 99);
    this.pointerCurrent = new THREE.Vector2(99, 99);
    this.currentUrl = null;
    this.transitionToken = 0;
    this.animationFrame = null;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, config.maxPixelRatio),
    );

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
    this.camera.position.z = 2;

    const initialPositions = new Float32Array(config.count * 3);
    const initialColors = new Float32Array(config.count * 3);
    for (let index = 0; index < config.count; index += 1) {
      const offset = index * 3;
      const radius = Math.sqrt(Math.random()) * 0.82;
      const angle = Math.random() * Math.PI * 2;
      initialPositions[offset] = Math.cos(angle) * radius;
      initialPositions[offset + 1] = Math.sin(angle) * radius;
      initialPositions[offset + 2] = (Math.random() - 0.5) * 0.4;
      initialColors[offset] = 0.7;
      initialColors[offset + 1] = 0.75;
      initialColors[offset + 2] = 0.78;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(initialPositions.slice(), 3),
    );
    this.geometry.setAttribute(
      "positionFrom",
      new THREE.BufferAttribute(initialPositions.slice(), 3),
    );
    this.geometry.setAttribute(
      "positionTo",
      new THREE.BufferAttribute(initialPositions.slice(), 3),
    );
    this.geometry.setAttribute(
      "colorFrom",
      new THREE.BufferAttribute(initialColors.slice(), 3),
    );
    this.geometry.setAttribute(
      "colorTo",
      new THREE.BufferAttribute(initialColors.slice(), 3),
    );

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uPointSize: { value: config.pointSize * this.renderer.getPixelRatio() },
        uTransitionNoise: { value: config.transitionNoise },
        uTransitionDepth: { value: config.transitionDepth },
        uHoverRadius: { value: config.hoverRadius },
        uHoverStrength: { value: 0 },
        uIdleNoise: { value: config.idleNoise },
        uPointer: { value: this.pointerCurrent },
      },
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);

    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.resize = this.resize.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.render = this.render.bind(this);

    window.addEventListener("resize", this.resize, { passive: true });
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", this.onPointerLeave);

    this.resize();
    this.render();
  }

  async setImage(url, { immediate = false } = {}) {
    if (!url || url === this.currentUrl) return;

    const token = ++this.transitionToken;
    const viewportAspect = window.innerWidth / Math.max(1, window.innerHeight);

    try {
      const sample = await this.sampler.sample(
        url,
        this.config.count,
        viewportAspect,
      );
      if (token !== this.transitionToken) return;

      const previousPositions = this.geometry.getAttribute("positionTo").array.slice();
      const previousColors = this.geometry.getAttribute("colorTo").array.slice();

      this.geometry.setAttribute(
        "positionFrom",
        new THREE.BufferAttribute(previousPositions, 3),
      );
      this.geometry.setAttribute(
        "colorFrom",
        new THREE.BufferAttribute(previousColors, 3),
      );
      this.geometry.setAttribute(
        "positionTo",
        new THREE.BufferAttribute(sample.positions, 3),
      );
      this.geometry.setAttribute(
        "colorTo",
        new THREE.BufferAttribute(sample.colors, 3),
      );

      this.currentUrl = url;
      this.transitionStart = performance.now();
      this.transitionDuration =
        immediate || this.reducedMotion.matches ? 1 : this.config.transitionDuration;
      this.material.uniforms.uProgress.value = 0;
      this.canvas.classList.add("is-ready");
    } catch (error) {
      console.error(error);
      this.canvas.classList.add("has-error");
    }
  }

  scatter() {
    this.material.uniforms.uTransitionNoise.value =
      this.config.transitionNoise * 1.45;
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / Math.max(1, height);

    this.camera.left = -aspect;
    this.camera.right = aspect;
    this.camera.top = 1;
    this.camera.bottom = -1;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  onPointerMove(event) {
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.pointerTarget.set(
      (event.clientX / window.innerWidth) * aspect * 2 - aspect,
      1 - (event.clientY / window.innerHeight) * 2,
    );
    this.pointerActive = event.pointerType !== "touch";
  }

  onPointerLeave() {
    this.pointerActive = false;
    this.pointerTarget.set(99, 99);
  }

  render(now = performance.now()) {
    this.animationFrame = requestAnimationFrame(this.render);
    this.material.uniforms.uTime.value = this.clock.getElapsedTime();

    if (this.transitionStart !== undefined) {
      const progress = Math.min(
        1,
        (now - this.transitionStart) / this.transitionDuration,
      );
      this.material.uniforms.uProgress.value = progress;
      if (progress === 1) {
        this.transitionStart = undefined;
        this.material.uniforms.uTransitionNoise.value = this.config.transitionNoise;
      }
    }

    this.pointerCurrent.lerp(this.pointerTarget, this.config.hoverRecovery);
    const hoverTarget = this.pointerActive ? this.config.hoverStrength : 0;
    this.material.uniforms.uHoverStrength.value = THREE.MathUtils.lerp(
      this.material.uniforms.uHoverStrength.value,
      hoverTarget,
      this.config.hoverRecovery,
    );

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame);
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("pointermove", this.onPointerMove);
    document.documentElement.removeEventListener("pointerleave", this.onPointerLeave);
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
