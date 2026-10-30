/** SVG filter lifecycle shared by DOM-scene and image-source renderers. */
export interface GlassFilterConfig {
  map: string;
  width: number;
  height: number;
  depth: number;
  chroma: number;
  /** Blur the transmitted scene before compositing the sharp colored rim. */
  blur?: number;
  /** Compact maps encode directional transmission in blue (128 = unchanged). */
  opticalTransmission?: boolean;
  postFilter?: string;
  /** Reuse the lens's ambient rim mask; reflection is the legacy fallback. */
  reflection?: string;
  rim?: string;
  rimScale?: number;
  colorBleed?: number;
  /** Compact image surfaces retain actual RGB instead of boosting it. */
  colorSaturation?: number;
  colorGain?: number;
  colorSpread?: number;
  glint?: number;
  /** A small moving map in a larger, original DOM source. Outside stays neutral. */
  mapRegion?: { x: number; y: number; width: number; height: number };
  coverage?: string;
  /** Optional completed-slider reflection of its bounded source mixture. */
  sourceRim?: {
    map: string;
    scale: number;
    amount: number;
    lensWidth: number;
    lensHeight: number;
  };
}
const SVG = "http://www.w3.org/2000/svg";
let filterSequence = 0;
function element<K extends keyof SVGElementTagNameMap>(
  name: K,
  attributes: Record<string, string | number>,
) {
  const node = document.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attributes))
    node.setAttribute(key, String(value));
  return node;
}
export function buildDisplacementFilter(config: GlassFilterConfig) {
  const filter = element("filter", {
    x: 0,
    y: 0,
    width: config.width,
    height: config.height,
    filterUnits: "userSpaceOnUse",
    primitiveUnits: "userSpaceOnUse",
    "color-interpolation-filters": "sRGB",
  });
  const region = config.mapRegion ?? {
    x: 0,
    y: 0,
    width: config.width,
    height: config.height,
  };
  const image = element("feImage", {
    href: config.map,
    ...region,
    preserveAspectRatio: "none",
    result: "encodedMap",
  });
  if (config.mapRegion) image.dataset.positionedMap = "";
  image.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "xlink:href",
    config.map,
  );
  filter.appendChild(image);
  if (config.mapRegion) {
    filter.append(
      element("feFlood", {
        "flood-color": "rgb(128,128,128)",
        result: "neutralField",
      }),
    );
    const merge = element("feMerge", { result: "positionedMap" });
    merge.append(
      element("feMergeNode", { in: "neutralField" }),
      element("feMergeNode", { in: "encodedMap" }),
    );
    filter.append(merge);
  }
  const neutral = element("feComponentTransfer", {
    in: config.mapRegion ? "positionedMap" : "encodedMap",
    result: "map",
  });
  neutral.append(
    element("feFuncR", {
      type: "linear",
      slope: 255 / 254,
      intercept: -1 / 254,
    }),
    element("feFuncG", {
      type: "linear",
      slope: 255 / 254,
      intercept: -1 / 254,
    }),
  );
  filter.appendChild(neutral);
  const displacement = (scale: number, result: string) =>
    element("feDisplacementMap", {
      in: "SourceGraphic",
      in2: "map",
      scale,
      xChannelSelector: "R",
      yChannelSelector: "G",
      "data-depth-ratio": config.depth ? scale / config.depth : 1,
      result,
    });
  if (config.chroma > 0) {
    // Two passes, red + cyan, rather than three full RGB displacement passes.
    filter.append(
      displacement(config.depth * (1 + config.chroma), "dR"),
      displacement(config.depth * (1 - config.chroma), "dGB"),
    );
    filter.append(
      element("feColorMatrix", {
        in: "dR",
        type: "matrix",
        values: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
        result: "cR",
      }),
      element("feColorMatrix", {
        in: "dGB",
        type: "matrix",
        values: "0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0",
        result: "cGB",
      }),
    );
    filter.appendChild(
      element("feComposite", {
        in: "cR",
        in2: "cGB",
        operator: "arithmetic",
        k1: 0,
        k2: 1,
        k3: 1,
        k4: 0,
        result: "displaced",
      }),
    );
  } else filter.appendChild(displacement(config.depth, "displaced"));
  const blur = Math.max(
    0,
    Math.min(64, Number.isFinite(config.blur) ? config.blur! : 0),
  );
  if (blur > 0)
    filter.append(
      element("feGaussianBlur", {
        in: "displaced",
        stdDeviation: blur,
        edgeMode: "duplicate",
        result: "transmitted",
      }),
    );
  let transmitted = blur > 0 ? "transmitted" : "displaced";
  if (config.opticalTransmission) {
    // The reference's 2% transmission loss is applied to the source itself,
    // rather than adding a black overlay or a gray body over the clear cap.
    const neutralBlue = 0.98 + (1.5 * 128) / 255;
    filter.append(
      element("feColorMatrix", {
        in: "map",
        type: "matrix",
        values: `0 0 -1.5 0 ${neutralBlue}  0 0 -1.5 0 ${neutralBlue}  0 0 -1.5 0 ${neutralBlue}  0 0 0 0 1`,
        result: "capTransmission",
      }),
      element("feComposite", {
        in: transmitted,
        in2: "capTransmission",
        operator: "arithmetic",
        k1: 1,
        k2: 0,
        k3: 0,
        k4: 0,
        result: "opticalContent",
      }),
    );
    transmitted = "opticalContent";
  }
  if (config.mapRegion && config.coverage) {
    const mask = element("feImage", {
      href: config.coverage,
      ...region,
      preserveAspectRatio: "none",
      result: "lensCoverage",
    });
    mask.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      config.coverage,
    );
    mask.dataset.positionedMap = "";
    filter.append(
      mask,
      element("feComposite", {
        in: transmitted,
        in2: "lensCoverage",
        operator: "in",
        result: "lensContent",
      }),
      element("feComposite", {
        in: "SourceGraphic",
        in2: "lensCoverage",
        operator: "out",
        result: "originalOutside",
      }),
    );
    filter.append(
      element("feComposite", {
        in: "originalOutside",
        in2: "lensContent",
        operator: "arithmetic",
        k1: 0,
        k2: 1,
        k3: 1,
        k4: 0,
        result: "boundedTransmission",
      }),
    );
    transmitted = "boundedTransmission";
  }
  // A completed slider can carry its actual source mixture around the cap.
  // Normal controls get their colored edge directly from displacement. Avoid
  // extracting RGB channels, estimating a primary hue or painting a dark ring.
  if (config.sourceRim && config.sourceRim.amount > 0) {
    const light = config.sourceRim;
    const mask = element("feImage", {
      href: light.map, ...region, preserveAspectRatio: "none", result: "sourceRimMask",
    });
    const coordinates = element("feComponentTransfer", {
      in: "sourceRimMask", result: "rimCoordinates",
    });
    for (const channel of ["feFuncR", "feFuncG"] as const)
      coordinates.append(element(channel, {
        type: "linear", slope: 255 / 254, intercept: -1 / 254,
      }));
    const projection = element("feDisplacementMap", {
      in: "sourceMixture", in2: "rimCoordinates", scale: light.scale,
      xChannelSelector: "R", yChannelSelector: "G", result: "rimMixture",
    });
    if (config.mapRegion) {
      mask.dataset.positionedMap = "";
      projection.dataset.positionedScale = String(light.scale);
      projection.dataset.mapWidth = String(region.width);
    }
    const opacity = element("feComponentTransfer", {
      in: "rimMixture", result: "sourceRimLight",
    });
    opacity.append(element("feFuncA", {
      type: "linear", slope: Math.max(0, Math.min(1, light.amount)),
    }));
    filter.append(
      mask, coordinates,
      element("feGaussianBlur", {
        in: "SourceGraphic", stdDeviation: `${light.lensWidth / 4} ${light.lensHeight / 4}`,
        edgeMode: "duplicate", result: "sourceMixture",
      }),
      projection, opacity,
      element("feComposite", {
        in: "sourceRimLight", in2: "sourceRimMask", operator: "in", result: "completedRim",
      }),
      element("feBlend", {
        in: "completedRim", in2: transmitted, mode: "normal", result: "litTransmission",
      }),
    );
    transmitted = "litTransmission";
  }
  const bleed = Math.max(0, Math.min(1, config.colorBleed ?? 0));
  const rimMap = config.rim || config.reflection;
  if (bleed && rimMap && (config.glint ?? 1) > 0) {
    // SourceGraphic is the existing bounded DOM mirror, including live content.
    // No raster capture, source copy, pixel readback, or animated map is added.
    // A narrow horizontal kernel keeps neighboring colors separate while the
    // taller vertical kernel carries the local column toward the upper/lower rim.
    filter.append(
      element("feGaussianBlur", {
        in: "SourceGraphic",
        stdDeviation: `1 ${Math.max(0, Math.min(32, config.colorSpread ?? 24))}`,
        edgeMode: "duplicate",
        result: "ambient",
      }),
    );
    filter.append(
      element("feColorMatrix", {
        in: "ambient",
        type: "saturate",
        values: Math.max(0, Math.min(2, config.colorSaturation ?? 1.5)),
        result: "ambientColor",
      }),
    );
    const energy = element("feComponentTransfer", {
      in: "ambientColor",
      result: "ambientLight",
    });
    for (const channel of ["feFuncR", "feFuncG", "feFuncB"] as const)
      energy.append(element(channel, { type: "linear", slope: Math.max(0, Math.min(2, config.colorGain ?? 1.15)) }));
    filter.append(energy);
    const light = element("feImage", {
      href: rimMap,
      x: 0,
      y: 0,
      width: config.width,
      height: config.height,
      preserveAspectRatio: "none",
      result: "rimLight",
    });
    light.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", rimMap);
    filter.append(light);
    const columnScale = Math.max(
      0,
      Math.min(8192, Number.isFinite(config.rimScale) ? config.rimScale! : 0),
    );
    if (columnScale > 0) {
      const coordinates = element("feComponentTransfer", {
        in: "rimLight",
        result: "columnCoordinates",
      });
      coordinates.append(
        element("feFuncR", {
          type: "linear",
          slope: 255 / 254,
          intercept: -1 / 254,
        }),
        element("feFuncG", {
          type: "linear",
          slope: 255 / 254,
          intercept: -1 / 254,
        }),
      );
      filter.append(
        coordinates,
        element("feDisplacementMap", {
          in: "ambientLight",
          in2: "columnCoordinates",
          scale: columnScale,
          xChannelSelector: "R",
          yChannelSelector: "G",
          result: "columnColor",
        }),
      );
    }
    filter.append(
      element("feComposite", {
        in: columnScale > 0 ? "columnColor" : "ambientLight",
        in2: "rimLight",
        operator: "in",
        result: "maskedColor",
      }),
    );
    const opacity = element("feComponentTransfer", {
      in: "maskedColor",
      result: "coloredRim",
    });
    // A thin colored edge needs enough energy to survive the neutral tint and
    // white specular layer above it. Keep its coverage soft, rather than wider.
    opacity.append(
      element("feFuncA", {
        type: "linear",
        slope: bleed * Math.min(1, 2 * (config.glint ?? 1)),
      }),
    );
    filter.append(opacity);
    // Normal composition retains colored glints on white backdrops as well.
    filter.append(
      element("feBlend", {
        in: "coloredRim",
        in2: transmitted,
        mode: "normal",
      }),
    );
  }
  return filter;
}

/** Browsers that invalidate live SVG filters reuse the graph. WebKit needs a
 * fresh ID per paint; retain one previous definition for that handoff only. */
export class GlassFilterManager {
  template: SVGFilterElement | null = null;
  key = "";
  refreshes = 0;
  suffix = "";
  private freshId =
    typeof navigator !== "undefined" &&
    /AppleWebKit/.test(navigator.userAgent) &&
    !/(Chrome|Chromium|Edg|OPR)\//.test(navigator.userAgent);
  constructor(
    private housing: SVGSVGElement,
    private target: HTMLElement,
    private property: "filter" | "backdropFilter" = "filter",
  ) {}
  update(config: GlassFilterConfig) {
    this.suffix = config.postFilter ? ` ${config.postFilter}` : "";
    const key = JSON.stringify(config);
    if (this.key !== key) {
      this.template = buildDisplacementFilter(config);
      this.key = key;
    }
    this.refresh();
  }
  /** A resized control can replace its field without rebuilding the SVG graph. */
  replaceMap(map: string, depth: number) {
    const image = this.template?.querySelector('[result="encodedMap"]');
    if (image) {
      image.setAttribute("href", map);
      image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", map);
    }
    for (const node of this.template?.querySelectorAll<SVGElement>("[data-depth-ratio]") ?? [])
      node.setAttribute("scale", String(depth * Number(node.dataset.depthRatio)));
  }
  /** Position updates never rebuild the map or filter graph. */
  moveMap(x: number, y: number, width?: number, height?: number) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    for (const image of this.template?.querySelectorAll(
      "[data-positioned-map]",
    ) ?? []) {
      image.setAttribute("x", String(x));
      image.setAttribute("y", String(y));
      if (width !== undefined && Number.isFinite(width) && width > 0)
        image.setAttribute("width", String(width));
      if (height !== undefined && Number.isFinite(height) && height > 0)
        image.setAttribute("height", String(height));
    }
    if (width !== undefined)
      for (const node of this.template?.querySelectorAll<SVGElement>(
        "[data-positioned-scale]",
      ) ?? []) {
        const base = Number(node.dataset.mapWidth),
          scale = Number(node.dataset.positionedScale);
        if (base > 0)
          node.setAttribute("scale", String((scale * width) / base));
      }
  }
  refresh = () => {
    if (!this.template) return;
    const filter = this.freshId
      ? this.template.cloneNode(true) as SVGFilterElement
      : this.template;
    if (filter.parentNode !== this.housing) {
      filter.id = `liquid-frame-${++filterSequence}`;
      this.housing.appendChild(filter);
    }
    const value = `url("#${filter.id}")${this.suffix}`;
    if (this.target.style[this.property] !== value)
      this.target.style[this.property] = value;
    if (this.property === "backdropFilter")
      this.target.style.setProperty("-webkit-backdrop-filter", value);
    while (this.housing.children.length > (this.freshId ? 2 : 1))
      this.housing.firstElementChild!.remove();
    this.refreshes++;
    this.target.dataset.glassFilterPaints = String(this.refreshes);
  };
  destroy() {
    this.target.style[this.property] = "";
    if (this.property === "backdropFilter")
      this.target.style.removeProperty("-webkit-backdrop-filter");
    this.housing.replaceChildren();
    this.template = null;
  }
}
