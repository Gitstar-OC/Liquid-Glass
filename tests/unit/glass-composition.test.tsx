import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { GlassSettingsProvider, GlassScene } from "@/components/glass-scene";
import { GlassThemeProvider } from "@/components/glass/glass-theme-provider";
import { GlassSurface } from "@/components/glass/glass-surface";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassToggleGroup, GlassToggleGroupItem } from "@/components/glass/glass-toggle";
import { GlassSwitch } from "@/components/glass/glass-switch";
import { LiquidGlass } from "@/components/liquid-glass";

vi.mock("@/lib/glass-scene", () => ({
  attachSceneMirror: () => ({ updateGeometry() {}, destroy() {} }),
}));

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => vi.unstubAllGlobals());

describe("composable glass", () => {
  it("scopes material overrides without preventing an explicit per-component choice",()=>{
    const {getByTestId}=render(<GlassThemeProvider><GlassSettingsProvider surface="frosted"><GlassSurface ink="dark" data-testid="material">A</GlassSurface><GlassSettingsProvider surface="clear"><GlassSurface ink="dark" data-testid="clear">B</GlassSurface><GlassSurface ink="dark" surface="transparent" data-testid="explicit">C</GlassSurface></GlassSettingsProvider></GlassSettingsProvider></GlassThemeProvider>);
    expect(getByTestId("material")).toHaveAttribute("data-glass-surface","frosted");expect(getByTestId("clear")).toHaveAttribute("data-glass-surface","clear");expect(getByTestId("explicit")).toHaveAttribute("data-glass-surface","transparent");
  });
  it("inherits shared optical settings while preserving local overrides", () => {
    const { getByTestId } = render(
      <GlassSettingsProvider config={{ blur: 3 }} radius={34}>
        <GlassSettingsProvider config={{ brightness: 1.2 }}>
          <LiquidGlass data-testid="shared">Shared</LiquidGlass>
          <LiquidGlass data-testid="local" config={{ blur: 1 }} radius={12}>
            Local
          </LiquidGlass>
        </GlassSettingsProvider>
      </GlassSettingsProvider>,
    );
    const shared = getByTestId("shared");
    const local = getByTestId("local");
    expect(shared.style.borderRadius).toBe("34px");
    expect(local.style.borderRadius).toBe("12px");
    expect(
      (shared.querySelector("[data-lens-layer]") as HTMLElement).style
        .backdropFilter,
    ).toContain("blur(3px)");
    expect(
      (local.querySelector("[data-lens-layer]") as HTMLElement).style
        .backdropFilter,
    ).toContain("blur(1px)");
    expect(
      (local.querySelector("[data-lens-layer]") as HTMLElement).style
        .backdropFilter,
    ).toContain("brightness(1.2)");
  });

  it("preserves a composed link's single root, ref and click behavior", () => {
    const ref = createRef<HTMLAnchorElement>();
    const onClick = vi.fn();
    const { getByRole } = render(
      <GlassThemeProvider>
        <GlassSettingsProvider>
          <GlassScene content={<div />}>
            <GlassButton asChild shape="circle" onClick={onClick}>
              <a href="#next" ref={ref}>
                Next
              </a>
            </GlassButton>
          </GlassScene>
        </GlassSettingsProvider>
      </GlassThemeProvider>,
    );
    const link = getByRole("link", { name: "Next" });
    expect(ref.current).toBe(link);
    expect(link.hasAttribute("data-liquid-glass")).toBe(true);
    expect(link.style.borderRadius).toBe("999px");
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(link.querySelector("button")).toBeNull();
  });

  it("shares inline glass but gives logically nested overlays an independent renderer", () => {
    const { getByTestId } = render(<GlassThemeProvider><GlassSurface ink="dark"><GlassSurface ink="dark" data-testid="inline">Inline</GlassSurface><GlassSurface kind="alert-dialog" ink="dark" data-testid="overlay">Overlay</GlassSurface></GlassSurface></GlassThemeProvider>);
    expect(getByTestId("inline").getAttribute("data-glass-rendering")).toBe("shared");
    expect(getByTestId("inline").getAttribute("data-refraction")).toBe("inherited");
    expect(getByTestId("inline").querySelector("[data-glass-clip]")).toBeNull();
    expect(getByTestId("overlay").getAttribute("data-glass-rendering")).not.toBe("shared");
  });

  it("uses one edge for segmented navigation inside a panel", () => {
    const {getByRole} = render(<GlassThemeProvider><GlassSurface ink="dark"><GlassToggleGroup type="single" defaultValue="library" aria-label="View"><GlassToggleGroupItem value="library">Library</GlassToggleGroupItem><GlassToggleGroupItem value="recent">Recent</GlassToggleGroupItem></GlassToggleGroup></GlassSurface></GlassThemeProvider>);
    expect(getByRole("radio", {name:"Library"})).not.toHaveClass("glass-chip");
    fireEvent.click(getByRole("radio", {name:"Recent"}));
    expect(getByRole("radio", {name:"Recent"})).toHaveAttribute("aria-checked", "true");
  });

  it("keeps controlled and disabled switches functional inside a surface", () => {
    const changed = vi.fn();
    const disabledChanged = vi.fn();
    const { getByRole } = render(
      <GlassThemeProvider>
        <GlassSurface ink="dark">
          <GlassSwitch
            aria-label="Notifications"
            checked
            onCheckedChange={changed}
          />
          <GlassSwitch
            aria-label="Unavailable"
            disabled
            onCheckedChange={disabledChanged}
          />
        </GlassSurface>
      </GlassThemeProvider>,
    );
    const control = getByRole("switch", { name: "Notifications" });
    control.click();
    expect(changed).toHaveBeenCalledWith(false);
    expect(control.getAttribute("aria-checked")).toBe("true");
    getByRole("switch", { name: "Unavailable" }).click();
    expect(disabledChanged).not.toHaveBeenCalled();
  });
});
