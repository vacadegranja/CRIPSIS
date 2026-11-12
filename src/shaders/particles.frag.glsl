precision highp float;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 point = gl_PointCoord - 0.5;
  float distanceToCenter = length(point);
  float alpha = 1.0 - smoothstep(0.32, 0.5, distanceToCenter);

  if (alpha <= 0.01) discard;

  gl_FragColor = vec4(vColor, alpha * vAlpha);
}
