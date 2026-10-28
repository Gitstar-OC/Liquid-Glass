import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { ParameterSlider } from "@/components/site/preview-controls";
import { Slider } from "@/components/ui/slider";

beforeEach(() =>
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);
afterEach(() => vi.unstubAllGlobals());

describe("shared preview controls", () => {
  it("commits bounded numeric edits and leaves an empty edit unchanged", () => {
    const change = vi.fn();
    const { getByRole } = render(
      <ParameterSlider
        label="Blur"
        value={1}
        min={0}
        max={20}
        step={0.25}
        onValueChange={change}
      />,
    );
    const input = getByRole("spinbutton", { name: "Blur value" });
    fireEvent.change(input, { target: { value: "30" } });
    fireEvent.blur(input);
    expect(change).toHaveBeenLastCalledWith(20);
    change.mockClear();
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(change).not.toHaveBeenCalled();
    expect(input).toHaveValue(1);
    expect(getByRole("slider", { name: "Blur" })).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
  });
  it("names the slider thumb and supports keyboard changes", () => {
    const change = vi.fn();
    const { getByRole } = render(
      <Slider
        aria-label="Volume"
        value={[40]}
        min={0}
        max={100}
        onValueChange={change}
      />,
    );
    fireEvent.keyDown(getByRole("slider", { name: "Volume" }), {
      key: "ArrowRight",
    });
    expect(change).toHaveBeenCalledWith([41]);
  });
});
