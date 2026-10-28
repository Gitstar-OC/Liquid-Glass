import { describe, expect, it } from "vitest";
import { buildDisplacementFilter, GlassFilterManager } from "@/lib/glass-filter";
const config = { map: "data:image/png;base64,test", width: 180, height: 160, depth: 60, chroma: 0 };

describe("portable SVG filter", () => {
  it("carries existing source color into the rim without a new scene capture",()=>{
    const filter=buildDisplacementFilter({...config,reflection:"legacy",rim:"data:image/png;base64,light",colorBleed:.75,glint:.55});
    expect(filter.querySelector('[result="ambient"]')).toHaveAttribute("in","SourceGraphic");
    expect(filter.querySelector('[result="rimLight"]')).toHaveAttribute("href","data:image/png;base64,light");
    expect(filter.querySelector("feBlend")).toHaveAttribute("in2","displaced");
    expect(filter.querySelector("feBlend")).toHaveAttribute("mode","normal");
    expect(filter.querySelector('[result="ambient"]')).toHaveAttribute("stdDeviation","1 24");
    expect(filter.querySelectorAll("feDisplacementMap")).toHaveLength(1);
    expect(filter.querySelector('[result="coloredRim"] feFuncA')?.getAttribute("slope")).toBe("0.75");
  });
  it("projects each lens's source column onto its rim without shifting neighboring columns",()=>{
    const filter=buildDisplacementFilter({...config,rim:"rim",rimScale:80,colorBleed:1});
    const projected=filter.querySelector('[result="columnColor"]');
    expect(projected).toHaveAttribute("in","ambientLight");
    expect(projected).toHaveAttribute("in2","columnCoordinates");
    expect(projected).toHaveAttribute("scale","80");
    expect(projected).toHaveAttribute("xChannelSelector","R");
    expect(filter.querySelector('[result="maskedColor"]')).toHaveAttribute("in","columnColor");
  });
  it("softens transmitted content before adding the sharp source-colored edge",()=>{
    const filter=buildDisplacementFilter({...config,blur:8,rim:"rim",colorBleed:1});
    expect(filter.querySelector('[result="transmitted"]')).toHaveAttribute("in","displaced");
    expect(filter.querySelector('[result="transmitted"]')).toHaveAttribute("stdDeviation","8");
    expect(filter.querySelector("feBlend")).toHaveAttribute("in2","transmitted");
    expect(filter.querySelector('[result="ambient"]')).toHaveAttribute("in","SourceGraphic");
  });
  it("omits the color-light pass entirely when disabled or glint is zero",()=>{
    for(const extra of [{colorBleed:0,glint:1},{colorBleed:1,glint:0}]){
      const filter=buildDisplacementFilter({...config,reflection:"map",...extra});
      expect(filter.querySelector("feGaussianBlur")).toBeNull();
      expect(filter.querySelector("feBlend")).toBeNull();
    }
  });
  it("uses one displacement at zero chroma and two for red/cyan dispersion", () => {
    expect(buildDisplacementFilter(config).querySelectorAll("feDisplacementMap")).toHaveLength(1);
    const filter = buildDisplacementFilter({ ...config, chroma: .1 });
    expect(filter.querySelectorAll("feDisplacementMap")).toHaveLength(2);
    expect(filter.querySelector('[result="dR"]')?.getAttribute("scale")).toBe("66");
    expect(Number(filter.querySelector('[result="dGB"]')?.getAttribute("scale"))).toBeCloseTo(54);
  });
  it("sets both image href forms and CSS-pixel filter bounds", () => {
    const filter = buildDisplacementFilter(config);
    const image = filter.querySelector("feImage")!;
    expect(image.getAttribute("href")).toBe(config.map);
    expect(image.getAttributeNS("http://www.w3.org/1999/xlink", "href")).toBe(config.map);
    expect(filter.getAttribute("filterUnits")).toBe("userSpaceOnUse");
    expect(filter.getAttribute("width")).toBe("180");
  });
  it("refreshes the filter ID without rebuilding maps or accumulating definitions", () => {
    const housing = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const target = document.createElement("div");
    const manager = new GlassFilterManager(housing, target);
    manager.update(config);
    const previous = target.style.filter;
    for (let frame = 0; frame < 100; frame++) manager.refresh();
    expect(target.style.filter).not.toBe(previous);
    expect(housing.children).toHaveLength(2);
    for (const image of housing.querySelectorAll("feImage")) expect(image.getAttribute("href")).toBe(config.map);
    expect(target.dataset.glassFilterPaints).toBe("101");
    manager.destroy();
    expect(target.style.filter).toBe("");
    expect(housing.children).toHaveLength(0);
  });
});
