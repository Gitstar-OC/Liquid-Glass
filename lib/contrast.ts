/**
 * Contrast engine for adaptive ink.
 *
 * The sampler reads the *actual* backdrop behind a piece of text — canvas
 * pixels when available, otherwise resolved CSS paints (background-color and
 * gradient stops) composited with source-over alpha — then decides whether
 * light or dark ink yields the higher WCAG contrast ratio.
 */

export type ContrastTone = "light" | "dark";

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ContrastSample {
  /** Mean relative luminance (0..1) of the backdrop under the element. */
  luminance: number;
  tone: ContrastTone;
  /** WCAG contrast ratio for the chosen ink. */
  contrast: number;
  /** WCAG contrast ratio of the ink that was *not* chosen. */
  rejectedContrast: number;
  /** How many probe points contributed. */
  samples: number;
  /** Readability overlay needed for the selected ink (0 means clear glass). */
  scrimOpacity?: number;
  /** An enclosing surface already owns the ink and its protection. */
  inherited?: boolean;
}

export const WHITE_INK = "#ffffff";
export const BLACK_INK = "#000000";

const INK_FLIP_LUMINANCE = 0.1791;
const DEFAULT_LUMINANCE = 0.02;

export function channelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(color: Pick<Rgba, "r" | "g" | "b">): number {
  return (
    0.2126 * channelToLinear(color.r) +
    0.7152 * channelToLinear(color.g) +
    0.0722 * channelToLinear(color.b)
  );
}

export function contrastRatio(a: number, b: number): number {
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

/** Source-over: `top` painted above `bottom`. */
export function composite(top: Rgba, bottom: Rgba): Rgba {
  const a = top.a + bottom.a * (1 - top.a);
  if (a <= 0) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    a,
    r: (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / a,
    g: (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / a,
    b: (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / a,
  };
}

export function averageColors(colors: Rgba[]): Rgba | null {
  if (colors.length === 0) return null;
  if (colors.length === 1) return colors[0];
  let a = 0;
  let r = 0;
  let g = 0;
  let b = 0;
  for (const c of colors) {
    a += c.a;
    r += c.r * c.a;
    g += c.g * c.a;
    b += c.b * c.a;
  }
  if (a <= 0) return { r: 0, g: 0, b: 0, a: 0 };
  return { r: r / a, g: g / a, b: b / a, a: a / colors.length };
}

export function toneForLuminance(luminance: number): ContrastTone {
  return luminance < INK_FLIP_LUMINANCE ? "light" : "dark";
}

export function sampleFromLuminance(
  luminance: number,
  samples: number,
): ContrastSample {
  const tone = toneForLuminance(luminance);
  const light = contrastRatio(luminance, 1);
  const dark = contrastRatio(luminance, 0);
  return {
    luminance,
    tone,
    contrast: tone === "light" ? light : dark,
    rejectedContrast: tone === "light" ? dark : light,
    samples,
  };
}

/* ------------------------------------------------------------------ colors */

let colorContext: CanvasRenderingContext2D | null | undefined;

function getColorContext(): CanvasRenderingContext2D | null {
  if (colorContext !== undefined) return colorContext;
  if (typeof document === "undefined") {
    colorContext = null;
    return null;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  colorContext = canvas.getContext("2d", { willReadFrequently: true });
  return colorContext;
}

/** Resolve any CSS color string to straight (un-premultiplied) sRGB bytes. */
export function parseCssColor(value: string): Rgba | null {
  const color = value.trim();
  if (!color || color === "none" || color === "currentcolor") return null;
  const ctx = getColorContext();
  if (!ctx) return null;
  if (
    typeof CSS !== "undefined" &&
    CSS.supports &&
    !CSS.supports("color", color)
  ) {
    return null;
  }
  try {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000000";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2], a: data[3] / 255 };
  } catch {
    return null;
  }
}

const COLOR_FN =
  /(rgba?|hsla?|oklch|oklab|lab|lch|color|color-mix|light-dark)\s*\(/gi;
const HEX = /#[0-9a-fA-F]{3,8}\b/g;

/**
 * Pull every color token out of a computed `background-image` value. Handles
 * nested functions (e.g. `color-mix(...)`) by balancing parentheses.
 */
export function extractCssColors(input: string): Rgba[] {
  const out: Rgba[] = [];
  COLOR_FN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = COLOR_FN.exec(input))) {
    const start = match.index + match[0].length - 1;
    let depth = 0;
    let end = -1;
    for (let i = start; i < input.length; i++) {
      const ch = input[i];
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    if (end < 0) continue;
    const parsed = parseCssColor(input.slice(match.index, end));
    if (parsed) out.push(parsed);
    COLOR_FN.lastIndex = end;
  }
  HEX.lastIndex = 0;
  while ((match = HEX.exec(input))) {
    const parsed = parseCssColor(match[0]);
    if (parsed && parsed.a > 0) out.push(parsed);
  }
  return out;
}

function splitCssList(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote = "";
  let start = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      if (ch === quote && input[i - 1] !== "\\") quote = "";
      continue;
    }
    if (ch === "'" || ch === '"') quote = ch;
    else if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) {
      parts.push(input.slice(start, i).trim());
      start = i + 1;
    }
  }
  if (start < input.length) parts.push(input.slice(start).trim());
  return parts.filter(Boolean);
}

function readColorToken(value: string): { color: Rgba; rest: string } | null {
  const input = value.trimStart();
  const leading = value.length - input.length;
  let token = "";
  if (input.startsWith("#")) {
    token = /^#[\da-f]{3,8}/i.exec(input)?.[0] ?? "";
  } else {
    const fn = /^([a-z][\w-]*)\(/i.exec(input);
    if (fn) {
      let depth = 0;
      for (let i = fn[0].length - 1; i < input.length; i++) {
        if (input[i] === "(") depth++;
        else if (input[i] === ")" && --depth === 0) {
          token = input.slice(0, i + 1);
          break;
        }
      }
    } else {
      const word = /^[a-z]+/i.exec(input)?.[0] ?? "";
      if (word && typeof CSS !== "undefined" && CSS.supports?.("color", word)) {
        token = word;
      }
    }
  }
  if (!token) return null;
  const color = parseCssColor(token);
  return color ? { color, rest: value.slice(leading + token.length) } : null;
}

interface ColorStop {
  color: Rgba;
  position: number;
}

function parseColorStops(parts: string[]): ColorStop[] {
  const stops = parts.flatMap((part) => {
    const parsed = readColorToken(part);
    if (!parsed) return [];
    const positions = [...parsed.rest.matchAll(/(-?(?:\d*\.)?\d+)%/g)];
    return [
      {
        color: parsed.color,
        position: positions.length ? Number(positions[0][1]) / 100 : Number.NaN,
      },
    ];
  });
  if (stops.length < 2) return stops;
  if (!Number.isFinite(stops[0].position)) stops[0].position = 0;
  if (!Number.isFinite(stops.at(-1)?.position))
    stops[stops.length - 1].position = 1;
  let previous = 0;
  while (previous < stops.length - 1) {
    let next = previous + 1;
    while (next < stops.length - 1 && !Number.isFinite(stops[next].position))
      next++;
    const start = stops[previous].position;
    const end = stops[next].position;
    for (let i = previous + 1; i < next; i++) {
      stops[i].position =
        start + ((end - start) * (i - previous)) / (next - previous);
    }
    previous = next;
  }
  return stops;
}

function sampleStops(stops: ColorStop[], t: number): Rgba | null {
  if (!stops.length) return null;
  const value = Math.max(0, Math.min(1, t));
  const right = stops.findIndex((stop) => stop.position >= value);
  if (right < 0) return stops.at(-1)!.color;
  if (right === 0) return stops[0].color;
  const left = stops[right - 1];
  const next = stops[right];
  const span = next.position - left.position;
  const mix = span <= 0 ? 1 : (value - left.position) / span;
  return {
    r: left.color.r + (next.color.r - left.color.r) * mix,
    g: left.color.g + (next.color.g - left.color.g) * mix,
    b: left.color.b + (next.color.b - left.color.b) * mix,
    a: left.color.a + (next.color.a - left.color.a) * mix,
  };
}

function descriptorCoordinate(
  value: string | undefined,
  axis: "x" | "y",
): number {
  if (!value) return 0.5;
  const keyword = value.trim().toLowerCase();
  if (keyword === "left" || keyword === "top") return 0;
  if (keyword === "right" || keyword === "bottom") return 1;
  if (keyword === "center") return 0.5;
  const percent = /(-?(?:\d*\.)?\d+)%/.exec(keyword);
  if (percent) return Number(percent[1]) / 100;
  return axis === "x" ? 0.5 : 0.5;
}

function sampleGradient(
  image: string,
  x: number,
  y: number,
  width: number,
  height: number,
): Rgba | null {
  const match = /^(?:repeating-)?(linear|radial|conic)-gradient\((.*)\)$/i.exec(
    image.trim(),
  );
  if (!match) return null;
  const kind = match[1].toLowerCase();
  const parts = splitCssList(match[2]);
  if (!parts.length) return null;
  const descriptor = readColorToken(parts[0]) ? "" : (parts.shift() ?? "");
  const stops = parseColorStops(parts);
  if (!stops.length) return null;

  let t = 0.5;
  if (kind === "linear") {
    let angle = 180;
    const degrees = /(-?(?:\d*\.)?\d+)deg/i.exec(descriptor);
    if (degrees) angle = Number(degrees[1]);
    else if (/to\s+top/i.test(descriptor)) angle = 0;
    else if (/to\s+right/i.test(descriptor)) angle = 90;
    else if (/to\s+left/i.test(descriptor)) angle = 270;
    else if (/to\s+bottom/i.test(descriptor)) angle = 180;
    const radians = (angle * Math.PI) / 180;
    const dx = Math.sin(radians);
    const dy = -Math.cos(radians);
    const lineLength = Math.max(
      1,
      Math.abs(dx) * width + Math.abs(dy) * height,
    );
    t = 0.5 + ((x - 0.5) * width * dx + (y - 0.5) * height * dy) / lineLength;
  } else if (kind === "radial") {
    const at = /\bat\s+([\w.%+-]+)(?:\s+([\w.%+-]+))?/i.exec(descriptor);
    const cx = descriptorCoordinate(at?.[1], "x");
    const cy = descriptorCoordinate(at?.[2], "y");
    const sizeDescriptor = descriptor.split(/\bat\b/i)[0];
    const radii = sizeDescriptor.match(
      /(-?(?:\d*\.)?\d+)%\s+(-?(?:\d*\.)?\d+)%/i,
    );
    const rx = radii?.[1] ? (Number(radii[1]) / 100) * width : width / 2;
    const ry = radii?.[2] ? (Number(radii[2]) / 100) * height : height / 2;
    t = Math.hypot(
      ((x - cx) * width) / Math.max(1, rx),
      ((y - cy) * height) / Math.max(1, ry),
    );
  } else {
    const at = /\bat\s+([\w.%+-]+)(?:\s+([\w.%+-]+))?/i.exec(descriptor);
    const cx = descriptorCoordinate(at?.[1], "x");
    const cy = descriptorCoordinate(at?.[2], "y");
    t = (Math.atan2(y - cy, x - cx) / (2 * Math.PI) + 1) % 1;
  }
  return sampleStops(stops, t);
}

function sampleBackgroundImage(
  image: string,
  x: number,
  y: number,
  width: number,
  height: number,
): Rgba | null {
  let result: Rgba | null = null;
  const layers = splitCssList(image);
  for (let i = layers.length - 1; i >= 0; i--) {
    const paint = sampleGradient(layers[i], x, y, width, height);
    if (paint) result = result ? composite(paint, result) : paint;
  }
  return result;
}

/* --------------------------------------------------------------- sampling */

function readCanvasPixel(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
): Rgba | null {
  try {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return null;
    const sx = Math.floor(((x - rect.left) / rect.width) * canvas.width);
    const sy = Math.floor(((y - rect.top) / rect.height) * canvas.height);
    if (sx < 0 || sy < 0 || sx >= canvas.width || sy >= canvas.height)
      return null;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    const data = ctx.getImageData(sx, sy, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2], a: data[3] / 255 };
  } catch {
    return null;
  }
}

function paintFor(
  node: Element,
  x: number,
  y: number,
  computed?: CSSStyleDeclaration,
): Rgba | null {
  if (node instanceof HTMLCanvasElement) {
    return null; // handled separately (per-pixel)
  }
  let style: CSSStyleDeclaration;
  try {
    style = computed ?? getComputedStyle(node);
  } catch {
    return null;
  }
  const background = parseCssColor(style.backgroundColor);
  const hasImage = style.backgroundImage && style.backgroundImage !== "none";
  let paint: Rgba | null =
    background && background.a > 0.001 ? background : null;
  if (hasImage) {
    const rect = node.getBoundingClientRect();
    const imagePaint = sampleBackgroundImage(
      style.backgroundImage,
      rect.width ? (x - rect.left) / rect.width : 0.5,
      rect.height ? (y - rect.top) / rect.height : 0.5,
      rect.width,
      rect.height,
    );
    if (imagePaint) paint = paint ? composite(imagePaint, paint) : imagePaint;
  }
  return paint;
}

let imageSampleCanvas: HTMLCanvasElement | null = null;

function objectPosition(value: string, axis: "x" | "y"): number {
  const parts = value.split(/\s+/);
  const token = axis === "x" ? parts[0] : (parts[1] ?? parts[0]);
  if (token === "left" || token === "top") return 0;
  if (token === "right" || token === "bottom") return 1;
  const percent = /(-?(?:\d*\.)?\d+)%/.exec(token ?? "");
  return percent ? Number(percent[1]) / 100 : 0.5;
}

function readImagePixel(
  image: HTMLImageElement | HTMLVideoElement,
  x: number,
  y: number,
  bounds?: DOMRect,
  computed?: CSSStyleDeclaration,
): Rgba | null {
  const rect = bounds ?? image.getBoundingClientRect();
  const sourceWidth =
    image instanceof HTMLImageElement ? image.naturalWidth : image.videoWidth;
  const sourceHeight =
    image instanceof HTMLImageElement ? image.naturalHeight : image.videoHeight;
  if (rect.width < 1 || rect.height < 1 || sourceWidth < 1 || sourceHeight < 1)
    return null;
  if (image instanceof HTMLImageElement && !image.complete) return null;
  if (
    image instanceof HTMLVideoElement &&
    image.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
  )
    return null;

  let sx = ((x - rect.left) / rect.width) * sourceWidth;
  let sy = ((y - rect.top) / rect.height) * sourceHeight;
  const style = computed ?? getComputedStyle(image);
  const fit = style.objectFit;
  if (fit === "cover" || fit === "contain") {
    const scale =
      fit === "cover"
        ? Math.max(rect.width / sourceWidth, rect.height / sourceHeight)
        : Math.min(rect.width / sourceWidth, rect.height / sourceHeight);
    const renderedWidth = sourceWidth * scale;
    const renderedHeight = sourceHeight * scale;
    const offsetX =
      (rect.width - renderedWidth) * objectPosition(style.objectPosition, "x");
    const offsetY =
      (rect.height - renderedHeight) *
      objectPosition(style.objectPosition, "y");
    sx = (x - rect.left - offsetX) / scale;
    sy = (y - rect.top - offsetY) / scale;
    if (sx < 0 || sy < 0 || sx >= sourceWidth || sy >= sourceHeight) {
      return { r: 0, g: 0, b: 0, a: 0 };
    }
  }
  if (sx < 0 || sy < 0 || sx >= sourceWidth || sy >= sourceHeight) return null;
  try {
    imageSampleCanvas ??= document.createElement("canvas");
    imageSampleCanvas.width = 1;
    imageSampleCanvas.height = 1;
    const ctx = imageSampleCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    if (!ctx) return null;
    ctx.clearRect(0, 0, 1, 1);
    ctx.drawImage(image, sx, sy, 1, 1, 0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2], a: data[3] / 255 };
  } catch {
    // Cross-origin images without CORS permission cannot be read. The sampler
    // continues with the next available CSS layer instead.
    return null;
  }
}

export interface SampleOptions {
  /** Sample the same original DOM used by the lens, including non-hit-testable layers. */
  source?: HTMLElement | null;
  /** Optional material tint composited over sampled paints. */
  tintColor?: string;
  tintOpacity?: number;
  /** Probe grid resolution (default 5). */
  resolution?: number;
  /** Fraction of the element inset before sampling (default 0.06). */
  inset?: number;
  /** Optional fixed ink. Still measures protection needed for readability. */
  tone?: ContrastTone;
  brightness?: number;
  contrast?: number;
  saturate?: number;
  tintBlendMode?: string;
}

function filterPaint(color: Rgba, options: SampleOptions, tint?: Rgba): Rgba {
  const saturation = options.saturate ?? 1;
  const brightness = options.brightness ?? 1;
  const contrast = options.contrast ?? 1;
  const gray = 0.213 * color.r + 0.715 * color.g + 0.072 * color.b;
  const channel = (value: number) =>
    Math.max(
      0,
      Math.min(
        255,
        ((gray + (value - gray) * saturation) * brightness - 127.5) * contrast +
          127.5,
      ),
    );
  const filtered = {
    ...color,
    r: channel(color.r),
    g: channel(color.g),
    b: channel(color.b),
  };
  if (!tint) return filtered;
  return composite(
    options.tintBlendMode === "multiply"
      ? {
          ...tint,
          r: (tint.r * filtered.r) / 255,
          g: (tint.g * filtered.g) / 255,
          b: (tint.b * filtered.b) / 255,
        }
      : tint,
    filtered,
  );
}

const transparent: Rgba = { r: 0, g: 0, b: 0, a: 0 };
interface PaintNode {
  element: Element;
  style: CSSStyleDeclaration;
  rect: DOMRect;
  children: PaintNode[];
}

// Geometry is read once per measurement, never once per probe. Reading the
// original source also works when a modal makes it inert or pointer-events:none.
function prepareSource(element: Element): PaintNode | null {
  if (
    element.matches(
      "[data-liquid-glass], [data-glass-mirror-host], [data-adaptive-skip]",
    )
  )
    return null;
  const style = getComputedStyle(element);
  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    Number(style.opacity) === 0
  )
    return null;
  const children = [...element.children]
    .map(prepareSource)
    .filter((child): child is PaintNode => child !== null)
    .sort(
      (a, b) =>
        (Number.parseInt(a.style.zIndex) || 0) -
        (Number.parseInt(b.style.zIndex) || 0),
    );
  return { element, style, rect: element.getBoundingClientRect(), children };
}

interface PaintSample {
  color: Rgba;
  unknown: boolean;
}
function paintSource(node: PaintNode, x: number, y: number): PaintSample {
  const { element, rect, style } = node;
  const insideX = x >= rect.left && x < rect.right;
  const insideY = y >= rect.top && y < rect.bottom;
  if (
    (!insideX && /hidden|clip|scroll|auto/.test(style.overflowX)) ||
    (!insideY && /hidden|clip|scroll|auto/.test(style.overflowY))
  )
    return { color: transparent, unknown: false };
  let color = transparent;
  let unknown = false;
  if (insideX && insideY) {
    color = paintFor(element, x, y, style) ?? transparent;
    // CSS URL paints cannot be synchronously inspected without loading another
    // image. Treat them as unknown rather than sampling the page underneath.
    unknown = style.backgroundImage.includes("url(");
    if (
      element instanceof HTMLImageElement ||
      element instanceof HTMLVideoElement ||
      element instanceof HTMLCanvasElement
    ) {
      const pixel =
        element instanceof HTMLCanvasElement
          ? readCanvasPixel(element, x, y)
          : readImagePixel(element, x, y, rect, style);
      if (pixel) {
        color = composite(pixel, color);
        if (pixel.a >= 0.999) unknown = false;
      } else unknown = true;
    }
  }
  for (const child of node.children) {
    const paint = paintSource(child, x, y);
    color = composite(paint.color, color);
    unknown = paint.unknown || (unknown && paint.color.a < 0.999);
  }
  return {
    color: { ...color, a: color.a * Number.parseFloat(style.opacity || "1") },
    unknown,
  };
}

/** Smallest neutral overlay that protects the sampled points, in sRGB. */
function protectionFor(colors: Rgba[], tone: ContrastTone): number {
  const ink = tone === "light" ? 1 : 0;
  const channel = tone === "light" ? 0 : 255;
  for (let step = 0; step <= 80; step++) {
    const alpha = step / 100;
    if (
      colors.every(
        (color) =>
          contrastRatio(
            relativeLuminance(
              composite(
                { r: channel, g: channel, b: channel, a: alpha },
                color,
              ),
            ),
            ink,
          ) >= 4.8,
      )
    )
      return alpha;
  }
  return 0.8;
}

/** Sample the composited backdrop luminance behind `el`. */
export function sampleBackdrop(
  el: HTMLElement,
  options: SampleOptions = {},
): ContrastSample {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return sampleFromLuminance(DEFAULT_LUMINANCE, 0);
  }
  const rect = el.getBoundingClientRect();
  // Only inherit an explicit tone from an ancestor. Reading the element's own
  // data attribute would feed its previous answer back into the next sample.
  const explicit =
    !options.source &&
    el.parentElement?.closest<HTMLElement>("[data-adaptive-tone]")?.dataset
      .adaptiveTone;
  if (explicit === "light" || explicit === "dark") {
    const ink = explicit === "light" ? 1 : 0;
    return {
      ...sampleFromLuminance(ink === 1 ? 0.01 : 0.6, 0),
      inherited: true,
      scrimOpacity: 0,
    };
  }
  if (rect.width < 2 || rect.height < 2) {
    return sampleFromLuminance(DEFAULT_LUMINANCE, 0);
  }

  const resolution = Math.max(
    2,
    Math.min(
      9,
      Math.floor(Number.isFinite(options.resolution) ? options.resolution! : 5),
    ),
  );
  const inset = Math.max(
    0,
    Math.min(0.49, Number.isFinite(options.inset) ? options.inset! : 0.06),
  );
  const left = rect.left + rect.width * inset;
  const top = rect.top + rect.height * inset;
  const width = Math.max(1, rect.width * (1 - inset * 2));
  const height = Math.max(1, rect.height * (1 - inset * 2));

  const tintColor = options.tintColor ? parseCssColor(options.tintColor) : null;
  const tint = tintColor
    ? { ...tintColor, a: Math.max(0, Math.min(1, options.tintOpacity ?? 0)) }
    : undefined;
  const source = options.source ? prepareSource(options.source) : null;
  if (options.source && !source)
    return sampleFromLuminance(DEFAULT_LUMINANCE, 0);
  const colors: Rgba[] = [];
  let unavailable = false;
  let sum = 0;
  let darkest = 1;
  let lightest = 0;
  let count = 0;
  for (let row = 0; row < resolution; row++) {
    for (let col = 0; col < resolution; col++) {
      const x = left + ((col + 0.5) / resolution) * width;
      const y = top + ((row + 0.5) / resolution) * height;
      const paint = source ? paintSource(source, x, y) : null;
      if (paint?.unknown) unavailable = true;
      const raw = paint
        ? paint.unknown || paint.color.a < 0.985
          ? null
          : paint.color
        : colorAtPoint(x, y, el);
      const color = raw ? filterPaint(raw, options, tint) : null;
      const luminance = color ? relativeLuminance(color) : null;
      if (luminance === null) continue;
      colors.push(color!);
      sum += luminance;
      darkest = Math.min(darkest, luminance);
      lightest = Math.max(lightest, luminance);
      count++;
    }
  }
  if (count === 0 || unavailable)
    return sampleFromLuminance(DEFAULT_LUMINANCE, 0);
  const mean = sum / count;
  const averageChoice = sampleFromLuminance(mean, count);
  const whiteWorstCase = contrastRatio(lightest, 1);
  const blackWorstCase = contrastRatio(darkest, 0);
  const tone =
    options.tone ??
    (Math.abs(whiteWorstCase - blackWorstCase) < 0.12
      ? averageChoice.tone
      : whiteWorstCase > blackWorstCase
        ? "light"
        : "dark");
  return {
    luminance: mean,
    tone,
    contrast: tone === "light" ? whiteWorstCase : blackWorstCase,
    rejectedContrast: tone === "light" ? blackWorstCase : whiteWorstCase,
    samples: count,
    scrimOpacity: protectionFor(colors, tone),
  };
}

function colorAtPoint(
  x: number,
  y: number,
  exclude: HTMLElement,
  tint?: Rgba,
): Rgba | null {
  let stack: Element[];
  try {
    stack = document.elementsFromPoint(x, y);
  } catch {
    return null;
  }
  const layers: Rgba[] = [];
  let alpha = 0;
  // Hit testing returns front-to-back. Collect visible layers in that order,
  // stop at an opaque layer, then composite back-to-front.
  for (let i = 0; i < stack.length; i++) {
    const node = stack[i];
    if (node === exclude || exclude.contains(node)) continue;
    if (node instanceof HTMLElement && node.dataset.adaptiveSkip !== undefined)
      continue;
    if (node instanceof HTMLCanvasElement) {
      const pixel = readCanvasPixel(node, x, y);
      if (pixel && pixel.a > 0.01) {
        layers.push(pixel);
        alpha = alpha + pixel.a * (1 - alpha);
        if (alpha >= 0.985) break;
      }
      continue;
    }
    if (node instanceof HTMLImageElement || node instanceof HTMLVideoElement) {
      const pixel = readImagePixel(node, x, y);
      if (pixel && pixel.a > 0.01) {
        const opacity = Number.parseFloat(
          getComputedStyle(node).opacity || "1",
        );
        const paint = { ...pixel, a: pixel.a * opacity };
        layers.push(paint);
        alpha = alpha + paint.a * (1 - alpha);
        if (alpha >= 0.985) break;
        continue;
      }
      // Never infer the image's color from an unrelated layer underneath it.
      return null;
    }
    const style = getComputedStyle(node);
    if (style.backgroundImage.includes("url(")) return null;
    const raw = paintFor(node, x, y, style);
    const paint = raw
      ? { ...raw, a: raw.a * Number.parseFloat(style.opacity || "1") }
      : null;
    if (paint && paint.a > 0.004) {
      layers.push(paint);
      alpha = alpha + paint.a * (1 - alpha);
      if (alpha >= 0.985) break;
    }
  }
  if (layers.length === 0) return null;
  let result: Rgba = { r: 0, g: 0, b: 0, a: 0 };
  for (const layer of layers.reverse()) result = composite(layer, result);
  if (result.a < 0.35) return null;
  return tint ? composite(tint, result) : result;
}
