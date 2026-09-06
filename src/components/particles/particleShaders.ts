// GLSL for the point field. Imported only by ParticleImage.tsx.

export const VERTEX_SHADER = /* glsl */ `
attribute vec3 aColor;
attribute vec3 aSeed;
attribute float aBoost;
attribute float aAlpha;

uniform float uProgress;
uniform float uScroll;
uniform vec2 uMouse;
uniform float uPixelRatio;
uniform float uAmp;
uniform float uRepel;
uniform float uEdgeFade;

varying vec3 vColor;
varying float vBoost;
varying float vAlpha;
varying float vCoverage;

float easeOutCubic(float t) {
  float f = 1.0 - t;
  return 1.0 - f * f * f;
}

void main() {
  vColor = aColor;
  vBoost = aBoost;
  vCoverage = aAlpha;

  // scattered start: always deeper into the scene (never behind the
  // camera), so the field reads as materialising toward the viewer
  vec3 scatter = vec3((aSeed.xy - 0.5) * 90.0, -(aSeed.z * 45.0 + 8.0));
  vec3 scattered = position + scatter;
  float e = easeOutCubic(clamp(uProgress, 0.0, 1.0));
  vec3 pos = mix(scattered, position, e);

  // cursor repulsion in plane-space, eased in alongside the assemble — kept
  // gentle: a soft press outward, not a starburst. uRepel scales radius and
  // strength together, so a plane sampled smaller than the viewport keeps the
  // same cursor-to-subject proportion instead of being shoved around by a
  // radius meant for a full-bleed field.
  vec2 toPoint = pos.xy - uMouse;
  float dist = length(toPoint);
  float radius = 3.6 * uRepel;
  float falloff = smoothstep(radius, 0.0, dist);
  falloff *= falloff; // steeper falloff softens the sparse-point "spike" look at the radius edge
  vec2 dir = dist > 0.0001 ? toPoint / dist : vec2(0.0);
  pos.xy += dir * falloff * 0.85 * uRepel * e;

  // scroll dispersal: same "into depth" direction as the assemble, so the
  // plate dissolves away rather than flying back out toward the camera.
  // uAmp scales the whole flight — 1.0 is the hero's full dispersal, lower
  // keeps a field loosening in place rather than leaving the frame.
  float disp = clamp(uScroll, 0.0, 1.0);
  pos.xy += (aSeed.xy - 0.5) * disp * 55.0 * uAmp;
  pos.z -= aSeed.z * disp * 40.0 * uAmp;
  pos.y += disp * 18.0 * uAmp;

  // the plate is solid at rest and dissolves INTO the field, so the alpha
  // runs the opposite way to the <img> underneath: a faint 8% texture over
  // the photo at rest, full strength by the time the photo has gone. The
  // assemble still plays at full alpha so the intro reads as points forming
  // — the tail of uProgress hands over to the scroll term, landing exactly
  // where onReady flips the plate to scroll-driven opacity.
  float scrollAlpha = smoothstep(0.0, 1.0, disp) * 0.9 + 0.08;
  vAlpha = mix(1.0, scrollAlpha, smoothstep(0.7, 1.0, uProgress));

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // A canvas clips on a hard rectangle, so a point that flies past its bounds
  // would otherwise be cut off mid-flight and the dispersed field would read
  // as a box of noise. Fade toward the canvas edge instead, so anything that
  // escapes the frame dissolves in space. uEdgeFade is the fraction of the
  // half-extent the fade spans; 0 disables it entirely — the hero fills its
  // canvas edge to edge and must never fade at the boundary.
  if (uEdgeFade > 0.0 && gl_Position.w > 0.0) {
    vec2 nd = abs(gl_Position.xy / gl_Position.w);
    vAlpha *= 1.0 - smoothstep(1.0 - uEdgeFade, 1.0, max(nd.x, nd.y));
  }

  float size = 2.1 * uPixelRatio * (240.0 / -mvPosition.z);
  gl_PointSize = min(size, 3.0 * uPixelRatio);
}
`;

export const FRAGMENT_SHADER = /* glsl */ `
precision mediump float;

uniform float uOpacity;
uniform float uTheme; // 0 = light, 1 = dark
uniform vec3 uBridgeColor;

varying vec3 vColor;
varying float vBoost;
varying float vAlpha;
varying float vCoverage;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float mask = smoothstep(0.5, 0.18, d);

  vec3 color = vColor;
  // vCoverage is the source image's own alpha: exactly 1.0 for every point of
  // an opaque image (so this multiply is an identity there), and a falloff
  // toward 0 across the soft edge of a cutout, which is what lets hair and
  // shoulders fade out instead of ending in a ring of full-strength points.
  float alpha = mask * uOpacity * clamp(vAlpha, 0.0, 1.0) * vCoverage;

  if (uTheme > 0.5) {
    // dark: additive — express the bridge-span boost as accumulated light
    color += vBoost * 0.55 * uBridgeColor;
  } else {
    // light: normal blending — additive would wash to white on ivory, so
    // the boost raises opacity + pulls saturation toward pine instead
    color = mix(color, uBridgeColor, vBoost * 0.35);
    alpha *= 1.0 + vBoost * 0.25;
  }

  gl_FragColor = vec4(color, alpha);
}
`;
