import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  attachSceneMirror,
  invalidateGlassScene,
  type SceneMirror,
} from "@/lib/glass-scene";

let mirrors: SceneMirror[];
let frames: Map<number, FrameRequestCallback>;
let sequence: number;
const rect = (x: number, y: number, width: number, height: number) =>
  new DOMRect(x, y, width, height);
function bounds(
  element: HTMLElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  element.getBoundingClientRect = () => rect(x, y, width, height);
  Object.defineProperties(element, {
    offsetWidth: { configurable: true, value: width },
    offsetHeight: { configurable: true, value: height },
  });
}
function fixture(html: string) {
  const root = document.createElement("div");
  root.innerHTML = html;
  const surface = document.createElement("div");
  surface.dataset.liquidGlass = "";
  const host = document.createElement("div");
  surface.append(host);
  root.append(surface);
  document.body.append(root);
  bounds(root, 10, 20, 600, 400);
  bounds(surface, 110, 100, 200, 180);
  const paint = vi.fn();
  const mirror = attachSceneMirror(root, host, surface, 32, { onPaint: paint });
  mirrors.push(mirror);
  return { root, surface, host, mirror, paint };
}
function frame(time = 1000) {
  const callbacks = [...frames.values()];
  frames.clear();
  callbacks.forEach((callback) => callback(time));
}
beforeEach(() => {
  mirrors = [];
  frames = new Map();
  sequence = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++sequence, callback);
    return sequence;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: false,
  });
  const computed = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) =>
    pseudo ? ({ content: "none" } as CSSStyleDeclaration) : computed(element),
  );
});
afterEach(() => {
  mirrors.forEach((mirror) => mirror.destroy());
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("full DOM scene source", () => {
  it("mirrors text, images, and layout while excluding lenses and ignored content", () => {
    const { host } = fixture(
      '<h2>Actual DOM text</h2><img src="/scene.jpg"><div style="display:grid;padding:12px">Card</div><script>unsafe()</script><aside data-glass-ignore>Ignored</aside>',
    );
    const copy = host.querySelector<HTMLElement>("[data-glass-mirror]")!;
    expect(copy.textContent).toContain("Actual DOM text");
    expect(copy.textContent).toContain("Card");
    expect(copy.querySelector("img")?.src).toBe(
      new URL("/scene.jpg", document.baseURI).href,
    );
    expect(copy.querySelector("div")?.style.display).toBe("grid");
    expect(
      copy.querySelector("script,[data-liquid-glass],[data-glass-ignore]"),
    ).toBeNull();
    expect(copy.hasAttribute("inert")).toBe(true);
    expect(copy.getAttribute("aria-hidden")).toBe("true");
    expect(copy.style.width).toBe("600px");
    expect(host.style.left).toBe("-68px");
    expect(host.style.top).toBe("-48px");
  });
  it("synchronizes form properties and nested scroll positions", () => {
    const { root, host } = fixture(
      '<input aria-label="source"><input type="checkbox"><textarea></textarea><select><option>A</option><option>B</option></select><section style="overflow:auto;height:20px">Scroll</section>',
    );
    const inputs = root.querySelectorAll("input");
    inputs[0].value = "Current value";
    inputs[1].checked = true;
    root.querySelector("textarea")!.value = "Edited textarea";
    root.querySelector("select")!.selectedIndex = 1;
    root.querySelector("section")!.scrollTop = 90;
    root.dispatchEvent(new Event("input", { bubbles: true }));
    frame();
    expect(host.querySelector("input")!.value).toBe("Current value");
    expect(host.querySelectorAll("input")[1].checked).toBe(true);
    expect(host.querySelector("textarea")!.value).toBe("Edited textarea");
    expect(host.querySelector("select")!.selectedIndex).toBe(1);
    expect(host.querySelector("section")!.scrollTop).toBe(90);
  });
  it("captures structural changes and changed computed styles", async () => {
    const { root, host } = fixture("<h2>Before</h2><article>Card</article>");
    root.querySelector("h2")!.textContent = "After";
    root.querySelector("article")!.style.backgroundColor = "rgb(12, 34, 56)";
    await Promise.resolve();
    frame();
    expect(host.querySelector("h2")!.textContent).toBe("After");
    expect(host.querySelector("article")!.style.backgroundColor).toBe(
      "rgb(12, 34, 56)",
    );
    root.querySelector("article")!.style.color = "rgb(60, 70, 80)";
    await Promise.resolve();
    frame(2000);
    expect(host.querySelector("article")!.style.color).toBe("rgb(60, 70, 80)");
  });
  it("scopes SVG references and labels to each inert mirror", () => {
    const { root, host } = fixture(
      '<label for="field">Name</label><input id="field" name="actual"><svg><defs><linearGradient id="paint"></linearGradient></defs><rect fill="url(#paint)"/></svg>',
    );
    const input = host.querySelector("input")!;
    expect(input.id).not.toBe("field");
    expect(input.hasAttribute("name")).toBe(false);
    expect(host.querySelector("label")!.htmlFor).toBe(input.id);
    expect(host.querySelector("rect")!.getAttribute("fill")).toBe(
      `url(#${host.querySelector("linearGradient")!.id})`,
    );
    expect(root.querySelector("#field")).not.toBeNull();
  });
  it("repositions the full source without rebuilding its static snapshot", () => {
    const { surface, host, mirror, paint } = fixture("<h2>Static</h2>");
    const copy = host.firstElementChild;
    frame();
    paint.mockClear();
    bounds(surface, 210, 120, 200, 180);
    mirror.updateGeometry();
    expect(host.firstElementChild).toBe(copy);
    expect(host.style.left).toBe("-168px");
    expect(host.style.top).toBe("-68px");
    expect(paint).toHaveBeenCalledOnce();
    frame(2000);
    expect(paint).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
  });
  it("shares a scene between lenses and releases each mirror independently", () => {
    const { root, host, mirror } = fixture("<h2>Shared source</h2>");
    const secondHost = document.createElement("div");
    const secondSurface = document.createElement("div");
    secondSurface.dataset.liquidGlass = "";
    secondSurface.append(secondHost);
    root.append(secondSurface);
    bounds(secondSurface, 250, 100, 200, 180);
    const second = attachSceneMirror(root, secondHost, secondSurface, 32, {
      onPaint: vi.fn(),
    });
    mirrors.push(second);
    expect(secondHost.querySelector("h2")!.textContent).toBe("Shared source");
    mirror.destroy();
    expect(host.childElementCount).toBe(0);
    root.querySelector("h2")!.style.color = "red";
    invalidateGlassScene(root, {
      target: root.querySelector("h2")!,
      immediate: true,
    });
    expect(secondHost.querySelector("h2")!.style.color).toBe("rgb(255, 0, 0)");
  });
  it("paints live canvas frames and stops scheduling when the lens is hidden", () => {
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      clearRect: vi.fn(),
      drawImage,
    } as unknown as CanvasRenderingContext2D);
    const { root, host, mirror } = fixture(
      '<canvas width="320" height="180"></canvas>',
    );
    const source = root.querySelector("canvas")!;
    expect(host.querySelector("canvas")!.width).toBe(320);
    drawImage.mockClear();
    frame();
    expect(drawImage).toHaveBeenCalledWith(source, 0, 0, 320, 180);
    expect(frames.size).toBe(1);
    mirror.setVisible(false);
    expect(frames.size).toBe(0);
  });
  it("observes changes inside captured open shadow roots", async () => {
    const { root, host } = fixture("<scene-card></scene-card>");
    const shadow = root
      .querySelector("scene-card")!
      .attachShadow({ mode: "open" });
    shadow.innerHTML = "<h2>Shadow content</h2>";
    invalidateGlassScene(root);
    frame();
    expect(host.querySelector("h2")!.textContent).toBe("Shadow content");
    shadow.querySelector("h2")!.textContent = "Updated shadow content";
    await Promise.resolve();
    frame(2000);
    expect(host.querySelector("h2")!.textContent).toBe(
      "Updated shadow content",
    );
  });
  it("ignores loads from its own mirror when the source contains the lens", async () => {
    const { host, paint } = fixture('<img src="/scene.jpg">');
    frame();
    paint.mockClear();
    const copy = host.firstElementChild;
    host.querySelector("img")!.dispatchEvent(new Event("load"));
    await Promise.resolve();
    frame(2000);
    expect(host.firstElementChild).toBe(copy);
    expect(paint).not.toHaveBeenCalled();
  });
});

describe("glass layer composition", () => {
  it("ignores internal mirror mutations in a mixed batch with an upper wrapper", async () => {
    const scene=document.createElement("section");scene.dataset.glassScene="";
    const source=document.createElement("div");source.textContent="Backdrop";
    const lower=document.createElement("div");lower.dataset.liquidGlass="";
    const internal=document.createElement("div");internal.dataset.glassMirrorHost="";
    const copied=document.createElement("span");internal.append(copied);lower.append(internal);
    const wrapper=document.createElement("div"),upper=document.createElement("div"),host=document.createElement("div");
    upper.dataset.liquidGlass="";host.dataset.glassMirrorHost="";
    upper.append(host);wrapper.append(upper);scene.append(source,lower,wrapper);document.body.append(scene);
    for(const node of [source,lower,upper])bounds(node,0,0,300,200);
    const paint=vi.fn();mirrors.push(attachSceneMirror(source,host,upper,32,{onPaint:paint}));
    await Promise.resolve();frame();await Promise.resolve();frame(2000);paint.mockClear();
    copied.className="updated-mirror";wrapper.dataset.probe="changed";
    await Promise.resolve();frame(3000);
    expect(paint).not.toHaveBeenCalled();
  });
  it("captures lower glass and its content without capturing the foreground or itself", async () => {
    const scene = document.createElement("section");
    scene.dataset.glassScene = "";
    const source = document.createElement("div");
    source.innerHTML = "<p>Backdrop</p>";
    scene.append(source);
    const lower = document.createElement("div");
    lower.dataset.liquidGlass = "";
    lower.innerHTML =
      '<svg><defs><filter id="lower-optics"><feGaussianBlur stdDeviation="1" /></filter></defs></svg><div style="filter:url(#lower-optics)">Lower image</div><input value="Editable below">';
    const adjacent = document.createElement("div");
    adjacent.dataset.liquidGlass = "";
    adjacent.textContent = "Adjacent control must not become another layer";
    const upper = document.createElement("div");
    upper.dataset.liquidGlass = "";
    upper.innerHTML = "<b>Upper content</b>";
    const host = document.createElement("div");
    host.dataset.glassMirrorHost = "";
    upper.append(host);
    const front = document.createElement("div");
    front.dataset.liquidGlass = "";
    front.textContent = "Foreground must not appear";
    scene.append(lower, adjacent, upper, front);
    document.body.append(scene);
    for (const node of [source, lower, upper, front])
      bounds(node, 0, 0, 300, 200);
    bounds(adjacent, 310, 0, 100, 100);
    const paint = vi.fn();
    mirrors.push(
      attachSceneMirror(source, host, upper, 32, { onPaint: paint }),
    );
    expect(host.querySelectorAll("[data-glass-captured-layer]")).toHaveLength(
      1,
    );
    expect(host.textContent).toContain("Lower image");
    expect(host.textContent).not.toContain("Upper content");
    expect(host.textContent).not.toContain("Adjacent control");
    expect(host.textContent).not.toContain("Foreground must not appear");
    const filter = host.querySelector("filter")!;
    expect(filter.id).not.toBe("lower-optics");
    expect(
      host.querySelector('[style*="filter:"]')?.getAttribute("style"),
    ).toContain(filter.id);
    lower.querySelector("input")!.value = "Changed below";
    lower
      .querySelector("input")!
      .dispatchEvent(new Event("input", { bubbles: true }));
    frame(2000);
    expect(host.querySelector("input")!.value).toBe("Changed below");
    await Promise.resolve();
    frame(3000);
    const calls = paint.mock.calls.length;
    await Promise.resolve();
    frame(4000);
    expect(paint).toHaveBeenCalledTimes(calls);
  });
});
