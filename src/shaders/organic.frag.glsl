uniform float uTime;
uniform float uReveal;
uniform float uOpacity;
uniform float uScroll;
uniform float uPointerActive;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

// Variante actual (A) y destino (B), mezcladas con uVariantMix.
uniform float uVariantA;
uniform float uVariantB;
uniform float uVariantMix;

// Parámetros visuales del patrón.
uniform float uIntensity;
uniform float uFlowScale;
uniform float uFlowStrength;
uniform float uFieldScale;
uniform float uBandFrequency;
uniform float uLineWidth;
uniform float uLineSoftness;
uniform float uHaloStrength;
uniform float uPointerRadius;
uniform float uPointerStrength;

// Transición entre páginas: 0 = sin cubrir, 1 = pantalla cubierta.
uniform float uCover;
uniform float uCoverEdge;
uniform float uCoverScale;
uniform float uCoverDirection;
uniform float uCoverGlow;
uniform float uCoverLines;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += noise(p) * amplitude;
    p = p * 2.03 + 17.1;
    amplitude *= 0.5;
  }
  return value;
}

// Devuelve (lines, halo) para una variante: 0 agua, 1 aire, 2 tierra, 3 diagonal.
vec2 variantPattern(float variant, vec2 p, vec2 fieldUv, vec2 flow, float t, float baseLines, float baseHalo) {
  float lines = baseLines;
  float halo = baseHalo;

  if (variant < 0.5) {
    float waves = sin(fieldUv.x * 2.0 + sin(fieldUv.y * 2.4 + t));
    float variantBands = 1.0 - smoothstep(0.04, 0.15, abs(waves - 0.08));
    halo += variantBands * 0.20;
  } else if (variant < 1.5) {
    vec2 featherCell = fract(fieldUv * vec2(0.62, 1.0)) - 0.5;
    float featherEye = length(featherCell * vec2(0.72, 1.5));
    float featherRings = abs(fract(featherEye * 3.2) - 0.5);
    float eyeLines = 1.0 - smoothstep(0.07, 0.19, featherRings);
    float featherVein = 1.0 - smoothstep(0.025, 0.075, abs(featherCell.x + featherCell.y * 0.22));
    lines = max(eyeLines * 0.82, featherVein * 0.48);
    halo = eyeLines * 0.24;
  } else if (variant < 2.5) {
    float terrain = fbm(p * 2.8 + flow * 0.55);
    float contour = abs(fract(terrain * 13.0) - 0.5);
    float indexContour = abs(fract(terrain * 3.25) - 0.5);
    float contourLines = 1.0 - smoothstep(0.025, 0.075, contour);
    float majorLines = 1.0 - smoothstep(0.035, 0.095, indexContour);
    lines = max(contourLines * 0.72, majorLines);
    halo = contourLines * 0.12 + majorLines * 0.24;
  } else {
    float diagonal = 1.0 - smoothstep(0.02, 0.11, abs(sin((fieldUv.x + fieldUv.y) * 2.2)));
    lines = max(lines, diagonal * 0.68);
  }

  return vec2(lines, halo);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 screen = (vUv - 0.5) * vec2(aspect, 1.0);
  // El patrón se desplaza con el scroll para acompañar al contenido.
  vec2 p = screen - vec2(0.0, uScroll);
  float t = uTime * 0.075;

  // Campo de deformación lento para evitar un movimiento mecánico.
  vec2 flow = vec2(
    fbm(p * uFlowScale + vec2(t, -t * 0.7)),
    fbm(p * uFlowScale + vec2(-t * 0.6, t))
  );
  p += (flow - 0.5) * uFlowStrength;

  // El cursor empuja el campo y curva las líneas en su proximidad.
  vec2 pointer = (uPointer - 0.5) * vec2(aspect, 1.0) - vec2(0.0, uScroll);
  vec2 delta = p - pointer;
  float d = length(delta);
  float influence = exp(-d * d * uPointerRadius) * uPointerActive;
  vec2 safeDirection = delta / max(d, 0.0001);
  p += safeDirection * influence * uPointerStrength;
  p += vec2(-safeDirection.y, safeDirection.x) * influence * uPointerStrength;

  // Contornos orgánicos tipo laberinto / reacción-difusión.
  vec2 fieldUv = p * uFieldScale;
  float field = fbm(fieldUv + flow * 1.5);
  field += 0.11 * sin(fieldUv.x * 2.1 + sin(fieldUv.y * 1.7 + t));
  field += 0.07 * sin(fieldUv.y * 2.4 - fieldUv.x * 1.3);

  float bands = abs(fract(field * uBandFrequency) - 0.5);
  float baseLines = 1.0 - smoothstep(uLineWidth, uLineWidth + uLineSoftness, bands);
  float baseHalo = exp(-bands * 17.0);

  vec2 patternA = variantPattern(uVariantA, p, fieldUv, flow, t, baseLines, baseHalo);
  vec2 pattern = patternA;
  if (uVariantMix > 0.001) {
    vec2 patternB = variantPattern(uVariantB, p, fieldUv, flow, t, baseLines, baseHalo);
    pattern = mix(patternA, patternB, uVariantMix);
  }
  float lines = pattern.x;
  float halo = pattern.y;

  float paletteMix = smoothstep(0.16, 0.82, field);
  vec3 palette = mix(uColorA, uColorB, paletteMix);
  palette = mix(palette, uColorC, smoothstep(0.62, 0.94, field));

  // Entrada inicial: el patrón aparece de arriba hacia abajo.
  float distanceFromTop = 1.0 - vUv.y;
  float revealMask = 1.0 - smoothstep(uReveal - 0.035, uReveal + 0.035, distanceFromTop);

  float ink = lines * (1.0 - uHaloStrength) + halo * uHaloStrength;
  float patternAlpha = revealMask * ink * uIntensity * uOpacity;
  vec3 color = palette * (lines * 0.92 + halo * 0.24);
  color += palette * influence * 0.18;

  // Transición: una mancha orgánica rellena la pantalla con la paleta activa.
  float coverNoise = fbm(screen * uCoverScale + flow * 0.8 + vec2(0.0, t * 3.0));
  float coverField = mix(coverNoise, distanceFromTop, uCoverDirection);
  float threshold = mix(-uCoverEdge, 1.0 + uCoverEdge, uCover);
  float coverMask = 1.0 - smoothstep(threshold - uCoverEdge, threshold + uCoverEdge, coverField);
  float rim = (1.0 - smoothstep(0.0, uCoverEdge * 1.5, abs(coverField - threshold)))
    * step(0.0001, uCover) * step(uCover, 0.9999);

  vec3 coverColor = mix(uColorA, uColorB, smoothstep(0.2, 0.85, field));
  coverColor = mix(coverColor, uColorC, lines * uCoverLines);

  vec3 finalColor = mix(color, coverColor, coverMask);
  finalColor = mix(finalColor, uColorC, rim * uCoverGlow);
  float alpha = max(patternAlpha, coverMask);
  alpha = max(alpha, rim * uCoverGlow);

  gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 1.0));
}
