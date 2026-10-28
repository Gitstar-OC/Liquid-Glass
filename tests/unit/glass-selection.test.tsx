import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { GlassToggleGroup, GlassToggleGroupItem } from "@/components/glass/glass-toggle";

beforeEach(()=>{
  vi.useFakeTimers();
  vi.stubGlobal("ResizeObserver", class {observe(){}disconnect(){}});
  vi.spyOn(HTMLElement.prototype,"getBoundingClientRect").mockImplementation(function(this:HTMLElement){return new DOMRect(this.textContent === "Recent" ? 80 : 0,0,this.getAttribute("data-slot")==="toggle-group" ? 160 : 80,36);});
});
afterEach(()=>{vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();});
const choices=<><GlassToggleGroupItem value="library">Library</GlassToggleGroupItem><GlassToggleGroupItem value="recent">Recent</GlassToggleGroupItem></>;
it("moves one shared highlight, settles after travel, and makes keyboard changes instant",async()=>{
  const {container,getByRole,rerender,unmount}=render(<GlassToggleGroup liquid type="single" value="library" aria-label="View">{choices}</GlassToggleGroup>);
  const root=container.querySelector('[data-liquid-selection]') as HTMLElement;
  expect(root.style.getPropertyValue("--selection-x")).toBe("0px");
  fireEvent.pointerDown(getByRole("radio",{name:"Recent"}));
  rerender(<GlassToggleGroup liquid type="single" value="recent" aria-label="View">{choices}</GlassToggleGroup>);
  await act(async()=>{await Promise.resolve();});
  expect(root.style.getPropertyValue("--selection-x")).toBe("80px");expect(root).toHaveAttribute("data-liquid-moving","true");
  act(()=>vi.advanceTimersByTime(300));expect(root).toHaveAttribute("data-liquid-moving","false");
  fireEvent.keyDown(root,{key:"ArrowLeft"});
  rerender(<GlassToggleGroup liquid type="single" value="library" aria-label="View">{choices}</GlassToggleGroup>);
  await act(async()=>{await Promise.resolve();});
  expect(root).toHaveAttribute("data-input-modality","keyboard");expect(root.style.getPropertyValue("--selection-x")).toBe("0px");
  expect(container.querySelectorAll('.glass-selection-indicator')).toHaveLength(1);
  unmount();expect(vi.getTimerCount()).toBe(0);
});
