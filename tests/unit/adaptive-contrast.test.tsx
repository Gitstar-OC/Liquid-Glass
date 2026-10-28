/* Native images are intentional: these tests exercise DOM load events. */
/* eslint-disable @next/next/no-img-element */
import {useRef} from "react";
import {act,fireEvent,render} from "@testing-library/react";
import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {useAdaptiveContrast} from "@/components/adaptive-contrast";
import {sampleBackdrop,sampleFromLuminance} from "@/lib/contrast";

vi.mock("@/lib/contrast",async original=>({...await original<typeof import("@/lib/contrast")>(),sampleBackdrop:vi.fn()}));
let frames:Map<number,FrameRequestCallback>,sequence:number;
beforeEach(()=>{
  frames=new Map();sequence=0;vi.mocked(sampleBackdrop).mockReturnValue(sampleFromLuminance(.6,9));
  vi.stubGlobal("requestAnimationFrame",(callback:FrameRequestCallback)=>{frames.set(++sequence,callback);return sequence;});
  vi.stubGlobal("cancelAnimationFrame",(id:number)=>frames.delete(id));
  vi.stubGlobal("ResizeObserver",class{observe(){}disconnect(){}});
  vi.stubGlobal("IntersectionObserver",class{observe(){}disconnect(){}});
});
afterEach(()=>{vi.clearAllMocks();vi.unstubAllGlobals();});
function Example(){
  const source=useRef<HTMLDivElement>(null),target=useRef<HTMLDivElement>(null);
  useAdaptiveContrast(target,{source,live:false});
  return <><div ref={source}><img alt="Source" src="/source.jpg"/></div><div ref={target} data-testid="target"/><div data-glass-mirror-host=""><img alt="Mirror" src="/source.jpg"/></div></>;
}
const flush=async()=>{await act(async()=>{await Promise.resolve();const pending=[...frames.values()];frames.clear();pending.forEach(callback=>callback(0));});};
describe("event-driven ink sampling",()=>{
  it("ignores image loads from optical mirrors and still samples real source loads",async()=>{
    const {getByAltText}=render(<Example/>);expect(sampleBackdrop).toHaveBeenCalledOnce();
    fireEvent.load(getByAltText("Mirror"));await flush();expect(sampleBackdrop).toHaveBeenCalledOnce();
    fireEvent.load(getByAltText("Source"));await flush();expect(sampleBackdrop).toHaveBeenCalledTimes(2);
  });
  it("resamples a moved lens without starting a polling loop",async()=>{
    const {getByTestId,unmount}=render(<Example/>);
    getByTestId("target").style.left="80px";await flush();expect(sampleBackdrop).toHaveBeenCalledTimes(2);expect(frames.size).toBe(0);
    unmount();expect(frames.size).toBe(0);
  });
});
