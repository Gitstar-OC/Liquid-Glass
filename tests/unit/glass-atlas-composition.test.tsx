import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlassAtlas } from "@/components/glass-atlas";
import { GlassScene, GlassSettingsProvider } from "@/components/glass-scene";
import { GlassThemeProvider } from "@/components/glass/glass-theme-provider";
import { GlassSurface } from "@/components/glass/glass-surface";
import { GlassButton } from "@/components/glass/glass-button";
const mocks=vi.hoisted(()=>({destroy:vi.fn(),register:vi.fn(),dispose:vi.fn(),paint:vi.fn(),admit:true}));
vi.mock("@/lib/glass-scene",()=>({attachSceneMirror:()=>({updateGeometry:vi.fn(),destroy:mocks.destroy})}));
vi.mock("@/lib/glass-performance",()=>({registerGlassLens:(node:HTMLElement,callback:(value:boolean)=>void)=>{mocks.register(node);callback(mocks.admit);return mocks.dispose;}}));
vi.mock("@/lib/glass-atlas",()=>({buildAtlasTextures:()=>({displacement:"data:image/png;base64,AA",reflection:"",shade:"",mask:"data:image/png;base64,AA"}),getAtlasTextureCacheStats:()=>({builds:1,hits:0})}));
vi.mock("@/lib/glass",async original=>({...await original<typeof import("@/lib/glass")>(),decodeLensTextures:()=>Promise.resolve(),buildLensTextures:()=>({displacement:"data:image/png;base64,AA",reflection:"data:image/png;base64,AA",shade:"data:image/png;base64,AA"})}));
let frames: Map<number,FrameRequestCallback>, next: number;
beforeEach(()=>{
  vi.clearAllMocks();mocks.admit=true;frames=new Map();next=0;
  vi.stubGlobal("matchMedia",()=>({matches:false,addEventListener(){},removeEventListener(){}}));
  vi.stubGlobal("ResizeObserver",class{observe(){}unobserve(){}disconnect(){}});
  vi.stubGlobal("requestAnimationFrame",(callback:FrameRequestCallback)=>{frames.set(++next,callback);return next;});
  vi.stubGlobal("cancelAnimationFrame",(id:number)=>frames.delete(id));
  vi.spyOn(HTMLCanvasElement.prototype,"getContext").mockReturnValue(null);
  vi.spyOn(HTMLElement.prototype,"getBoundingClientRect").mockReturnValue(new DOMRect(0,0,320,200));
});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
const flush=async()=>act(async()=>{const work=[...frames.values()];frames.clear();work.forEach(callback=>callback(0));await Promise.resolve();await Promise.resolve();});
function Example({overlay=false,theme="light",behavior="unitheme",refraction=true,independent=false}:{overlay?:boolean;theme?:"light"|"dark";behavior?:"unitheme"|"duotheme";refraction?:boolean;independent?:boolean}) {
  return <GlassThemeProvider><GlassSettingsProvider ink="dark" themeBehavior={behavior} refraction={refraction}><GlassScene appearance={theme} content={<div>Live DOM</div>}><GlassAtlas><GlassSurface data-testid="panel" config={independent?{blur:8}:undefined}><GlassButton>Inside</GlassButton></GlassSurface><GlassButton>Separate</GlassButton>{overlay&&<GlassSurface data-testid="overlay" kind="dialog">Overlay</GlassSurface>}</GlassAtlas></GlassScene></GlassSettingsProvider></GlassThemeProvider>;
}
describe("shared scene compositor",()=>{
  it("keeps a denied atlas cheap instead of creating one CSS blur pass per member",async()=>{
    mocks.admit=false;const {getByTestId}=render(<Example/>);await flush();await flush();
    expect(getByTestId("panel")).toHaveAttribute("data-glass-rendering","lightweight");
    expect(getByTestId("panel").querySelector("[data-glass-blur]")).toBeNull();expect(mocks.register).toHaveBeenCalledTimes(1);
  });
  it("removes the independent reflection, filter housing, and blur wrapper when returning to the atlas",async()=>{
    vi.spyOn(HTMLElement.prototype,"clientWidth","get").mockReturnValue(200);vi.spyOn(HTMLElement.prototype,"clientHeight","get").mockReturnValue(120);
    const {getByTestId,rerender}=render(<Example independent/>);await flush();await flush();await flush();
    expect(getByTestId("panel").querySelector("[data-glass-reflection]")).not.toBeNull();
    rerender(<Example/>);await flush();await flush();
    const panel=getByTestId("panel");expect(panel).toHaveAttribute("data-refraction","scene-atlas");
    expect(panel.querySelector("[data-glass-reflection]")).toBeNull();expect(panel.querySelector("[data-glass-blur]")).toBeNull();expect(panel.querySelector("svg > filter")).toBeNull();
  });
  it("switches only bending off and on while retaining the same mirror and field",async()=>{
    const {container,rerender,getByTestId}=render(<Example/>);await flush();await flush();
    rerender(<Example refraction={false}/>);await flush();
    expect(getByTestId("panel")).toHaveAttribute("data-refraction","disabled");
    expect(container.querySelector('[data-glass-atlas] > svg > filter:last-child feDisplacementMap')).toHaveAttribute("scale","0");expect(mocks.destroy).not.toHaveBeenCalled();
    rerender(<Example/>);await flush();expect(getByTestId("panel")).toHaveAttribute("data-refraction","scene-atlas");expect(mocks.register).toHaveBeenCalledTimes(1);
  });
  it("uses one registered pass for separate shapes and releases it on unmount",async()=>{
    const {getByRole,getByTestId,container,unmount}=render(<Example/>);
    await flush();await flush();
    expect(mocks.register).toHaveBeenCalledTimes(1);
    expect(getByTestId("panel")).toHaveAttribute("data-refraction","scene-atlas");
    expect(getByRole("button",{name:"Separate"})).toHaveAttribute("data-glass-rendering","composited");
    expect(getByRole("button",{name:"Inside"})).not.toHaveAttribute("data-liquid-glass");
    expect(container.querySelector('[data-glass-atlas]')).toHaveAttribute("data-atlas-shapes","2");
    window.dispatchEvent(new Event("scroll"));await flush();
    expect(frames.size).toBe(0);
    unmount();expect(mocks.dispose).toHaveBeenCalledTimes(1);expect(mocks.destroy).toHaveBeenCalledTimes(1);expect(frames.size).toBe(0);
  });
  it("leaves overlays independent and preserves Duotheme ink across appearance changes",async()=>{
    const {getByTestId,rerender}=render(<Example overlay behavior="duotheme"/>);
    await flush();await flush();
    expect(mocks.register).toHaveBeenCalledTimes(2);
    expect(getByTestId("overlay")).not.toHaveAttribute("data-glass-compositor");
    expect(getByTestId("panel").style.getPropertyValue("--foreground")).toBe("#000000");
    rerender(<Example overlay theme="dark" behavior="duotheme"/>);
    await flush();
    expect(getByTestId("panel")).toHaveAttribute("data-glass-appearance","dark");
    expect(getByTestId("panel").style.getPropertyValue("--foreground")).toBe("#000000");
    expect(mocks.destroy).not.toHaveBeenCalled();
  });
});
