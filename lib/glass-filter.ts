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
  glint?: number;
  /** A small moving map in a larger, original DOM source. Outside stays neutral. */
  mapRegion?: { x: number; y: number; width: number; height: number };
  coverage?: string;
  /** Optional source light. Columns preserve spatial color;
   * dominant mixes the bounded lens area. No CPU readback. */
  sourceRim?: {
    map: string;
    coverage: string;
    scale: number;
    amount: number;
    mode: "column" | "dominant";
    lensWidth: number;
    lensHeight: number;
    /** Flat explicit targets weight their content against this actual plane. */
    planeColor?: string;
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
    const neutralBlue = 1 + (1.5 * 128) / 255;
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
  if (config.sourceRim && config.sourceRim.amount > 0) {
    const light = config.sourceRim;
    const firstPrimitive = filter.children.length;
    const mask = element("feImage", {
      href: light.map,
      ...region,
      preserveAspectRatio: "none",
      result: "sourceRimMask",
    });
    mask.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      light.map,
    );
    if (config.mapRegion) mask.dataset.positionedMap = "";
    filter.append(mask);
    if (!config.mapRegion || !config.coverage) {
      const coverage = element("feImage", {
        href: light.coverage,
        ...region,
        preserveAspectRatio: "none",
        result: "sourceBounds",
      });
      coverage.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        light.coverage,
      );
      filter.append(coverage);
    }
    filter.append(
      element("feComposite", {
        in: "SourceGraphic",
        in2:
          config.mapRegion && config.coverage ? "lensCoverage" : "sourceBounds",
        operator: "in",
        result: "lensLightSource",
      }),
    );
    // A gray track must contribute just like a colored track. Explicit targets
    // know their flat plane, so weight contrast to that plane, not saturation
    // or darkness. Blend the ORIGINAL source RGB; the contrast field only
    // decides how much each pixel contributes. No invented dark/brand color.
    if (light.planeColor) {
      filter.append(
        element("feFlood", {
          "flood-color": light.planeColor,
          result: "rimSourcePlane",
        }),
        element("feBlend", {
          in: "lensLightSource",
          in2: "rimSourcePlane",
          mode: "difference",
          result: "rimSourceContrast",
        }),
      );
    }
    for (const [name, row] of [
      ["red", "1 0 0"],
      ["green", "0 1 0"],
      ["blue", "0 0 1"],
    ] as const) {
      filter.append(
        element("feColorMatrix", {
          in: light.planeColor ? "rimSourceContrast" : "lensLightSource",
          type: "matrix",
          values: `${row} 0 0  ${row} 0 0  ${row} 0 0  0 0 0 1 0`,
          result: `light-${name}`,
        }),
      );
    }
    filter.append(
      element("feBlend", {
        in: "light-red",
        in2: "light-green",
        mode: "lighten",
        result: "light-max-rg",
      }),
      element("feBlend", {
        in: "light-max-rg",
        in2: "light-blue",
        mode: "lighten",
        result: "light-max",
      }),
    );
    if (!light.planeColor) {
      filter.append(
        element("feBlend", {
          in: "light-red",
          in2: "light-green",
          mode: "darken",
          result: "light-min-rg",
        }),
        element("feBlend", {
          in: "light-min-rg",
          in2: "light-blue",
          mode: "darken",
          result: "light-min",
        }),
      );
      const inverse = element("feComponentTransfer", {
        in: "light-min",
        result: "light-inverse-min",
      });
      for (const channel of ["feFuncR", "feFuncG", "feFuncB"] as const)
        inverse.append(
          element(channel, { type: "linear", slope: -1, intercept: 1 }),
        );
      // max + (1-min) - 1 keeps alpha at one. Direct max-min subtraction
      // would also subtract alpha and erase the color before weighting it.
      filter.append(
        inverse,
        element("feComposite", {
          in: "light-max",
          in2: "light-inverse-min",
          operator: "arithmetic",
          k1: 0,
          k2: 1,
          k3: 1,
          k4: -1,
          result: "light-chroma",
        }),
      );
    }
    filter.append(
      element("feColorMatrix", {
        in: light.planeColor ? "light-max" : "light-chroma",
        type: "matrix",
        values: `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 ${light.planeColor ? 0.03 : 0.08}`,
        result: "light-density",
      }),
    );
    const weight = element("feComponentTransfer", {
      in: "light-density",
      result: "weightedDensity",
    });
    weight.append(
      element("feFuncA", {
        type: "gamma",
        amplitude: 1,
        exponent: 2,
        offset: 0,
      }),
    );
    filter.append(
      weight,
      element("feComposite", {
        in: "lensLightSource",
        in2: "weightedDensity",
        operator: "in",
        result: "visibleLight",
      }),
    );
    filter.append(
      element("feGaussianBlur", {
        in: "visibleLight",
        stdDeviation: `${light.mode === "dominant" ? light.lensWidth / 2 : 0.6} ${light.lensHeight / 2}`,
        result: "columnLight",
      }),
    );
    const color = element("feComponentTransfer", {
      in: "columnLight",
      result: "resolvedColumnLight",
    });
    // Preserve source RGB. Darkening it made the colored rim read as a shadow.
    color.append(element("feFuncA", { type: "linear", slope: 256 }));
    const coordinates = element("feComponentTransfer", {
      in: "sourceRimMask",
      result: "rimCoordinates",
    });
    coordinates.append(
      element("feFuncR", {
        type: "linear",
        slope: light.mode === "dominant" ? 255 / 254 : 0,
        intercept: light.mode === "dominant" ? -1 / 254 : 0.5,
      }),
      element("feFuncG", {
        type: "linear",
        slope: 255 / 254,
        intercept: -1 / 254,
      }),
    );
    const projection = element("feDisplacementMap", {
      in: "resolvedColumnLight",
      in2: "rimCoordinates",
      scale: light.scale,
      xChannelSelector: "R",
      yChannelSelector: "G",
      result: "rimColumnColor",
    });
    if (config.mapRegion) {
      projection.dataset.positionedScale = String(light.scale);
      projection.dataset.mapWidth = String(region.width);
    }
    filter.append(color, coordinates, projection);
    if (light.mode === "column") {
      const thin = element("feColorMatrix", {
        in: "sourceRimMask",
        type: "matrix",
        // The map's blue channel stores the independent neutral rim profile.
        // Alpha stores the wider, pixel-bounded source-color band.
        values: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 1 0 0",
        result: "neutralRimHeight",
      });
      const energyProjection = element("feDisplacementMap", {
        in: "columnLight",
        in2: "rimCoordinates",
        scale: light.scale,
        xChannelSelector: "R",
        yChannelSelector: "G",
        result: "columnRimEnergy",
      });
      if (config.mapRegion) {
        energyProjection.dataset.positionedScale = String(light.scale);
        energyProjection.dataset.mapWidth = String(region.width);
      }
      const energy = element("feComponentTransfer", {
        in: "columnRimEnergy",
        result: "resolvedRimEnergy",
      });
      // Discard the neutral density floor when deciding whether to widen the
      // band. Gray/off-state light stays visible without becoming a broad tint.
      energy.append(element("feFuncA", {
        type: "linear", slope: 32, intercept: -0.12,
      }));
      filter.append(
        thin,
        energyProjection,
        energy,
        element("feComposite", {
          in: "sourceRimMask",
          in2: "resolvedRimEnergy",
          operator: "in",
          result: "chromaticRimHeight",
        }),
        element("feComposite", {
          in: "chromaticRimHeight",
          in2: "neutralRimHeight",
          operator: "over",
          result: "columnRimHeight",
        }),
      );
    }
    filter.append(
      element("feComposite", {
        in: "rimColumnColor",
        in2:
          light.mode === "dominant" ? "sourceRimMask" : "columnRimHeight",
        operator: "in",
        result: "sourceRimColor",
      }),
    );
    const opacity = element("feComponentTransfer", {
      in: "sourceRimColor",
      result: "sourceRimLight",
    });
    opacity.append(
      element("feFuncA", {
        type: "linear",
        slope: Math.max(0, Math.min(1, light.amount)),
      }),
    );
    filter.append(opacity);
    if (config.mapRegion)
      for (const node of [...filter.children].slice(firstPrimitive)) {
        for (const [key, value] of Object.entries(region))
          node.setAttribute(key, String(value));
        (node as SVGElement).dataset.positionedMap = "";
      }
    // The final composition covers the complete original source, restoring all
    // pixels outside the small light region. Never clip this blend to the lens.
    filter.append(
      element("feBlend", {
        in: "sourceRimLight",
        in2: transmitted,
        mode: "normal",
        result: "litTransmission",
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
        stdDeviation: "1 24",
        edgeMode: "duplicate",
        result: "ambient",
      }),
    );
    filter.append(
      element("feColorMatrix", {
        in: "ambient",
        type: "saturate",
        values: 1.5,
        result: "ambientColor",
      }),
    );
    const energy = element("feComponentTransfer", {
      in: "ambientColor",
      result: "ambientLight",
    });
    for (const channel of ["feFuncR", "feFuncG", "feFuncB"] as const)
      energy.append(element(channel, { type: "linear", slope: 1.15 }));
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
