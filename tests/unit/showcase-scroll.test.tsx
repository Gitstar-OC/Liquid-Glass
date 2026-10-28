import { useRef } from "react";
import { render } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useShowcaseScroll } from "@/hooks/use-showcase-scroll";
let reduced = false;
let frames: Map<number, FrameRequestCallback>;
let next: number;
function Scene({enabled=true}:{enabled?:boolean}) {
  const section = useRef<HTMLElement>(null);
  const first = useRef<HTMLDivElement>(null);
  const second = useRef<HTMLDivElement>(null);
  useShowcaseScroll(section,first,second,enabled);
  return <section ref={section} data-testid="story"><div ref={first} data-testid="lake"/><div ref={second} data-testid="dunes"/></section>;
}
function flush() { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback=>callback(0)); }
beforeEach(()=>{
  reduced=false;frames=new Map();next=0;
  vi.stubGlobal("matchMedia",()=>({matches:reduced,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
  vi.stubGlobal("IntersectionObserver",class { observe(){} disconnect(){} });
  vi.stubGlobal("requestAnimationFrame",(callback:FrameRequestCallback)=>{frames.set(++next,callback);return next;});
  vi.stubGlobal("cancelAnimationFrame",(id:number)=>frames.delete(id));
  vi.spyOn(HTMLElement.prototype,"getBoundingClientRect").mockReturnValue({top:-1200,height:1800} as DOMRect);
});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
describe("scroll source",()=>{
  it("updates the captured photo planes only on events and resets for a fixed background",()=>{
    const {getByTestId,rerender} = render(<Scene/>);
    flush();
    expect(getByTestId("story")).toHaveAttribute("data-scroll-stage","ice");
    expect(getByTestId("lake").style.opacity).toBe("1");
    expect(getByTestId("lake").style.transform).not.toContain("rotate");
    expect(frames.size).toBe(0);
    rerender(<Scene enabled={false}/>);
    flush();
    expect(getByTestId("lake").style.opacity).toBe("0");
    expect(getByTestId("dunes").style.opacity).toBe("0");
    expect(frames.size).toBe(0);
  });
  it("keeps the backdrop still for reduced motion and cancels pending work on unmount",()=>{
    reduced=true;
    const {getByTestId,unmount} = render(<Scene/>);
    flush();
    expect(getByTestId("story")).toHaveAttribute("data-scroll-stage","still");
    expect(getByTestId("lake").style.opacity).toBe("0");
    window.dispatchEvent(new Event("scroll"));
    expect(frames.size).toBe(1);
    unmount();
    expect(frames.size).toBe(0);
  });
});
