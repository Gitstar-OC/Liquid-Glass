export interface LensParams {
  depth: number;
  splay: number;
  feather: number;
  curve: number;
  blur: number;
  saturate: number;
  brightness: number;
  contrast: number;
  chroma: number;
  glint: number;
  tint: number;
  tintColor: string;
}

export type GlassPreset =
  | "transparent"
  | "clear"
  | "regular"
  | "frosted"
  | "thick";

/** Shared starting point for the playground and every glass component. */
export const GLASS_DEFAULT_PARAMS: Readonly<LensParams> = Object.freeze({
  depth: 28,
  splay: 10,
  feather: 20,
  curve: 2.2,
  blur: 4,
  saturate: 1,
  brightness: 1,
  contrast: 1,
  chroma: 0,
  glint: 55,
  tint: 0.025,
  tintColor: "#ffffff",
});

/**
 * The five materials.
 *
 * `depth` is the peak displacement in pixels, so the rim pulls content in by
 * `depth / 2`. Apple's glass reads as a *compressed* rim over a *clear*
 * interior: too much depth turns the band into smear, too little makes the
 * surface invisible. `curve` concentrates that pull into the last few pixels
 * of the bevel; higher means a tighter, brighter rim.
 */
export const GLASS_PRESETS: Record<GlassPreset, LensParams> = {
  transparent: {
    depth: 44,
    splay: 13,
    feather: 20,
    curve: 2.2,
    blur: 0,
    saturate: 1.45,
    brightness: 1.01,
    contrast: 1.08,
    chroma: 0.035,
    glint: 48,
    tint: 0,
    tintColor: "#ffffff",
  },
  clear: { ...GLASS_DEFAULT_PARAMS },
  regular: {
    depth: 27,
    splay: 10,
    feather: 15,
    curve: 2.4,
    blur: 8,
    saturate: 1.3,
    brightness: 1.02,
    contrast: 1.05,
    chroma: 0.02,
    glint: 50,
    tint: 0.07,
    tintColor: "#ffffff",
  },
  frosted: {
    depth: 15,
    splay: 8,
    feather: 12,
    curve: 2.5,
    blur: 12,
    saturate: 1.45,
    brightness: 1.01,
    contrast: 1.03,
    chroma: 0.008,
    glint: 36,
    tint: 0.11,
    tintColor: "#ffffff",
  },
  thick: {
    depth: 9,
    splay: 7,
    feather: 10,
    curve: 2.5,
    blur: 22,
    saturate: 1.3,
    brightness: 1,
    contrast: 1.02,
    chroma: 0,
    glint: 26,
    tint: 0.17,
    tintColor: "#ffffff",
  },
};

/** Independent optical geometry; material controls remain backward compatible. */
export interface GlassOptics {
  /** Air-to-glass refractive index. 1 disables bending. */
  refractiveIndex: number;
  /** Bevel height / width; controls the shape of the curved surface. */
  thickness: number;
  /** Direction of the distant light in degrees, clockwise from the top. */
  lightAngle: number;
  /** Specular spread, 0 = polished, 1 = diffuse. */
  roughness: number;
  /** Subtle, continuous interior lensing. Zero keeps a flat center. */
  interior: number;
  /** Nearby source colors carried into the optical rim; zero disables that pass. */
  colorBleed: number;
}

export const DEFAULT_OPTICS: GlassOptics = {
  refractiveIndex: 1.45,
  thickness: 0.7,
  lightAngle: -45,
  roughness: 0.18,
  interior: 0.18,
  colorBleed: 0.75,
};

export interface LensGeometry {
  radius: number;
  splay: number;
  feather: number;
  curve: number;
  pad: number;
  optics?: Partial<GlassOptics>;
  /** Pointer pull in pixels; a bounded, soft deformation of the clear center. */
  deformation?: { x: number; y: number };
  shape?: GlassShape;
}
export type GlassShape = "round" | "squircle";

/** Default content policy; an explicit manual mode preserves every supplied value. */
export function resolveBackdropTreatment(kind: "plain" | "image" | "content" | null, params: Pick<LensParams,"blur"|"depth">, adaptive: boolean, preserveBlur = false) {
  if (!adaptive || !kind) return {blur:params.blur,depth:params.depth};
  if (kind==="content") return {blur:preserveBlur?params.blur:Math.max(8,params.blur),depth:0};
  return {blur:!preserveBlur&&kind==="plain"?0:params.blur,depth:params.depth};
}

/** Shared contour for optical normals, antialiased masks, and DOM clipping. */
export function lensSurface(x: number, y: number, hw: number, hh: number, r: number, shape: GlassShape = "round") {
  if (shape === "round") return roundedLensSurface(x,y,hw,hh,r);
  const qx=Math.abs(x)-(hw-r), qy=Math.abs(y)-(hh-r), ox=Math.max(qx,0), oy=Math.max(qy,0);
  const norm=Math.pow(ox**4+oy**4,.25);
  if (!norm) return qx>qy ? {distance:qx-r,nx:Math.sign(x),ny:0} : {distance:qy-r,nx:0,ny:Math.sign(y)};
  const gx=(ox/norm)**3, gy=(oy/norm)**3, length=Math.hypot(gx,gy);
  return {distance:(norm+Math.min(Math.max(qx,qy),0)-r)/length,nx:Math.sign(x)*gx/length,ny:Math.sign(y)*gy/length};
}
export function lensContourPoints(width: number, height: number, radius: number, shape: GlassShape = "round") {
  const r=Math.max(0,Math.min(radius,width/2,height/2));
  const points:{x:number;y:number}[]=[];
  [[width-r,r,-Math.PI/2],[width-r,height-r,0],[r,height-r,Math.PI/2],[r,r,Math.PI]].forEach(([cx,cy,start])=>{
    for(let i=0;i<=24;i++){const a=start+i*Math.PI/48;const sx=Math.cos(a),sy=Math.sin(a);const power=shape==="squircle"?.5:1;points.push({x:cx+r*Math.sign(sx)*Math.abs(sx)**power,y:cy+r*Math.sign(sy)*Math.abs(sy)**power});}
  });
  return points;
}
export function lensOutlinePath(width: number, height: number, radius: number, shape: GlassShape = "round") {
  return lensContourPoints(width,height,radius,shape).map((p,i)=>`${i?"L":"M"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")+" Z";
}
export function lensClipPath(width: number, height: number, radius: number, shape: GlassShape = "round") {
  const r=Math.max(0,Math.min(radius,width/2,height/2));
  if (shape === "round" || !width || !height) return `inset(0 round ${r}px)`;
  return `polygon(${lensContourPoints(width,height,r,shape).map(p=>`${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`).join(",")})`;
}

export function elasticLensOffset(x: number, y: number, hw: number, hh: number, pull?: {x: number; y: number}) {
  if (!pull || hw <= 0 || hh <= 0) return {x: 0, y: 0};
  const u = x / hw, v = y / hh;
  const envelope = Math.max(0, 1 - u * u) * Math.max(0, 1 - v * v);
  const fold = envelope * Math.exp(-(u * u + v * v) * 1.4);
  return {x: finite(pull.x, 0, -48, 48) / 64 * fold, y: finite(pull.y, 0, -48, 48) / 64 * fold};
}

/** A shallow continuous bowl, independent of the high-curvature edge bevel.
 * The envelope vanishes at the boundary, so it cannot separate the shared rim.
 */
export function interiorLensOffset(x: number, y: number, hw: number, hh: number, strength: number, edgeDistance = Infinity, bevel = 1) {
  if (hw <= 0 || hh <= 0 || strength <= 0) return {x: 0, y: 0};
  const u = x / hw, v = y / hh;
  const envelope = Math.max(0, 1 - u * u) * Math.max(0, 1 - v * v);
  const edge = Math.max(0,Math.min(1,edgeDistance/Math.max(1,bevel)));
  const amount = Math.min(1, strength) * .75 * envelope * edge * edge * (3-2*edge);
  return {x: -u * amount, y: -v * amount};
}

export interface LensTextures {
  displacement: string;
  reflection: string;
  shade: string;
  /** Ambient color coverage, independent of the directional white reflection. */
  rim?: string;
}

/** A thin, soft optical rim. Vertical source columns favor the top/bottom arcs. */
export function ambientRimStrength(inside: number, normalY: number, refractiveIndex: number) {
  if (inside < 0 || refractiveIndex === 1) return 0;
  return .72 * Math.exp(-inside / 1.6) * (.35 + .65 * Math.abs(normalY));
}

const MAP_CACHE_MAX = 24;
const MAX_TEXTURE_PIXELS = 1_500_000;
const mapCache = new Map<string, LensTextures>();
const finite = (
  n: number | undefined,
  fallback: number,
  min: number,
  max: number,
) => (Number.isFinite(n) ? Math.max(min, Math.min(max, n!)) : fallback);

export function resolveOptics(value?: Partial<GlassOptics>): GlassOptics {
  return {
    refractiveIndex: finite(value?.refractiveIndex, 1.45, 1, 2.2),
    thickness: finite(value?.thickness, 0.7, 0.05, 2),
    lightAngle: finite(value?.lightAngle, -45, -360, 360),
    roughness: finite(value?.roughness, 0.18, 0, 1),
    interior: finite(value?.interior, 0.18, 0, 1),
    colorBleed: finite(value?.colorBleed, 0.75, 0, 1),
  };
}

/** Keep external config and transient slider values safe for CSS and maps. */
export function resolveLensParams(
  preset: GlassPreset,
  config?: Partial<LensParams>,
): LensParams {
  const defaults = GLASS_PRESETS[preset];
  const p = { ...defaults, ...config };
  return {
    depth: finite(p.depth, defaults.depth, 0, 160),
    splay: finite(p.splay, defaults.splay, 0, 80),
    feather: finite(p.feather, defaults.feather, 0, 80),
    curve: finite(p.curve, defaults.curve, 0.3, 4),
    blur: finite(p.blur, defaults.blur, 0, 40),
    saturate: finite(p.saturate, defaults.saturate, 0, 3),
    brightness: finite(p.brightness, defaults.brightness, 0.3, 2),
    contrast: finite(p.contrast, defaults.contrast, 0.3, 2),
    chroma: finite(p.chroma, defaults.chroma, 0, 0.3),
    glint: finite(p.glint, defaults.glint, 0, 150),
    tint: finite(p.tint, defaults.tint, 0, 1),
    tintColor: /^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/i.test(p.tintColor)
      ? p.tintColor
      : defaults.tintColor,
  };
}

export function clearLensMapCache(): void {
  mapCache.clear();
}

/** Analytic rounded rectangle normal: no finite-difference discontinuities. */
export function roundedLensSurface(
  x: number,
  y: number,
  hw: number,
  hh: number,
  r: number,
) {
  const qx = Math.abs(x) - (hw - r);
  const qy = Math.abs(y) - (hh - r);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  const length = Math.hypot(ox, oy);
  const distance = length + Math.min(Math.max(qx, qy), 0) - r;
  if (length > 0)
    return {
      distance,
      nx: (Math.sign(x) * ox) / length,
      ny: (Math.sign(y) * oy) / length,
    };
  return qx > qy
    ? { distance, nx: Math.sign(x), ny: 0 }
    : { distance, nx: 0, ny: Math.sign(y) };
}

/** Refract a view-normal ray through an elliptical bevel using Snell's law.
 * The result is a bounded lateral ray slope, before strength is applied.
 * A flat center and index 1 both produce exactly zero displacement.
 */
export function refractLensRay(
  distanceInside: number,
  bevel: number,
  optics: GlassOptics,
) {
  if (
    bevel <= 0 ||
    distanceInside < 0 ||
    distanceInside >= bevel ||
    optics.refractiveIndex === 1
  ) {
    return { offset: 0, normalXY: 0, normalZ: 1, fresnel: 0 };
  }
  const u = Math.max(0, Math.min(0.9995, 1 - distanceInside / bevel));
  const slope = (optics.thickness * u) / Math.sqrt(1 - u * u);
  const normalZ = 1 / Math.sqrt(1 + slope * slope);
  const normalXY = slope * normalZ;
  const eta = 1 / optics.refractiveIndex;
  const transmittedZ = Math.sqrt(1 - eta * eta * (1 - normalZ * normalZ));
  const k = eta * normalZ - transmittedZ;
  const rayXY = -k * normalXY;
  const rayZ = eta - k * normalZ;
  const f0 = Math.pow(
    (optics.refractiveIndex - 1) / (optics.refractiveIndex + 1),
    2,
  );
  return {
    offset: Math.min(1, rayXY / rayZ),
    normalXY,
    normalZ,
    fresnel: f0 + (1 - f0) * Math.pow(1 - normalZ, 5),
  };
}

export function buildLensMap(w: number, h: number, opts: LensGeometry): string {
  return buildLensTextures(w, h, opts).displacement;
}

const decodedTextures = new Map<string, Promise<void>>();
/** Decode before swapping an SVG feImage source. Retain promises, not image
 * elements; the browser can release decoded pixels under memory pressure. */
export function decodeLensTextures(textures: LensTextures): Promise<void> {
  const cached = decodedTextures.get(textures.displacement);
  if (cached) return cached;
  const ready = Promise.all(
    Object.values(textures)
      .filter(Boolean)
      .map(async (url) => {
        const image = new Image();
        image.src = url;
        if (typeof image.decode === "function")
          await image.decode().catch(() => {});
      }),
  ).then(() => {});
  if (decodedTextures.size >= 24)
    decodedTextures.delete(decodedTextures.keys().next().value!);
  decodedTextures.set(textures.displacement, ready);
  return ready;
}

/** Maps share a coordinate system and geometry, so the light hugs the lens. */
export function buildLensTextures(
  w: number,
  h: number,
  opts: LensGeometry,
): LensTextures {
  const width = finite(w, 1, 1, 8192);
  const height = finite(h, 1, 1, 8192);
  const optics = resolveOptics(opts.optics);
  const geometry = {
    shape: opts.shape ?? "round",
    radius: finite(opts.radius, 24, 0, Math.min(width, height) / 2),
    splay: finite(opts.splay, 12, 0, 80),
    feather: finite(opts.feather, 18, 0, 80),
    curve: finite(opts.curve, 2.3, 0.3, 4),
    pad: finite(opts.pad, 32, 0, Math.min(width, height) / 2),
    deformation: opts.deformation ? {x: finite(opts.deformation.x, 0, -48, 48), y: finite(opts.deformation.y, 0, -48, 48)} : undefined,
  };
  // Color bleed is a source-paint operation, never displacement geometry.
  const mapOptics = {...optics, colorBleed: 0};
  const key = JSON.stringify([width, height, geometry, mapOptics]);
  const cached = mapCache.get(key);
  if (cached) {
    mapCache.delete(key);
    mapCache.set(key, cached);
    return cached;
  }
  const scale = Math.min(1, Math.sqrt(MAX_TEXTURE_PIXELS / (width * height)));
  const tw = Math.max(1, Math.round(width * scale));
  const th = Math.max(1, Math.round(height * scale));
  const cv = document.createElement("canvas");
  cv.width = tw;
  cv.height = th;
  const ctx = cv.getContext("2d");
  if (!ctx) return { displacement: "", reflection: "", shade: "" };
  const displacement = ctx.createImageData(tw, th);
  const reflection = ctx.createImageData(tw, th);
  const shade = ctx.createImageData(tw, th);
  const ambientRim = ctx.createImageData(tw, th);
  const hw = Math.max(0, width / 2 - geometry.pad);
  const hh = Math.max(0, height / 2 - geometry.pad);
  const radius = Math.min(geometry.radius, hw, hh);
  const bevel = Math.min(
    geometry.splay + geometry.feather * 0.55,
    Math.min(hw, hh) * 0.65,
  );
  const radians = (optics.lightAngle * Math.PI) / 180;
  const lx = Math.sin(radians) * 0.7;
  const ly = -Math.cos(radians) * 0.7;
  const lz = Math.sqrt(1 - 0.7 * 0.7);
  const specularPower = 100 - optics.roughness * 85;
  const encode = (n: number) =>
    Math.round(128 + Math.max(-1, Math.min(1, n)) * 127);
  const halfZ = 1 + lz;
  const halfLength = Math.hypot(lx, ly, halfZ);
  // Only the geometry/refraction is four-fold symmetric. Reflection is lit
  // separately for each mirrored normal, so rotating the light remains real.
  for (let y = 0; y < Math.ceil(th / 2); y++) {
    for (let x = 0; x < Math.ceil(tw / 2); x++) {
      const px = ((x + 0.5) * width) / tw - width / 2;
      const py = ((y + 0.5) * height) / th - height / 2;
      const surface = lensSurface(px, py, hw, hh, radius, geometry.shape);
      const inside = -surface.distance;
      const ray = refractLensRay(inside, bevel, optics);
      const strength = Math.pow(ray.offset, geometry.curve / 2.3);
      const rim = inside >= 0 && inside < bevel ? Math.exp(-inside / 1.1) : 0;
      for (let quadrant = 0; quadrant < 4; quadrant++) {
        const flipX = quadrant & 1;
        const flipY = quadrant & 2;
        const mx = flipX ? tw - 1 - x : x;
        const my = flipY ? th - 1 - y : y;
        const nx = surface.nx * (flipX ? -1 : 1);
        const ny = surface.ny * (flipY ? -1 : 1);
        const i = (my * tw + mx) * 4;
        const elastic = elasticLensOffset(px * (flipX ? -1 : 1), py * (flipY ? -1 : 1), hw, hh, geometry.deformation);
        const interior = inside >= 0 ? interiorLensOffset(px * (flipX ? -1 : 1), py * (flipY ? -1 : 1), hw, hh, optics.interior, inside, bevel) : {x:0,y:0};
        displacement.data[i] = encode(-nx * strength + (optics.refractiveIndex === 1 ? 0 : elastic.x + interior.x));
        displacement.data[i + 1] = encode(-ny * strength + (optics.refractiveIndex === 1 ? 0 : elastic.y + interior.y));
        displacement.data[i + 2] = 128;
        displacement.data[i + 3] = 255;
        if (inside < 0 || inside >= bevel || bevel <= 0) continue;
        ambientRim.data[i] = ambientRim.data[i + 1] = ambientRim.data[i + 2] = 255;
        ambientRim.data[i + 3] = Math.round(ambientRimStrength(inside, ny, optics.refractiveIndex) * 255);
        const normalX = nx * ray.normalXY;
        const normalY = ny * ray.normalXY;
        const specular = Math.pow(
          Math.max(
            0,
            (normalX * lx + normalY * ly + ray.normalZ * halfZ) / halfLength,
          ),
          specularPower,
        );
        const facing = normalX * lx + normalY * ly;
        const edgeLight =
          optics.refractiveIndex === 1
            ? 0
            : ray.fresnel * (0.12 + Math.max(0, facing) * 0.3) +
              specular * 0.6 +
              rim * Math.max(0, facing) * 0.7;
        reflection.data[i] =
          reflection.data[i + 1] =
          reflection.data[i + 2] =
            255;
        reflection.data[i + 3] = Math.round(Math.min(0.85, edgeLight) * 255);
        shade.data[i + 3] = Math.round(
          Math.min(0.18, Math.max(0, -facing) * rim * 0.2) * 255,
        );
      }
    }
  }
  const encodeTexture = (image: ImageData) => {
    ctx.putImageData(image, 0, 0);
    return cv.toDataURL("image/png");
  };
  const shadeUrl = encodeTexture(shade);
  const reflectionUrl = encodeTexture(reflection);
  const rimUrl = encodeTexture(ambientRim);
  const textures = {
    displacement: encodeTexture(displacement),
    reflection: reflectionUrl,
    shade: shadeUrl,
    rim: rimUrl,
  };
  if (mapCache.size >= MAP_CACHE_MAX)
    mapCache.delete(mapCache.keys().next().value!);
  mapCache.set(key, textures);
  return textures;
}

let svgBackdropSupport: boolean | null = null;

export function supportsSvgBackdropFilter(): boolean {
  if (typeof window === "undefined") return false;
  if (svgBackdropSupport !== null) return svgBackdropSupport;
  const ua = navigator.userAgent;
  const chromiumMatch = /Chrom(e|ium)\/(\d+)/.exec(ua);
  let ok = false;
  if (chromiumMatch && !/Firefox|FxiOS/.test(ua)) {
    ok = parseInt(chromiumMatch[2], 10) >= 110;
  }
  svgBackdropSupport = ok;
  return ok;
}

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const n = parseInt(h, 16);
  if (Number.isNaN(n) || h.length !== 6) return [255, 255, 255];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
