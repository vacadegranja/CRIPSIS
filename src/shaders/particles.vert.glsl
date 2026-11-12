uniform float uTime;
uniform float uProgress;
uniform float uPointSize;
uniform float uTransitionNoise;
uniform float uTransitionDepth;
uniform float uHoverRadius;
uniform float uHoverStrength;
uniform float uIdleNoise;
uniform vec2 uPointer;

attribute vec3 positionFrom;
attribute vec3 positionTo;
attribute vec3 colorFrom;
attribute vec3 colorTo;

varying vec3 vColor;
varying float vAlpha;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void main() {
  float eased = uProgress * uProgress * (3.0 - 2.0 * uProgress);
  vec3 transformed = mix(positionFrom, positionTo, eased);

  float transitionArc = sin(uProgress * 3.14159265);
  float seed = hash(positionFrom + positionTo + vec3(float(gl_VertexID) * 0.0001));
  vec2 direction = normalize(vec2(
    sin(seed * 43.0 + uTime * 0.25),
    cos(seed * 37.0 - uTime * 0.2)
  ));
  transformed.xy += direction * transitionArc * uTransitionNoise * (0.25 + seed);
  transformed.z += transitionArc * (seed - 0.5) * uTransitionDepth;

  float idle = sin(uTime * 0.7 + seed * 30.0) * uIdleNoise;
  transformed.xy += direction * idle;

  vec2 pointerDelta = transformed.xy - uPointer;
  float pointerDistance = length(pointerDelta);
  float influence = 1.0 - smoothstep(0.0, uHoverRadius, pointerDistance);
  vec2 pointerDirection = pointerDistance > 0.0001
    ? pointerDelta / pointerDistance
    : direction;
  transformed.xy += pointerDirection * influence * uHoverStrength;
  transformed.z += influence * uHoverStrength * 0.7;

  vec4 viewPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = uPointSize * (1.0 + transformed.z * 0.18);

  vColor = mix(colorFrom, colorTo, eased);
  vAlpha = mix(0.35, 1.0, eased);
}
