import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GLASS_PRESETS,
  buildLensMap,
  buildLensTextures,
  clearLensMapCache,
  hexToRgb,
  rgba,
  DEFAULT_OPTICS,
  refractLensRay,
  roundedLensSurface,
  resolveOptics,
  resolveLensParams,
  elasticLensOffset,
  lensSurface,
  lensClipPath,
  lensContourPoints,
  lensOutlinePath,
  interiorLensOffset,
  resolveBackdropTreatment,
} from "@/lib/glass";

describe("soft content and interior optics",()=>{
  it("uses a shallow, symmetric bowl with an anchored perimeter",()=>{
    const a=interiorLensOffset(30,10,100,50,.18),b=interiorLensOffset(-30,-10,100,50,.18);
    expect(a.x).toBeCloseTo(-b.x);expect(a.y).toBeCloseTo(-b.y);
    expect(Math.abs(a.x)).toBeGreaterThan(0);expect(Math.abs(a.x)).toBeLessThan(.1);
    expect(interiorLensOffset(0,0,100,50,.18)).toEqual({x:-0,y:-0});
    expect(interiorLensOffset(100,10,100,50,.18)).toEqual({x:-0,y:-0});
    expect(interiorLensOffset(70,30,100,50,.18,0,10)).toEqual({x:-0,y:-0});
    expect(interiorLensOffset(30,10,100,50,0)).toEqual({x:0,y:0});
  });
  it("blurs background UI without displacing its letters, with a manual override",()=>{
    const params={blur:4,depth:28};
    expect(resolveBackdropTreatment("content",params,true)).toEqual({blur:8,depth:0});
    expect(resolveBackdropTreatment("image",params,true)).toEqual(params);
    expect(resolveBackdropTreatment("image",{blur:12,depth:28},true)).toEqual({blur:12,depth:28});
    expect(resolveBackdropTreatment("plain",params,true)).toEqual({blur:0,depth:28});
    expect(resolveBackdropTreatment("content",params,false)).toEqual(params);
    expect(resolveBackdropTreatment("content",params,true,true)).toEqual({blur:4,depth:0});
    expect(resolveBackdropTreatment("image",{blur:22,depth:28},true,true)).toEqual({blur:22,depth:28});
    expect(resolveBackdropTreatment("content",{blur:12,depth:28},true).blur).toBe(12);
  });
});

describe("squircle contours",()=>{
  it("uses the same boundary for the optical surface, clip, and diagnostic outline",()=>{
    for(const shape of ["round","squircle"] as const){
      const points=lensContourPoints(180,100,38,shape);
      for(const point of points)expect(lensSurface(point.x-90,point.y-50,90,50,38,shape).distance).toBeCloseTo(0,5);
      const outline=lensOutlinePath(180,100,38,shape);
      expect(outline).toContain(`${points[12].x.toFixed(2)},${points[12].y.toFixed(2)}`);
      if(shape==="squircle")expect(lensClipPath(180,100,38,shape)).toContain(`${points[12].x.toFixed(2)}px ${points[12].y.toFixed(2)}px`);
    }
  });
  it("shares a continuous squircle boundary and keeps round lenses unchanged",()=>{
    expect(lensSurface(46,46,50,50,20,"round").distance).toBeGreaterThan(0);
    const squircle=lensSurface(46,46,50,50,20,"squircle");
    expect(squircle.distance).toBeLessThan(0);expect(Math.hypot(squircle.nx,squircle.ny)).toBeCloseTo(1);
    expect(lensSurface(0,50,50,50,20,"squircle").distance).toBeCloseTo(0);
    expect(lensClipPath(100,100,20,"squircle")).toMatch(/^polygon\(/);
    expect(lensClipPath(100,100,20,"round")).toBe("inset(0 round 20px)");
  });
});

describe("elastic optical pull", () => {
  it("keeps the rim fixed, bounds invalid input, and restores a neutral center", () => {
    expect(elasticLensOffset(0,0,100,50)).toEqual({x:0,y:0});
    expect(elasticLensOffset(100,0,100,50,{x:48,y:48})).toEqual({x:0,y:0});
    expect(elasticLensOffset(0,50,100,50,{x:48,y:48})).toEqual({x:0,y:0});
    expect(elasticLensOffset(0,0,100,50,{x:200,y:-200})).toEqual({x:.75,y:-.75});
    expect(elasticLensOffset(0,0,100,50,{x:NaN,y:Infinity})).toEqual({x:0,y:0});
    const inner=elasticLensOffset(20,10,100,50,{x:24,y:24});
    expect(inner.x).toBeGreaterThan(0);expect(inner.x).toBeLessThan(.375);
  });
});

describe("color utils", () => {
  it("parses 6-digit hex", () => {
    expect(hexToRgb("#10b981")).toEqual([16, 185, 129]);
    expect(hexToRgb("#0a0a0c")).toEqual([10, 10, 12]);
  });

  it("parses 3-digit hex", () => {
    expect(hexToRgb("#fff")).toEqual([255, 255, 255]);
    expect(hexToRgb("#000")).toEqual([0, 0, 0]);
  });

  it("falls back to white on garbage", () => {
    expect(hexToRgb("zzz")).toEqual([255, 255, 255]);
    expect(hexToRgb("#12345")).toEqual([255, 255, 255]);
  });

  it("formats rgba strings", () => {
    expect(rgba("#ffffff", 0.06)).toBe("rgba(255, 255, 255, 0.06)");
    expect(rgba("#000", 1)).toBe("rgba(0, 0, 0, 1)");
  });
});

describe("presets", () => {
  const KEYS = [
    "depth",
    "splay",
    "feather",
    "curve",
    "blur",
    "saturate",
    "brightness",
    "contrast",
    "chroma",
    "glint",
    "tint",
    "tintColor",
  ];

  it("defines every preset with a complete parameter set", () => {
    for (const name of ["clear", "regular", "frosted", "thick"]) {
      const p = GLASS_PRESETS[name as keyof typeof GLASS_PRESETS];
      expect(Object.keys(p).sort()).toEqual([...KEYS].sort());
      for (const k of KEYS) {
        if (k === "tintColor") continue;
        expect(Number.isFinite(p[k as "depth"])).toBe(true);
      }
    }
  });

  it("keeps parameters in physically sane ranges", () => {
    for (const p of Object.values(GLASS_PRESETS)) {
      expect(p.depth).toBeGreaterThan(0);
      expect(p.splay).toBeGreaterThanOrEqual(0);
      expect(p.feather).toBeGreaterThan(0);
      expect(p.curve).toBeGreaterThanOrEqual(1);
      expect(p.blur).toBeGreaterThanOrEqual(0);
      expect(p.saturate).toBeGreaterThan(0);
      expect(p.brightness).toBeGreaterThanOrEqual(0.5);
      expect(p.contrast).toBeGreaterThanOrEqual(0.5);
      expect(p.chroma).toBeGreaterThanOrEqual(0);
      expect(p.chroma).toBeLessThan(0.5);
      expect(p.glint).toBeGreaterThanOrEqual(0);
      expect(p.glint).toBeLessThanOrEqual(100);
      expect(p.tint).toBeGreaterThanOrEqual(0);
      expect(p.tint).toBeLessThanOrEqual(1);
    }
  });

  it("orders materials from most to least refractive", () => {
    expect(GLASS_PRESETS.clear.depth).toBeGreaterThan(GLASS_PRESETS.regular.depth);
    expect(GLASS_PRESETS.regular.depth).toBeGreaterThan(GLASS_PRESETS.frosted.depth);
    expect(GLASS_PRESETS.frosted.depth).toBeGreaterThan(GLASS_PRESETS.thick.depth);
    expect(GLASS_PRESETS.clear.blur).toBeLessThan(GLASS_PRESETS.thick.blur);
  });

  it("never displaces further than the sampling pad can cover", () => {
    for (const p of Object.values(GLASS_PRESETS)) {
      const maxOffset = p.depth * (1 + p.chroma) * 0.85 * 0.5;
      expect(maxOffset).toBeLessThanOrEqual(32);
    }
  });
});

describe("buildLensMap", () => {
  let captured: { data: Uint8ClampedArray; width: number; height: number } | null =
    null;
  let capturedImages: { data: Uint8ClampedArray; width: number; height: number }[] = [];
  let realCreate: typeof document.createElement;
  let toDataURLSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    captured = null;
    capturedImages = [];
    clearLensMapCache();
    realCreate = document.createElement.bind(document);
    toDataURLSpy = vi.fn(() => "data:image/png;base64,FAKE");
    const ctx = {
      createImageData: (w: number, h: number) => ({
        data: new Uint8ClampedArray(w * h * 4),
        width: w,
        height: h,
      }),
      putImageData: (img: { data: Uint8ClampedArray; width: number; height: number }) => {
        captured = img;
        capturedImages.push(img);
      },
    };
    const fakeCanvas = {
      width: 0,
      height: 0,
      getContext: () => ctx,
      toDataURL: toDataURLSpy,
    };
    vi.spyOn(document, "createElement").mockImplementation(((tag: string) =>
      tag === "canvas" ? fakeCanvas : realCreate(tag)) as typeof document.createElement);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function pixel(x: number, y: number): [number, number, number, number] {
    if (!captured) throw new Error("map was never written");
    const i = (y * captured.width + x) * 4;
    return [
      captured.data[i],
      captured.data[i + 1],
      captured.data[i + 2],
      captured.data[i + 3],
    ];
  }

  const GEO = { radius: 12, splay: 8, feather: 8, curve: 2, pad: 20 };

  it("preserves fractional geometry instead of reusing an integer-rounded contour",()=>{
    buildLensMap(96.25,96.25,GEO);const calls=toDataURLSpy.mock.calls.length;
    expect(captured!.width).toBe(96);
    buildLensMap(96.75,96.25,GEO);
    expect(captured!.width).toBe(97);expect(toDataURLSpy.mock.calls.length).toBe(calls+4);
  });

  it("writes a full RGBA map and returns a PNG data url", () => {
    const url = buildLensMap(64, 48, GEO);
    expect(url).toMatch(/^data:image\/png;base64,/);
    if (!captured) throw new Error("no image");
    expect(captured.width).toBe(64);
    expect(captured.height).toBe(48);
    expect(captured.data.length).toBe(64 * 48 * 4);
  });

  it("encodes constant alpha and neutral blue channel everywhere", () => {
    buildLensMap(96, 96, GEO);
    for (let y = 0; y < 96; y += 7) {
      for (let x = 0; x < 96; x += 7) {
        const [r, g, b, a] = pixel(x, y);
        void r;
        void g;
        expect(b).toBe(128);
        expect(a).toBe(255);
      }
    }
  });

  it("stays neutral deep inside the lens interior", () => {
    buildLensMap(96, 96, GEO);
    const [r, g] = pixel(48, 48);
    expect(Math.abs(r - 128)).toBeLessThanOrEqual(2);
    expect(Math.abs(g - 128)).toBeLessThanOrEqual(2);
  });

  it("stays neutral in the padded margin outside the visible lens", () => {
    buildLensMap(96, 96, GEO);
    const [rOut, gOut] = pixel(95, 95);
    expect(Math.abs(rOut - 128)).toBeLessThanOrEqual(2);
    expect(Math.abs(gOut - 128)).toBeLessThanOrEqual(2);
    const [rTop] = pixel(48, 5);
    expect(Math.abs(rTop - 128)).toBeLessThanOrEqual(2);
  });

  it("places the rim band just inside the visible left edge", () => {
    buildLensMap(96, 96, GEO);
    const [r, g] = pixel(24, 48);
    expect(r).toBeGreaterThan(128);
    expect(pixel(20, 48)[0]).toBeGreaterThan(r);
    expect(Math.abs(g - 128)).toBeLessThanOrEqual(8);
  });

  it("places the rim band just inside the visible top edge", () => {
    buildLensMap(96, 96, GEO);
    const [r, g] = pixel(48, 24);
    expect(g).toBeGreaterThan(128);
    expect(pixel(48, 20)[1]).toBeGreaterThan(g);
    expect(Math.abs(r - 128)).toBeLessThanOrEqual(8);
  });

  it("inverts the encoding on the opposite edge (red channel dark)", () => {
    buildLensMap(96, 96, GEO);
    const [r] = pixel(72, 48);
    expect(r).toBeLessThan(128);
  });

  it("is symmetric horizontally around the visible bounds", () => {
    buildLensMap(96, 96, GEO);
    const a = pixel(24, 48)[0] - 128;
    const b = pixel(71, 48)[0] - 128;
    expect(Math.abs(a + b)).toBeLessThanOrEqual(1);
    expect(a).toBeGreaterThan(0);
    expect(b).toBeLessThan(0);
  });


  it("moves the reflection with the light without moving the refraction", () => {
    buildLensTextures(96, 96, { ...GEO, optics: { lightAngle: 0 } });
    const firstReflection = capturedImages[1].data;
    const firstDisplacement = capturedImages[3].data;
    const top = (20 * 96 + 48) * 4 + 3;
    const bottom = (75 * 96 + 48) * 4 + 3;
    expect(firstReflection[top]).toBeGreaterThan(firstReflection[bottom]);
    buildLensTextures(96, 96, { ...GEO, optics: { lightAngle: 180 } });
    const nextReflection = capturedImages[5].data;
    expect(nextReflection[bottom]).toBeGreaterThan(nextReflection[top]);
    expect(capturedImages[7].data).toEqual(firstDisplacement);
  });

  it("is exactly neutral at index one, including the bevel", () => {
    buildLensMap(96, 96, { ...GEO, optics: { refractiveIndex: 1 } });
    for (let y = 0; y < 96; y += 3) {
      for (let x = 0; x < 96; x += 3) {
        expect(pixel(x, y)).toEqual([128, 128, 128, 255]);
      }
    }
  });

  it("serves repeat geometry from cache without re-rendering", () => {
    buildLensMap(96, 96, GEO);
    const callsAfterFirst = toDataURLSpy.mock.calls.length;
    buildLensMap(96, 96, { ...GEO });
    expect(toDataURLSpy.mock.calls.length).toBe(callsAfterFirst);
    buildLensMap(96, 96, { ...GEO, optics:{colorBleed:0} });
    expect(toDataURLSpy.mock.calls.length).toBe(callsAfterFirst);
    clearLensMapCache();
    buildLensMap(96, 96, { ...GEO });
    expect(toDataURLSpy.mock.calls.length).toBe(callsAfterFirst * 2);
  });

  /**
   * A nav pill is thinner than `pad`, which used to collapse the distance
   * field and smear refraction across the whole bar instead of just its rim.
   */
  it("keeps a thin pill neutral through its interior", () => {
    buildLensMap(400, 100, { radius: 16, splay: 14, feather: 26, curve: 1.8, pad: 34, optics:{interior:0} });
    const midY = 50;
    for (const x of [140, 180, 220, 260]) {
      const [r, g] = pixel(x, midY);
      expect(Math.abs(r - 128)).toBeLessThanOrEqual(3);
      expect(Math.abs(g - 128)).toBeLessThanOrEqual(3);
    }
  });

  it("still bends the caps of a thin pill", () => {
    buildLensMap(400, 100, { radius: 16, splay: 14, feather: 26, curve: 1.8, pad: 34 });
    const [rLeft] = pixel(38, 50);
    const [rRight] = pixel(360, 50);
    expect(rLeft).toBeGreaterThan(128);
    expect(rRight).toBeLessThan(128);
  });
});

describe("supportsSvgBackdropFilter", () => {
  function setUA(ua: string) {
    Object.defineProperty(window.navigator, "userAgent", {
      value: ua,
      configurable: true,
    });
  }

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports false on non-Chromium engines (jsdom default)", async () => {
    const mod = await import("@/lib/glass");
    expect(mod.supportsSvgBackdropFilter()).toBe(false);
  });

  it("reports true on Chromium 110+ (including headless)", async () => {
    setUA(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    );
    const mod = await import("@/lib/glass");
    expect(mod.supportsSvgBackdropFilter()).toBe(true);
  });

  it("reports true for HeadlessChrome UA", async () => {
    setUA(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/151.0.7922.34 Safari/537.36"
    );
    const mod = await import("@/lib/glass");
    expect(mod.supportsSvgBackdropFilter()).toBe(true);
  });

  it("falls back below the Chromium 110 capability floor", async () => {
    setUA(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    );
    const mod = await import("@/lib/glass");
    expect(mod.supportsSvgBackdropFilter()).toBe(false);
  });

  it("reports false for iOS Chrome (WebKit engine, no SVG backdrop refs)", async () => {
    setUA(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.0.0 Mobile/15E148 Safari/604.1"
    );
    const mod = await import("@/lib/glass");
    expect(mod.supportsSvgBackdropFilter()).toBe(false);
  });

  it("reports false for Firefox even with spoofed tokens", async () => {
    setUA(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0"
    );
    const mod = await import("@/lib/glass");
    expect(mod.supportsSvgBackdropFilter()).toBe(false);
  });

  it("caches the verdict after first call", async () => {
    const mod = await import("@/lib/glass");
    const first = mod.supportsSvgBackdropFilter();
    setUA(
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
    );
    const second = mod.supportsSvgBackdropFilter();
    expect(second).toBe(first);
  });
});


describe("curved lens optics", () => {
  it("matches Snell's law at a 45 degree surface normal", () => {
    const optics = { ...DEFAULT_OPTICS, thickness: 1 };
    const ray = refractLensRay(1 - Math.SQRT1_2, 1, optics);
    const expected = Math.tan(Math.PI / 4 - Math.asin(Math.SQRT1_2 / optics.refractiveIndex));
    expect(ray.offset).toBeCloseTo(expected, 8);
    expect(ray.normalZ).toBeCloseTo(Math.SQRT1_2, 8);
  });

  it("has no refraction in the flat center, outside, or at index 1", () => {
    expect(refractLensRay(40, 20, DEFAULT_OPTICS).offset).toBe(0);
    expect(refractLensRay(-1, 20, DEFAULT_OPTICS).offset).toBe(0);
    expect(refractLensRay(0, 0, DEFAULT_OPTICS).offset).toBe(0);
    expect(refractLensRay(1, 20, { ...DEFAULT_OPTICS, refractiveIndex: 1 }).offset).toBe(0);
  });

  it("increases bending with refractive index and thickness", () => {
    const base = refractLensRay(4, 20, DEFAULT_OPTICS).offset;
    expect(refractLensRay(4, 20, { ...DEFAULT_OPTICS, refractiveIndex: 1.8 }).offset).toBeGreaterThan(base);
    expect(refractLensRay(4, 20, { ...DEFAULT_OPTICS, thickness: 1.2 }).offset).toBeGreaterThan(base);
  });

  it("stays bounded and increases reflection toward grazing incidence", () => {
    const inner = refractLensRay(12, 20, DEFAULT_OPTICS);
    const rim = refractLensRay(.001, 20, DEFAULT_OPTICS);
    expect(rim.fresnel).toBeGreaterThan(inner.fresnel);
    for (let d = 0; d <= 20; d += .25) {
      const ray = refractLensRay(d, 20, DEFAULT_OPTICS);
      expect(Number.isFinite(ray.offset)).toBe(true);
      expect(ray.offset).toBeGreaterThanOrEqual(0);
      expect(ray.offset).toBeLessThanOrEqual(1);
    }
  });

  it("uses an analytic unit normal on rounded corners", () => {
    const a = roundedLensSurface(45, 35, 50, 40, 12);
    expect(Math.hypot(a.nx, a.ny)).toBeCloseTo(1);
    expect(a.nx).toBeCloseTo(a.ny);
  });

  it("sanitizes malformed public optical and material parameters", () => {
    const optical = resolveOptics({ thickness: Infinity, refractiveIndex: -2, roughness: NaN });
    expect(optical.refractiveIndex).toBe(1);
    expect(Number.isFinite(optical.thickness)).toBe(true);
    const p = resolveLensParams("clear", { depth: NaN, blur: -10, tint: 10 });
    expect(p.depth).toBe(GLASS_PRESETS.clear.depth);
    expect(p.blur).toBe(0);
    expect(p.tint).toBe(1);
  });
});
