import {
  ambientRimStrength,
  interiorLensOffset,
  lensEdgeShade,
  lensSurface,
  refractLensRay,
  resolveOptics,
  type GlassShape,
  type GlassOptics,
  type LensParams,
  type LensTextures,
} from "@/lib/glass";

export interface AtlasLens {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  shape?: GlassShape;
}
export interface AtlasPixels {
  width: number;
  height: number;
  displacement: Uint8ClampedArray;
  reflection: Uint8ClampedArray;
  mask: Uint8ClampedArray;
  rim: Uint8ClampedArray;
}
/** One displacement field for sibling shapes. Uses the playground's SDF and Snell model. */
export function buildAtlasPixels(
  width: number,
  height: number,
  lenses: AtlasLens[],
  params: LensParams,
  optical?: Partial<GlassOptics>,
): AtlasPixels {
  const w = Math.max(1, Math.min(8192, Number.isFinite(width) ? width : 1));
  const h = Math.max(1, Math.min(8192, Number.isFinite(height) ? height : 1));
  const scale = Math.min(1, Math.sqrt(1_500_000 / (w * h)));
  const tw = Math.max(1, Math.floor(w * scale)),
    th = Math.max(1, Math.floor(h * scale));
  const displacement = new Uint8ClampedArray(tw * th * 4);
  const reflection = new Uint8ClampedArray(displacement.length),
    mask = new Uint8ClampedArray(displacement.length);
  const ambientRim = new Uint8ClampedArray(displacement.length);
  const columnHeight = Math.max(
    1,
    ...lenses.map((lens) => (Number.isFinite(lens.height) ? lens.height : 0)),
  );
  for (let i = 0; i < displacement.length; i += 4) {
    displacement[i] = displacement[i + 1] = displacement[i + 2] = 128;
    displacement[i + 3] = 255;
  }
  const optics = resolveOptics(optical);
  const radians = (optics.lightAngle * Math.PI) / 180;
  const lx = Math.sin(radians) * 0.7,
    ly = -Math.cos(radians) * 0.7,
    lz = Math.sqrt(1 - 0.49);
  const halfZ = 1 + lz,
    halfLength = Math.hypot(lx, ly, halfZ);
  const encode = (n: number) =>
    Math.round(128 + Math.max(-1, Math.min(1, n)) * 127);
  for (const lens of lenses) {
    if (
      ![lens.x, lens.y, lens.width, lens.height, lens.radius].every(
        Number.isFinite,
      ) ||
      lens.width < 2 ||
      lens.height < 2
    )
      continue;
    const hw = lens.width / 2,
      hh = lens.height / 2,
      r = Math.max(0, Math.min(lens.radius, hw, hh));
    const bevel = Math.min(
      params.splay + params.feather * 0.55,
      Math.min(hw, hh) * 0.65,
    );
    const left = Math.max(0, Math.floor((lens.x * tw) / w)),
      right = Math.min(tw, Math.ceil(((lens.x + lens.width) * tw) / w));
    const top = Math.max(0, Math.floor((lens.y * th) / h)),
      bottom = Math.min(th, Math.ceil(((lens.y + lens.height) * th) / h));
    for (let y = top; y < bottom; y++)
      for (let x = left; x < right; x++) {
        const px = ((x + 0.5) * w) / tw - lens.x - hw,
          py = ((y + 0.5) * h) / th - lens.y - hh;
        const surface = lensSurface(px, py, hw, hh, r, lens.shape);
        const inside = -surface.distance;
        if (inside < -0.5 / scale) continue;
        const i = (y * tw + x) * 4;
        const ray = refractLensRay(Math.max(0, inside), bevel, optics);
        const strength = Math.pow(ray.offset, params.curve / 2.3);
        const interior =
          inside >= 0 && optics.refractiveIndex !== 1
            ? interiorLensOffset(px, py, hw, hh, optics.interior, inside, bevel)
            : { x: 0, y: 0 };
        displacement[i] = encode(-surface.nx * strength + interior.x);
        displacement[i + 1] = encode(-surface.ny * strength + interior.y);
        mask[i] = mask[i + 1] = mask[i + 2] = 255;
        mask[i + 3] = Math.round(
          Math.max(0, Math.min(1, inside * scale + 0.5)) * 255,
        );
        if (inside < 0 || inside >= bevel || bevel <= 0) continue;
        ambientRim[i] = ambientRim[i + 2] = 128;
        ambientRim[i + 1] = encode((-2 * py) / columnHeight);
        ambientRim[i + 3] = Math.round(
          ambientRimStrength(inside, surface.ny, optics.refractiveIndex) * 255,
        );
        const nx = surface.nx * ray.normalXY,
          ny = surface.ny * ray.normalXY;
        const facing = nx * lx + ny * ly;
        const specular = Math.pow(
          Math.max(0, (nx * lx + ny * ly + ray.normalZ * halfZ) / halfLength),
          100 - optics.roughness * 85,
        );
        const rim = Math.exp(-inside / 1.1);
        const light =
          optics.refractiveIndex === 1
            ? 0
            : ray.fresnel * (0.12 + Math.max(0, facing) * 0.3) +
              specular * 0.6 +
              rim * Math.max(0, facing) * 0.7;
        // Match the independent lens's reflection followed by its optical shade.
        // Bake their alpha composition into one texture, keeping one atlas light pass.
        const opacity = Math.max(0, Math.min(1, params.glint / 100));
        const lightAlpha =
          (Math.round(Math.min(0.85, light) * 255) / 255) * opacity;
        const shadeAlpha =
          (Math.round(lensEdgeShade(facing, rim, ray.fresnel) * 255) / 255) *
          opacity;
        const alpha = shadeAlpha + lightAlpha * (1 - shadeAlpha);
        const color =
          alpha > 0
            ? Math.round((255 * lightAlpha * (1 - shadeAlpha)) / alpha)
            : 0;
        reflection[i] = reflection[i + 1] = reflection[i + 2] = color;
        reflection[i + 3] = Math.round(alpha * 255);
      }
  }
  return {
    width: tw,
    height: th,
    displacement,
    reflection,
    mask,
    rim: ambientRim,
  };
}
type AtlasTextures = LensTextures & { mask: string };
const atlasCache = new Map<string, AtlasTextures>();
let atlasBuilds = 0,
  atlasHits = 0;
export function getAtlasTextureCacheStats() {
  return { builds: atlasBuilds, hits: atlasHits, entries: atlasCache.size };
}
export function clearAtlasTextureCache() {
  atlasCache.clear();
  atlasBuilds = 0;
  atlasHits = 0;
}
export function buildAtlasTextures(
  width: number,
  height: number,
  lenses: AtlasLens[],
  params: LensParams,
  optics?: Partial<GlassOptics>,
): AtlasTextures | null {
  const mapOptics = { ...resolveOptics(optics), colorBleed: 0 };
  const key = JSON.stringify([
    width,
    height,
    lenses,
    params.splay,
    params.feather,
    params.curve,
    params.glint,
    mapOptics,
  ]);
  const cached = atlasCache.get(key);
  if (cached) {
    atlasHits++;
    atlasCache.delete(key);
    atlasCache.set(key, cached);
    return cached;
  }
  const pixels = buildAtlasPixels(width, height, lenses, params, optics);
  const canvas = document.createElement("canvas");
  canvas.width = pixels.width;
  canvas.height = pixels.height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const encode = (data: Uint8ClampedArray) => {
    const image = context.createImageData(pixels.width, pixels.height);
    image.data.set(data);
    context.putImageData(image, 0, 0);
    return canvas.toDataURL("image/png");
  };
  const result = {
    displacement: encode(pixels.displacement),
    reflection: encode(pixels.reflection),
    mask: encode(pixels.mask),
    rim: encode(pixels.rim),
    rimScale: Math.max(1, ...lenses.map((lens) => lens.height)),
    shade: "",
  };
  atlasBuilds++;
  if (atlasCache.size >= 2) atlasCache.delete(atlasCache.keys().next().value!);
  atlasCache.set(key, result);
  return result;
}
