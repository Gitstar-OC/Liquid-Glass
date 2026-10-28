import { describe, expect, it, vi } from "vitest";
import { render, renderHook } from "@testing-library/react";
import {
  LiquidButton,
  LiquidContextMenu,
  LiquidGlass,
  useGlassSupport,
} from "@/components/liquid-glass";
import { GLASS_PRESETS } from "@/lib/glass";

describe("LiquidGlass", () => {
  it("renders children inside the glass", () => {
    const { container } = render(
      <LiquidGlass preset="clear" radius={30}>
        <span>through the lens</span>
      </LiquidGlass>
    );
    expect(container.firstElementChild).not.toBeNull();
    expect(container.textContent).toContain("through the lens");
  });

  it("applies border radius inline", () => {
    const { container } = render(<LiquidGlass radius={42}>x</LiquidGlass>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.borderRadius).toBe("42px");
  });

  it("uses a frost-only filter chain when SVG backdrop refraction is unavailable", () => {
    const { container } = render(
      <LiquidGlass preset="regular">x</LiquidGlass>
    );
    const root = container.firstElementChild as HTMLElement;
    const lens = root.querySelector("[data-lens-layer]") as HTMLElement;

    // Derived from the preset so retuning a material can't break this test.
    const p = GLASS_PRESETS.regular;
    const expected = [
      `blur(${p.blur}px)`,
      `saturate(${p.saturate})`,
      `brightness(${p.brightness})`,
      `contrast(${p.contrast})`,
    ].join(" ");

    expect(lens.style.backdropFilter).toBe(expected);
    expect(lens.style.backdropFilter).not.toContain("url(");
    expect(root.getAttribute("style")).toContain("border-radius");
  });

  it("emits different chains per preset", () => {
    const chains = (["clear", "frosted", "thick"] as const).map((p) => {
      const { container, unmount } = render(<LiquidGlass preset={p}>x</LiquidGlass>);
      const lens = container.querySelector("[data-lens-layer]") as HTMLElement;
      const chain = lens.style.backdropFilter;
      unmount();
      return chain;
    });
    expect(new Set(chains).size).toBe(3);
  });

  it("keeps the tint layer in sync with config overrides", () => {
    const { container } = render(
      <LiquidGlass config={{ tint: 0.5, tintColor: "#ff0000" }}>x</LiquidGlass>
    );
    const layers = Array.from(container.querySelectorAll("[data-glass-tint]")) as HTMLElement[];
    const tintLayer = layers.find((el) => el.style.backgroundColor.includes("255, 0, 0"));
    expect(tintLayer).toBeDefined();
    expect(tintLayer!.style.backgroundColor).toContain("0.5");
  });

  it("disables optics for reduced transparency or increased contrast", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    try {
      const { container, unmount } = render(<LiquidGlass preset="clear">Readable</LiquidGlass>);
      const root = container.firstElementChild as HTMLElement;
      expect(root.dataset.refraction).toBe("opaque");
      const layer = root.querySelector("[data-lens-layer]") as HTMLElement;
      expect(layer.style.backdropFilter).toBe("none");
      expect(layer.style.filter).toBe("");
      unmount();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("forwards arbitrary DOM props to the root element", () => {
    const { container } = render(
      <LiquidGlass data-testid="my-glass" aria-label="panel">
        x
      </LiquidGlass>
    );
    expect(container.querySelector('[data-testid="my-glass"]')).not.toBeNull();
  });

  it("supports polymorphic tags", () => {
    const { container } = render(<LiquidGlass as="section">x</LiquidGlass>);
    expect(container.querySelector("section")).not.toBeNull();
  });
});

describe("LiquidButton", () => {
  it("renders its label and fires clicks", async () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <LiquidButton preset="clear" onClick={onClick}>
        Press me
      </LiquidButton>
    );
    const btn = getByRole("button", { name: /press me/i });
    btn.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps the frost chain usable without refraction support", () => {
    const { getByRole } = render(<LiquidButton>Go</LiquidButton>);
    const glass = getByRole("button").firstElementChild as HTMLElement;
    const lens = glass.querySelector("[data-lens-layer]") as HTMLElement;
    expect(lens.style.backdropFilter).toContain("saturate");
    expect(lens.style.backdropFilter).not.toContain("url(");
  });
});

describe("LiquidContextMenu", () => {
  it("renders all items and dispatches actions", () => {
    const actions = [vi.fn(), vi.fn(), vi.fn()];
    const { getByRole } = render(
      <LiquidContextMenu
        items={[
          { label: "Alpha", action: actions[0] },
          { label: "Beta", action: actions[1] },
          { label: "Gamma", action: actions[2] },
        ]}
      />
    );
    getByRole("button", { name: "Beta" }).click();
    expect(actions[1]).toHaveBeenCalledTimes(1);
    expect(actions[0]).not.toHaveBeenCalled();
  });
});

describe("useGlassSupport", () => {
  it("starts false outside a Blink browser", () => {
    const { result } = renderHook(() => useGlassSupport());
    expect(result.current).toBe(false);
  });
});
