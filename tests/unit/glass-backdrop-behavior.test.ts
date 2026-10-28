import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { classifyGlassBackdrop } from "@/lib/glass-scene";
let source:HTMLDivElement,surface:HTMLDivElement,scene:HTMLDivElement;
beforeEach(()=>{
  scene=document.createElement("div");scene.dataset.glassScene="";
  source=document.createElement("div");surface=document.createElement("div");surface.dataset.liquidGlass="";
  scene.append(source,surface);document.body.append(scene);
  vi.spyOn(HTMLElement.prototype,"getBoundingClientRect").mockReturnValue(new DOMRect(0,0,100,100));
});
afterEach(()=>{scene.remove();vi.restoreAllMocks();});
it("distinguishes a plain source, visible image and actual text without a polling loop",()=>{
  expect(classifyGlassBackdrop(source,surface)).toBe("plain");
  source.innerHTML='<img src="/photo.webp" alt=""/>';
  expect(classifyGlassBackdrop(source,surface)).toBe("image");
  source.innerHTML='<div><img src="/photo.webp" alt=""/></div>';source.firstElementChild!.setAttribute("style","opacity:0");
  expect(classifyGlassBackdrop(source,surface)).toBe("plain");
  source.innerHTML='<div>Real DOM text</div>';
  expect(classifyGlassBackdrop(source,surface)).toBe("content");
});
it("softens lower UI only when it intersects, and ignores the full atlas carrier",()=>{
  source.innerHTML='<img src="/photo.webp" alt=""/>';
  const atlas=document.createElement("div");atlas.dataset.liquidGlass="";atlas.dataset.glassAtlas="";scene.insertBefore(atlas,surface);
  expect(classifyGlassBackdrop(source,surface)).toBe("image");
  const lower=document.createElement("div");lower.dataset.liquidGlass="";lower.textContent="Lower control";scene.insertBefore(lower,surface);
  expect(classifyGlassBackdrop(source,surface)).toBe("content");
  lower.getBoundingClientRect=()=>new DOMRect(200,200,50,50);
  expect(classifyGlassBackdrop(source,surface)).toBe("image");
});
