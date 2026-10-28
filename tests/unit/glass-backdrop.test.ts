import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBackdropPlane } from "@/components/glass-backdrop";

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) };
}

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("explicit backdrop alignment", () => {
  function setup(fit: string, position = "50% 50%") {
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
    const image = document.createElement("img");
    image.src = "/scene.jpg";
    image.style.objectFit = fit;
    image.style.objectPosition = position;
    Object.defineProperties(image, {
      naturalWidth: { value: 1920 },
      naturalHeight: { value: 1080 },
      complete: { value: true },
    });
    vi.spyOn(image, "getBoundingClientRect").mockReturnValue(rect(0, 0, 800, 600));
    const surface = document.createElement("div");
    vi.spyOn(surface, "getBoundingClientRect").mockReturnValue(rect(200, 100, 300, 200));
    return renderHook(() => useBackdropPlane({ current: surface }, { current: image }, 32));
  }

  it("matches cover cropping and the surface offset in the source image", () => {
    const { result } = setup("cover");
    expect(result.current?.width).toBeCloseTo(1066.6667, 3);
    expect(result.current?.height).toBe(600);
    expect(result.current?.x).toBeCloseTo(-301.3333, 3);
    expect(result.current?.y).toBe(-68);
  });

  it("matches contain letterboxing", () => {
    const { result } = setup("contain");
    expect(result.current?.width).toBe(800);
    expect(result.current?.height).toBe(450);
    expect(result.current?.x).toBe(-168);
    expect(result.current?.y).toBe(7);
  });

  it("uses explicit object positioning rather than always centering", () => {
    const { result } = setup("cover", "0% 0%");
    expect(result.current?.x).toBe(-168);
    expect(result.current?.y).toBe(-68);
  });
});
