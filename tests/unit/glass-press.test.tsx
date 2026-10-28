import { act, fireEvent, render as baseRender } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassSlider } from "@/components/glass/glass-slider";
import { GlassSwitch } from "@/components/glass/glass-switch";
import { GlassSurface } from "@/components/glass/glass-surface";
import { GlassThemeProvider } from "@/components/glass/glass-theme-provider";
import { GlassScene } from "@/components/glass-scene";
import { GlassElasticButton } from "@/components/glass/glass-elastic-button";

const render = (ui: Parameters<typeof baseRender>[0]) => baseRender(ui, {wrapper: GlassThemeProvider});

vi.mock("@/lib/glass-scene", () => ({attachSceneMirror: () => ({updateGeometry() {}, destroy() {}})}));
beforeEach(() => {
  vi.useFakeTimers();
  HTMLElement.prototype.hasPointerCapture = () => false;
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
  vi.stubGlobal("PointerEvent", MouseEvent);
  vi.stubGlobal("ResizeObserver", class {observe() {} unobserve() {} disconnect() {}});
  vi.stubGlobal("matchMedia", () => ({matches: false, addEventListener() {}, removeEventListener() {}}));
});
afterEach(() => {vi.useRealTimers();vi.unstubAllGlobals();});

describe("deliberate liquid feedback", () => {
  it("reveals a standalone lens on hold, restores on cancellation, and keeps keyboard feedback immediate", () => {
    const {getByRole} = render(<GlassScene content={<div/>}><GlassButton liquidOnHold>Hold for glass</GlassButton></GlassScene>);
    const button = getByRole("button", {name:"Hold for glass"});
    expect(button).toHaveAttribute("data-glass-rendering", "shared");
    expect(button.className).not.toContain("has-[>svg]:px-3");
    fireEvent.pointerDown(button, {button:0, pointerId:1});
    act(() => vi.advanceTimersByTime(179));
    expect(button).toHaveAttribute("data-liquid-held", "false");
    act(() => vi.advanceTimersByTime(1));
    expect(button).toHaveAttribute("data-liquid-held", "true");
    expect(button).not.toHaveAttribute("data-glass-rendering", "shared");
    fireEvent.pointerCancel(button);
    expect(button).toHaveAttribute("data-liquid-held", "false");
    expect(button).toHaveAttribute("data-glass-rendering", "shared");
    fireEvent.keyDown(button, {key:" "});
    expect(button).toHaveAttribute("data-input-modality", "keyboard");
    expect(button).toHaveAttribute("data-liquid-held", "true");
    fireEvent.keyDown(button, {key:"Escape"});
    expect(button).toHaveAttribute("data-liquid-held", "false");
    fireEvent.keyDown(button, {key:" "});
    fireEvent.keyUp(button, {key:" "});
    expect(button).toHaveAttribute("data-liquid-held", "false");
  });
  it("cancels short presses, blur, lost capture, disabling, and unmount without stale timers", () => {
    const {getByRole,rerender,unmount} = render(<GlassButton liquidOnHold>Hold</GlassButton>);
    const button = getByRole("button");
    fireEvent.pointerDown(button, {button:0});
    fireEvent.pointerUp(button);
    act(() => vi.advanceTimersByTime(200));
    expect(button).toHaveAttribute("data-liquid-held", "false");
    for (const cancel of [fireEvent.blur, fireEvent.lostPointerCapture]) {
      fireEvent.pointerDown(button, {button:0});
      cancel(button);
      act(() => vi.advanceTimersByTime(200));
      expect(button).toHaveAttribute("data-liquid-held", "false");
    }
    fireEvent.keyDown(button, {key:"Enter"});
    rerender(<GlassButton liquidOnHold disabled>Hold</GlassButton>);
    rerender(<GlassButton liquidOnHold>Hold</GlassButton>);
    expect(button).toHaveAttribute("data-liquid-held", "false");
    fireEvent.pointerDown(button, {button:0});
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("keeps nested hold controls on the shared layer and ghost icons bare", () => {
    const {getByRole} = render(<GlassScene content={<div/>}><GlassSurface ink="dark"><GlassButton liquidOnHold>Nested</GlassButton><GlassButton variant="ghost">Play</GlassButton></GlassSurface></GlassScene>);
    fireEvent.keyDown(getByRole("button", {name:"Nested"}), {key:" "});
    expect(getByRole("button", {name:"Nested"})).not.toHaveAttribute("data-liquid-glass");
    expect(getByRole("button", {name:"Play"})).toHaveAttribute("data-glass-button", "bare");
    expect(getByRole("button", {name:"Play"})).not.toHaveClass("glass-chip");
  });
  it("clears slider and switch press finishes on pointer cancellation", () => {
    const {getByRole,container} = render(<><GlassSlider aria-label="Volume" defaultValue={[50]}/><GlassSwitch aria-label="Sharing"/></>);
    const slider = container.querySelector('[data-slot="slider"]')!;
    fireEvent.pointerDown(slider, {button:0});
    expect(slider).toHaveAttribute("data-liquid-pressed", "true");
    fireEvent.pointerCancel(slider);
    expect(slider).toHaveAttribute("data-liquid-pressed", "false");
    fireEvent.keyDown(getByRole("slider"), {key:"Home"});
    fireEvent.keyDown(getByRole("slider"), {key:"ArrowRight"});
    expect(getByRole("slider")).toHaveAttribute("aria-valuenow", "1");
    const toggle = getByRole("switch");
    fireEvent.pointerDown(toggle, {button:0});
    expect(toggle).toHaveAttribute("data-liquid-pressed", "true");
    fireEvent.pointerCancel(toggle);
    expect(toggle).toHaveAttribute("data-liquid-pressed", "false");
  });
  it("keeps the switch liquid through travel, then settles, with instant keyboard and safe disabling", () => {
    const {getByRole,rerender,unmount} = render(<GlassSwitch aria-label="Sharing"/>);
    const toggle = getByRole("switch");
    fireEvent.pointerDown(toggle, {button:0});fireEvent.pointerUp(toggle);fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked","true");
    expect(toggle).toHaveAttribute("data-liquid-pressed","true");
    act(()=>vi.advanceTimersByTime(299));expect(toggle).toHaveAttribute("data-liquid-pressed","true");
    act(()=>vi.advanceTimersByTime(1));expect(toggle).toHaveAttribute("data-liquid-pressed","false");
    fireEvent.keyDown(toggle,{key:" "});expect(toggle).toHaveAttribute("data-input-modality","keyboard");
    fireEvent.pointerDown(toggle,{button:0});rerender(<GlassSwitch aria-label="Sharing" disabled/>);rerender(<GlassSwitch aria-label="Sharing"/>);
    expect(toggle).toHaveAttribute("data-liquid-pressed","false");
    unmount();expect(vi.getTimerCount()).toBe(0);
  });
  it("bounds the elastic demo to a deliberate gesture and clears cancellation and unmount work", () => {
    const {getByRole,unmount}=render(<GlassScene content={<div/>}><GlassElasticButton/></GlassScene>);
    const button=getByRole("button",{name:"Pull glass"});
    fireEvent.pointerDown(button,{button:0,pointerId:1,clientX:100,clientY:100});
    act(()=>vi.advanceTimersByTime(159));expect(button).toHaveAttribute("data-elastic-held","false");
    act(()=>vi.advanceTimersByTime(1));expect(button).toHaveAttribute("data-elastic-held","true");
    fireEvent.pointerCancel(button);expect(button).toHaveAttribute("data-elastic-held","false");expect(button.style.transform).toBe("");
    fireEvent.keyDown(button,{key:"Enter"});expect(button).toHaveAttribute("data-elastic-held","true");
    fireEvent.blur(button);expect(button).toHaveAttribute("data-elastic-held","false");
    fireEvent.pointerDown(button,{button:0,pointerId:2});unmount();expect(vi.getTimerCount()).toBe(0);
  });
  it("returns a pulled optical field to rest after release and stops frame work", () => {
    const {getByRole,unmount}=render(<GlassScene content={<div/>}><GlassElasticButton/></GlassScene>);
    const button=getByRole("button",{name:"Pull glass"});
    fireEvent.pointerDown(button,{button:0,clientX:100,clientY:100});
    act(()=>vi.advanceTimersByTime(160));
    fireEvent.pointerMove(button,{clientX:140,clientY:120});
    act(()=>vi.advanceTimersByTime(32));
    expect(button.style.transform).toContain("translate(10px,5px)");
    fireEvent.pointerUp(button);
    expect(button).toHaveAttribute("data-elastic-held","false");expect(button).toHaveAttribute("data-elastic-settling","true");
    act(()=>vi.advanceTimersByTime(500));
    expect(button).toHaveAttribute("data-elastic-settling","false");expect(button.style.transform).toBe("");
    unmount();expect(vi.getTimerCount()).toBe(0);
  });
});
