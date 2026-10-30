import { roundedLensSurface, type LensTextures } from "@/lib/glass";

/** Units belong to this renderer. The reference values are a tuning starting point,
 * not a claim about the private implementation behind the Aave article. */
export interface ControlLensParameters {
  scale: number;
  depth: number;
  curvature: number;
  splay: number;
  chroma: number;
  blur: number;
  rimStrength: number;
  edgeHighlight: number;
  specularAngle: number;
  /** Interior zoom; 1 preserves the approved neutral-center switch. */
  magnification?: number;
}
export const CONTROL_LENS_DEFAULTS: ControlLensParameters = {
  scale: 0.089,
  depth: 17,
  curvature: 58,
  splay: 0.89,
  chroma: 0.38,
  blur: 1,
  rimStrength: 0.61,
  edgeHighlight: 0.39,
  specularAngle: 45,
  magnification: 1,
};
export const CONTROL_LENS_PRESETS = {
  slider: {
    ...CONTROL_LENS_DEFAULTS,
    depth: 14,
    curvature: 68,
    chroma: 0,
    blur: 0.15,
    magnification: 3.2,
  },
  switch: { ...CONTROL_LENS_DEFAULTS, chroma: 0.22, blur: 0.45 },
  selection: {
    ...CONTROL_LENS_DEFAULTS,
    depth: 12,
    chroma: 0,
    blur: 0,
    rimStrength: 0.42,
  },
} satisfies Record<string, ControlLensParameters>;
const finite = (
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
) => (Number.isFinite(value) ? Math.max(min, Math.min(max, value!)) : fallback);
export type ControlLensInput = Partial<ControlLensParameters> & {
  /** @deprecated Source rim energy only; no painted glow. */ glow?: number;
};
export function resolveControlLens(
  value: ControlLensInput = {},
): ControlLensParameters & { magnification: number } {
  const d = CONTROL_LENS_DEFAULTS;
  return {
    scale: finite(value.scale, d.scale, 0, 0.3),
    depth: finite(value.depth, d.depth, 0, 40),
    curvature: finite(value.curvature, d.curvature, 1, 100),
    splay: finite(value.splay, d.splay, 0.2, 2),
    chroma: finite(value.chroma, d.chroma, 0, 1),
    blur: finite(value.blur, d.blur, 0, 5),
    rimStrength: finite(value.rimStrength ?? value.glow, d.rimStrength, 0, 1.5),
    edgeHighlight: finite(value.edgeHighlight, d.edgeHighlight, 0, 1),
    specularAngle: finite(value.specularAngle, d.specularAngle, -180, 180),
    magnification: finite(value.magnification, d.magnification ?? 1, 1, 5),
  };
}
export function controlLensMetrics(
  width: number,
  height: number,
  parameters: ControlLensParameters,
  profile: "dom" | "media" = "dom",
) {
  const radius = Math.min(width, height) / 2;
  // Explicit tracks keep a neutral center; media-style DOM previews may opt
  // into magnification of their original source pixels.
  const magnification = parameters.magnification ?? 1;
  const mediaAmplitude = Math.min(
    radius * 0.85,
    parameters.depth *
      (1 + parameters.curvature / 35) *
      (parameters.scale / 0.089),
  );
  const shoulderWidth = Math.max(
    1, Math.min(24, radius * 0.6 * Math.pow(parameters.splay / 0.89, 0.3)),
  );
  // Sharp DOM boundaries cannot tolerate the media field's fold. Bound the
  // slope of the shoulder so a colored fill keeps one boundary, not an echo.
  const amplitude = profile === "media"
    ? mediaAmplitude
    : shoulderWidth * 0.28 / magnification * Math.tanh(
        parameters.depth / 17 * parameters.scale / 0.089 *
        parameters.curvature / 58 * 0.75,
      );
  const sourceZoom = (Math.max(width, height) / 2) * (1 - 1 / magnification);
  const maximum = profile === "media"
    ? Math.max(1, amplitude, sourceZoom)
    : Math.max(1, amplitude + sourceZoom);
  return {
    pad: Math.ceil(maximum + parameters.blur * 3 + 3),
    displacementScale: maximum * 2,
    maximum,
    magnification,
    amplitude,
    shoulderWidth,
  };
}
export interface ControlLensTextures extends LensTextures {
  coverage: string;
  rim: string;
  rimScale: number;
}
const cache = new Map<string, ControlLensTextures>();
const CACHE_LIMIT = 12;
const smooth = (a: number, b: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - a) / Math.max(0.0001, b - a)));
  return t * t * (3 - 2 * t);
};
const encode = (value: number) =>
  Math.round(128 + Math.max(-1, Math.min(1, value)) * 127);

/** Bounded DOM optics or the established media field. Displacement, coverage,
 * reflection and source-light coordinates share one physical contour. */
export function buildControlLensTextures(
  width: number,
  height: number,
  borderRadius: number,
  parameters: ControlLensParameters,
  profile: "dom" | "media" = "dom",
): ControlLensTextures {
  const { pad, maximum, amplitude, magnification, shoulderWidth } =
    controlLensMetrics(width, height, parameters, profile);
  const radius = Math.max(0, Math.min(borderRadius, width / 2, height / 2));
  const key = JSON.stringify([width, height, radius, parameters, profile]);
  const cached = cache.get(key);
  if (cached) {
    cache.delete(key);
    cache.set(key, cached);
    return cached;
  }
  const fw = width + pad * 2,
    fh = height + pad * 2;
  // Small controls get subpixel normals and antialiasing; allocation remains bounded.
  const resolution = Math.min(2, Math.sqrt(1_500_000 / (fw * fh)));
  const tw = Math.max(1, Math.ceil(fw * resolution)),
    th = Math.max(1, Math.ceil(fh * resolution));
  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;
  const context = canvas.getContext("2d");
  if (!context)
    return {
      displacement: "",
      reflection: "",
      shade: "",
      coverage: "",
      rim: "",
      rimScale: Math.max(width, height),
    };
  const map = context.createImageData(tw, th),
    reflection = context.createImageData(tw, th),
    coverage = context.createImageData(tw, th),
    rim = context.createImageData(tw, th);
  const hw = width / 2,
    hh = height / 2,
    cap = Math.max(1, Math.min(hw, hh));
  const angle = (parameters.specularAngle * Math.PI) / 180,
    lx = Math.sin(angle),
    ly = -Math.cos(angle),
    glintX = -Math.cos(angle),
    glintY = -Math.sin(angle);
  // Optical edge widths are CSS pixels, not a percentage of a surface. Large
  // panels must not acquire a huge rim; tiny controls retain room for the body.
  const lightScale = Math.max(width, height),
    rimHeight = Math.min(1.1, cap * 0.12),
    neutralHeight = Math.min(0.65, rimHeight * 0.65);
  for (let y = 0; y < Math.ceil(th / 2); y++)
    for (let x = 0; x < Math.ceil(tw / 2); x++) {
      const px = ((x + 0.5) / tw) * fw - fw / 2,
        py = ((y + 0.5) / th) * fh - fh / 2;
      const surface = roundedLensSurface(px, py, hw, hh, radius),
        inside = -surface.distance;
      const alpha = Math.max(0, Math.min(1, inside * resolution + 0.5));
      // DOM uses a broad, low-slope shoulder. The sampling field must not turn
      // back across a sharp fill boundary and make an inner ring. Media keeps
      // its established transfer curve.
      const shoulder = 1 - smooth(
        0, profile === "media" ? cap * 0.2 : shoulderWidth, inside,
      );
      let bend = shoulder;
      if (profile === "media") {
        const u = Math.max(0, Math.min(0.9998, 1 - Math.max(0, inside) / cap));
        const slope =
          ((parameters.depth / cap) * (parameters.curvature / 58) * u) /
          Math.sqrt(Math.max(0.0001, 1 - u * u));
        const nz = 1 / Math.sqrt(1 + slope * slope),
          nxy = slope * nz,
          eta = 1 / 1.5;
        const k = eta * nz - Math.sqrt(1 - eta * eta * (1 - nz * nz));
        const ray = Math.pow(
          Math.max(0, Math.min(1, (-k * nxy) / Math.max(0.001, eta - k * nz))),
          1 / parameters.splay,
        );
        bend = Math.min(1, ray / 0.6) * shoulder;
      }
      const bendAmount = profile === "media"
        ? amplitude
        : Math.min(amplitude, Math.max(1, radius) * 0.38 / magnification);
      const zoom = (1 - 1 / magnification) * (profile === "media" ? 1 - shoulder : 1);
      const dx = inside >= 0 ? -surface.nx * bend * bendAmount - px * zoom : 0;
      const dy =
        inside >= 0 ? -surface.ny * bend * bendAmount * 0.7 - py * zoom : 0;
      for (let q = 0; q < 4; q++) {
        const flipX = Boolean(q & 1),
          flipY = Boolean(q & 2),
          mx = flipX ? tw - 1 - x : x,
          my = flipY ? th - 1 - y : y,
          i = (my * tw + mx) * 4;
        map.data[i] = encode((dx * (flipX ? -1 : 1)) / maximum);
        map.data[i + 1] = encode((dy * (flipY ? -1 : 1)) / maximum);
        map.data[i + 2] = 128;
        map.data[i + 3] = 255;
        coverage.data[i] = coverage.data[i + 1] = coverage.data[i + 2] = 255;
        coverage.data[i + 3] = Math.round(alpha * 255);
        if (!alpha) continue;
        const nx = surface.nx * (flipX ? -1 : 1),
          ny = surface.ny * (flipY ? -1 : 1);
        const facing = nx * lx + ny * ly;
        // Encode a small directional transmission loss in the otherwise unused
        // blue channel for the video backend. Compact DOM lenses leave their
        // original RGB unchanged instead of multiplying it by attenuation.
        const attenuation =
          Math.min(
            0.16,
            ((0.08 + 0.06 * Math.abs(nx)) *
              (0.95 - 0.05 * facing) *
              Math.exp(-Math.max(0, inside) / 0.55) *
              parameters.edgeHighlight) /
              0.39,
          ) * alpha;
        if (profile === "media")
          map.data[i + 2] = Math.round(128 + (attenuation * 255) / 1.5);
        // Two neutral glints anchor the upper-left and lower-right shoulders.
        // This finish is independent of source hue. Keep the displacement and
        // blue transmission fields unchanged for the approved video backend.
        const glintFacing = nx * glintX + ny * glintY,
          glintSquared = glintFacing * glintFacing;
        const edge = Math.exp(-Math.max(0, inside) / 0.5) *
          (parameters.edgeHighlight / 0.39) *
          (0.02 + 0.26 * glintSquared * glintSquared);
        const diffuse = 0.06 * parameters.edgeHighlight / 0.39;
        const reflectionAlpha = diffuse + edge;
        const neutral = Math.round((230 * diffuse + 180 * edge) / Math.max(0.001, reflectionAlpha));
        reflection.data[i] =
          reflection.data[i + 1] =
          reflection.data[i + 2] =
            neutral;
        reflection.data[i + 3] = Math.round(reflectionAlpha * alpha * 255);
        // Both coordinates project to the lens center. Column mode neutralizes
        // X; area mode retains it so the SAME sampled mixture covers the rim.
        rim.data[i] = encode((-px * (flipX ? -1 : 1)) / lightScale);
        rim.data[i + 1] = encode((-py * (flipY ? -1 : 1)) / lightScale);
        // Blue is free in this coordinate texture. Pack the separate neutral
        // profile here, so widening a colored arc never fattens a neutral one.
        rim.data[i + 2] = Math.round(
          alpha * (1 - smooth(neutralHeight - 0.35, neutralHeight + 0.35, inside)) * 255,
        );
        // Source color occupies an actual band, rather than the fading tail of
        // a dark inset. Its height is capped at 1.1 CSS pixels; source-bearing
        // columns receive this wider profile in the SVG filter.
        rim.data[i + 3] = Math.round(
          alpha * (1 - smooth(rimHeight - 0.35, rimHeight + 0.35, inside)) * 255,
        );
      }
    }
  const encodeImage = (pixels: ImageData) => {
    context.putImageData(pixels, 0, 0);
    return canvas.toDataURL("image/png");
  };
  // Compact controls have no black shade texture or composited shade layer.
  const textures = {
    displacement: encodeImage(map),
    reflection: encodeImage(reflection),
    shade: "",
    coverage: encodeImage(coverage),
    rim: encodeImage(rim),
    rimScale: lightScale * 2,
  };
  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!);
  cache.set(key, textures);
  return textures;
}
export function clearControlLensCache() {
  cache.clear();
}

/** Damped spring response with a small, bounded overshoot. Movement alone never
 * rebuilds a texture. This analytic response needs no physics loop while idle. */
export function controlLensSpring(progress: number) {
  return sampleControlLensSpring(0, 1, 0, Math.max(0, progress), 1).value;
}

/** The same damped spring, including momentum when a gesture is retargeted.
 * Position is in CSS pixels; time is milliseconds and velocity is px/ms. */
export function sampleControlLensSpring(
  from: number,
  to: number,
  velocity: number,
  elapsed: number,
  duration: number,
) {
  if (duration <= 0 || elapsed >= duration) return { value: to, velocity: 0 };
  const omega = 12 / duration,
    decay = 0.76 * omega,
    frequency = omega * Math.sqrt(1 - 0.76 * 0.76),
    a = from - to,
    limit = omega * Math.max(1, Math.abs(a)) * 2,
    momentum = Math.max(-limit, Math.min(limit, velocity)),
    b = (momentum + decay * a) / frequency,
    envelope = Math.exp(-decay * elapsed),
    sine = Math.sin(frequency * elapsed),
    cosine = Math.cos(frequency * elapsed);
  return {
    value: to + envelope * (a * cosine + b * sine),
    velocity:
      envelope *
      ((b * frequency - decay * a) * cosine -
        (a * frequency + decay * b) * sine),
  };
}
