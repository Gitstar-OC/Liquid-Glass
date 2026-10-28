/** SVG filter lifecycle shared by DOM-scene and image-source renderers. */
export interface GlassFilterConfig {
  map: string;
  width: number;
  height: number;
  depth: number;
  chroma: number;
  /** Blur the transmitted scene before compositing the sharp colored rim. */
  blur?: number;
  postFilter?: string;
  /** Reuse the lens's ambient rim mask; reflection is the legacy fallback. */
  reflection?: string;
  rim?: string;
  rimScale?: number;
  colorBleed?: number;
  glint?: number;
}
const SVG = "http://www.w3.org/2000/svg";
let filterSequence = 0;
function element<K extends keyof SVGElementTagNameMap>(name: K, attributes: Record<string, string | number>) {
  const node = document.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  return node;
}
export function buildDisplacementFilter(config: GlassFilterConfig) {
  const filter = element("filter", { x: 0, y: 0, width: config.width, height: config.height, filterUnits: "userSpaceOnUse", primitiveUnits: "userSpaceOnUse", "color-interpolation-filters": "sRGB" });
  const image = element("feImage", { href: config.map, x: 0, y: 0, width: config.width, height: config.height, preserveAspectRatio: "none", result: "encodedMap" });
  image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", config.map);
  filter.appendChild(image);
  const neutral = element("feComponentTransfer", { in: "encodedMap", result: "map" });
  neutral.append(element("feFuncR", { type: "linear", slope: 255 / 254, intercept: -1 / 254 }), element("feFuncG", { type: "linear", slope: 255 / 254, intercept: -1 / 254 }));
  filter.appendChild(neutral);
  const displacement = (scale: number, result: string) => element("feDisplacementMap", { in: "SourceGraphic", in2: "map", scale, xChannelSelector: "R", yChannelSelector: "G", result });
  if (config.chroma > 0) {
    // Two passes, red + cyan, rather than three full RGB displacement passes.
    filter.append(displacement(config.depth * (1 + config.chroma), "dR"), displacement(config.depth * (1 - config.chroma), "dGB"));
    filter.append(element("feColorMatrix", { in: "dR", type: "matrix", values: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0", result: "cR" }), element("feColorMatrix", { in: "dGB", type: "matrix", values: "0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0", result: "cGB" }));
    filter.appendChild(element("feComposite", { in: "cR", in2: "cGB", operator: "arithmetic", k1: 0, k2: 1, k3: 1, k4: 0, result: "displaced" }));
  } else filter.appendChild(displacement(config.depth, "displaced"));
  const blur = Math.max(0, Math.min(64, Number.isFinite(config.blur) ? config.blur! : 0));
  if (blur > 0) filter.append(element("feGaussianBlur", {in: "displaced", stdDeviation: blur, edgeMode: "duplicate", result: "transmitted"}));
  const transmitted = blur > 0 ? "transmitted" : "displaced";
  const bleed = Math.max(0, Math.min(1, config.colorBleed ?? 0));
  const rimMap = config.rim || config.reflection;
  if (bleed && rimMap && (config.glint ?? 1) > 0) {
    // SourceGraphic is the existing bounded DOM mirror, including live content.
    // No raster capture, source copy, pixel readback, or animated map is added.
    // A narrow horizontal kernel keeps neighboring colors separate while the
    // taller vertical kernel carries the local column toward the upper/lower rim.
    filter.append(element("feGaussianBlur", {in: "SourceGraphic", stdDeviation: "1 24", edgeMode: "duplicate", result: "ambient"}));
    filter.append(element("feColorMatrix", {in: "ambient", type: "saturate", values: 1.5, result: "ambientColor"}));
    const energy = element("feComponentTransfer", {in: "ambientColor", result: "ambientLight"});
    for (const channel of ["feFuncR", "feFuncG", "feFuncB"] as const) energy.append(element(channel, {type: "linear", slope: 1.15}));
    filter.append(energy);
    const light = element("feImage", {href: rimMap, x: 0, y: 0, width: config.width, height: config.height, preserveAspectRatio: "none", result: "rimLight"});
    light.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", rimMap);
    filter.append(light);
    const columnScale = Math.max(0, Math.min(8192, Number.isFinite(config.rimScale) ? config.rimScale! : 0));
    if (columnScale > 0) {
      const coordinates = element("feComponentTransfer", {in:"rimLight",result:"columnCoordinates"});
      coordinates.append(element("feFuncR", {type:"linear",slope:255/254,intercept:-1/254}),element("feFuncG", {type:"linear",slope:255/254,intercept:-1/254}));
      filter.append(coordinates,element("feDisplacementMap",{in:"ambientLight",in2:"columnCoordinates",scale:columnScale,xChannelSelector:"R",yChannelSelector:"G",result:"columnColor"}));
    }
    filter.append(element("feComposite", {in: columnScale > 0 ? "columnColor" : "ambientLight", in2: "rimLight", operator: "in", result: "maskedColor"}));
    const opacity = element("feComponentTransfer", {in: "maskedColor", result: "coloredRim"});
    // A thin colored edge needs enough energy to survive the neutral tint and
    // white specular layer above it. Keep its coverage soft, rather than wider.
    opacity.append(element("feFuncA", {type: "linear", slope: bleed * Math.min(1, 2 * (config.glint ?? 1))}));
    filter.append(opacity);
    // Normal composition retains colored glints on white backdrops as well.
    filter.append(element("feBlend", {in: "coloredRim", in2: transmitted, mode: "normal"}));
  }
  return filter;
}

/** New ID and node per *paint*, not per map. Retain the previous definition
 * for one handoff and cap the housing at two filters; no unbounded SVG growth.
 */
export class GlassFilterManager {
  template: SVGFilterElement | null = null;
  key = "";
  refreshes = 0;
  suffix = "";
  constructor(private housing: SVGSVGElement, private target: HTMLElement, private property: "filter" | "backdropFilter" = "filter") {}
  update(config: GlassFilterConfig) {
    this.suffix = config.postFilter ? ` ${config.postFilter}` : "";
    const key = JSON.stringify(config);
    if (this.key !== key) { this.template = buildDisplacementFilter(config); this.key = key; }
    this.refresh();
  }
  refresh = () => {
    if (!this.template) return;
    const filter = this.template.cloneNode(true) as SVGFilterElement;
    const id = `liquid-frame-${++filterSequence}`;
    filter.id = id;
    this.housing.appendChild(filter);
    this.target.style[this.property] = `url("#${id}")${this.suffix}`;
    if (this.property === "backdropFilter") this.target.style.setProperty("-webkit-backdrop-filter", `url("#${id}")${this.suffix}`);
    while (this.housing.children.length > 2) this.housing.firstElementChild!.remove();
    this.refreshes++;
    this.target.dataset.glassFilterPaints = String(this.refreshes);
  };
  destroy() {
    this.target.style[this.property] = "";
    if (this.property === "backdropFilter") this.target.style.removeProperty("-webkit-backdrop-filter");
    this.housing.replaceChildren();
    this.template = null;
  }
}
