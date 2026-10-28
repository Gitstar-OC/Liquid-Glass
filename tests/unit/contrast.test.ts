import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sampleBackdrop } from "@/lib/contrast";

// A minimal color decoder keeps these tests independent of native canvas.
let fill = "rgb(0, 0, 0)";
const context = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  set fillStyle(value: string) { fill = value; },
  get fillStyle() { return fill; },
  getImageData: () => {
    const values = fill.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
    return { data: new Uint8ClampedArray([values[0], values[1], values[2], (values[3] ?? 1) * 255]) };
  },
};

function layer(color: string) {
  const element = document.createElement("div");
  element.style.backgroundColor = color;
  document.body.append(element);
  return element;
}
function target() {
  const element = layer("transparent");
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({ x: 0, y: 0, top: 0, left: 0, right: 100, bottom: 40, width: 100, height: 40, toJSON: () => ({}) });
  return element;
}

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
});
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

describe("backdrop paint order", () => {
  it("reads the opaque scene above the page background", () => {
    const text = target();
    const scene = layer("rgb(255, 255, 255)");
    const page = layer("rgb(0, 0, 0)");
    Object.defineProperty(document, "elementsFromPoint", { configurable: true, value: () => [text, scene, page] });
    const result = sampleBackdrop(text);
    expect(result.tone).toBe("dark");
    expect(result.luminance).toBeCloseTo(1);
    expect(result.contrast).toBeCloseTo(21);
  });

  it("does not use its previously chosen ink as a backdrop override", () => {
    const text = target();
    text.dataset.adaptiveTone = "light";
    const scene = layer("rgb(255, 255, 255)");
    Object.defineProperty(document, "elementsFromPoint", { configurable: true, value: () => [text, scene] });
    expect(sampleBackdrop(text).tone).toBe("dark");
    scene.style.backgroundColor = "rgb(0, 0, 0)";
    expect(sampleBackdrop(text).tone).toBe("light");
  });

  it("composites a translucent foreground over the opaque scene", () => {
    const text = target();
    const tint = layer("rgba(255, 255, 255, 0.5)");
    const scene = layer("rgb(0, 0, 0)");
    Object.defineProperty(document, "elementsFromPoint", { configurable: true, value: () => [text, tint, scene] });
    const result = sampleBackdrop(text);
    expect(result.luminance).toBeGreaterThan(.2);
    expect(result.luminance).toBeLessThan(.23);
  });

  it("keeps a bounded heading veil out of the glass field's ink sample", () => {
    const text = target();
    const source = layer("rgb(255, 255, 255)");
    const veil = layer("transparent");
    source.append(veil);
    source.style.opacity = veil.style.opacity = "1";
    veil.style.backgroundImage = "linear-gradient(90deg, rgb(0, 0, 0), rgba(0, 0, 0, 0))";
    const bounds = (left: number, width: number) => ({ x: left, y: 0, top: 0, left, right: left + width, bottom: 40, width, height: 40, toJSON: () => ({}) });
    vi.mocked(text.getBoundingClientRect).mockReturnValue(bounds(700, 100));
    vi.spyOn(source, "getBoundingClientRect").mockReturnValue(bounds(0, 1000));
    vi.spyOn(veil, "getBoundingClientRect").mockReturnValue(bounds(0, 400));

    const result = sampleBackdrop(text, { source });
    expect(result.tone).toBe("dark");
    expect(result.luminance).toBeCloseTo(1);
    expect(result.samples).toBe(25);
  });
});
