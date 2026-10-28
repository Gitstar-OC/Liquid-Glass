import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { GlassThemeProvider } from "@/components/glass/glass-theme-provider";
import { GlassSound } from "@/components/glass/glass-sound";
import { GlassConnectivity } from "@/components/glass/glass-connectivity";
import { GlassRangeControl } from "@/components/glass/glass-range-control";
import { GlassControlCenter } from "@/components/glass/glass-control-center";
import { GlassMusicPlayer } from "@/components/glass/glass-music-player";
import { GlassPowerDialog } from "@/components/glass/glass-power";
import type { ReactNode } from "react";

vi.mock("@/lib/glass-scene", () => ({ attachSceneMirror: () => ({ updateGeometry() {}, destroy() {} }) }));
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
});
afterEach(() => vi.unstubAllGlobals());
const wrapper = ({children}: {children: ReactNode}) => <GlassThemeProvider>{children}</GlassThemeProvider>;

describe("compact glass controls", () => {
  it("expands a mini player on Play while retaining the same audio element and position",()=>{
    const load=vi.spyOn(HTMLMediaElement.prototype,"load").mockImplementation(()=>{});
    const play=vi.spyOn(HTMLMediaElement.prototype,"play").mockResolvedValue();
    const tracks=[{title:"Mini track",src:"/audio/test.wav"}];
    const {container,getByRole,queryByRole}=render(<GlassMusicPlayer ink="dark" tracks={tracks} expandable compact/>,{wrapper});
    const audio=container.querySelector("audio")!;
    expect(queryByRole("slider",{name:"Playback position"})).not.toBeInTheDocument();
    fireEvent.click(getByRole("button",{name:"Play music and expand"}));
    expect(play).toHaveBeenCalledOnce();expect(getByRole("slider",{name:"Playback position"})).toBeInTheDocument();
    audio.currentTime=6.5;fireEvent.click(getByRole("button",{name:"Minimize music player"}));
    expect(container.querySelector("audio")).toBe(audio);expect(audio.currentTime).toBe(6.5);
    expect(getByRole("button",{name:"Play music and expand"})).toBeInTheDocument();
    load.mockRestore();play.mockRestore();
  });
  it("keeps a controlled sound value and reports keyboard changes", () => {
    const change = vi.fn();
    const {getByRole, rerender} = render(<GlassSound ink="dark" volume={42} onVolumeChange={change} />, {wrapper});
    const slider = getByRole("slider", {name:"Output volume"});
    fireEvent.keyDown(slider, {key:"ArrowRight"});
    expect(change).toHaveBeenCalledWith(43);
    expect(slider).toHaveAttribute("aria-valuenow", "42");
    rerender(<GlassSound ink="dark" volume={64} onVolumeChange={change} />);
    expect(slider).toHaveAttribute("aria-valuenow", "64");
  });
  it("reports selected outputs and disables sharing choices while off", () => {
    const output = vi.fn();
    const changed = vi.fn();
    const {getByRole} = render(<><GlassSound ink="dark" onOutputChange={output}/><GlassConnectivity ink="dark" onVisibilityChange={changed}/></>, {wrapper});
    fireEvent.click(getByRole("radio", {name:"Studio display"}));
    expect(output).toHaveBeenCalledWith("display");
    fireEvent.click(getByRole("radio", {name:"Everyone"}));
    expect(changed).toHaveBeenCalledWith("everyone");
    fireEvent.click(getByRole("switch", {name:"AirDrop"}));
    expect(getByRole("radio", {name:"Everyone"})).toBeDisabled();
    expect(getByRole("radio", {name:"Everyone"})).toHaveAttribute("aria-checked", "true");
  });
  it("supports keyboard changes in the compact HUD and shares nested optics", () => {
    const change = vi.fn();
    const {getByRole,container} = render(<><GlassRangeControl ink="dark" label="Speakers" defaultValue={65} onValueChange={change}/><GlassControlCenter ink="dark" /></>, {wrapper});
    fireEvent.keyDown(getByRole("slider", {name:"Speakers"}), {key:"End"});
    expect(change).toHaveBeenCalledWith(100);
    expect(container.querySelectorAll('[data-glass-rendering="shared"]')).toHaveLength(2);
  });
  it("connects external volume to the audio element and reports controlled slider changes", () => {
    const load = vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    const changed = vi.fn();
    const tracks = [{title:"Test track",src:"/audio/test.wav"}];
    const {container,rerender,getByRole} = render(<GlassMusicPlayer ink="dark" tracks={tracks} volume={.2} onVolumeValueChange={changed}/>, {wrapper});
    const audio = container.querySelector("audio")!;
    expect(audio.volume).toBeCloseTo(.2);
    rerender(<GlassMusicPlayer ink="dark" tracks={tracks} volume={.8} onVolumeValueChange={changed}/>);
    expect(audio.volume).toBeCloseTo(.8);
    fireEvent.keyDown(getByRole("slider",{name:"Music volume"}),{key:"End"});
    expect(changed).toHaveBeenCalledWith(1);
    expect(audio.volume).toBeCloseTo(.8);
    load.mockRestore();
  });
  it("passes the reopen-windows preference when confirming power", () => {
    const confirm = vi.fn();
    const {getByRole} = render(<GlassPowerDialog defaultOpen onConfirm={confirm}/>, {wrapper});
    fireEvent.click(getByRole("checkbox", {name:"Reopen windows when signing in"}));
    fireEvent.click(getByRole("button", {name:/^Shut down$/}));
    expect(confirm).toHaveBeenCalledWith({reopenWindows:false});
  });
});
