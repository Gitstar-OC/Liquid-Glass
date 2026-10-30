"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { GlassLens } from "@/components/glass/glass-target-lens";
import { CONTROL_LENS_PRESETS } from "@/lib/glass-lens-optics";

const EMPTY = {
  left: 0,
  top: 0,
  width: 2,
  height: 2,
  x: 0,
  y: 0,
  visible: false,
  pointer: false,
};

/** The glass is the selected pill, including after its spring has settled. */
export function GlassSelection({
  children,
  refractionTarget,
}: {
  children: ReactNode;
  refractionTarget?: ReactNode;
  /** @deprecated Selection glass is now persistent. */
  opticalIdle?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState(EMPTY);
  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    let pointer = false,
      previous = "";
    const measure = () => {
      const item = node.querySelector<HTMLElement>(
        '[data-state="on"], [data-state="active"]',
      );
      if (!item) {
        previous = "";
        setSelection((state) =>
          state.visible ? { ...state, visible: false } : state,
        );
        return;
      }
      const a = item.getBoundingClientRect(),
        b = node.getBoundingClientRect();
      const left = a.left - b.left,
        top = a.top - b.top;
      const key = [left, top, a.width, a.height].join(",");
      if (key === previous) return;
      previous = key;
      setSelection({
        left,
        top,
        width: a.width,
        height: a.height,
        x: left / Math.max(1, b.width - a.width),
        y: top / Math.max(1, b.height - a.height),
        visible: true,
        pointer,
      });
    };
    const onPointer = () => { pointer = true; };
    const onKey = () => { pointer = false; };
    const observer = new MutationObserver((records) => {
      // Dynamic options may reorder/resize; optical filter mutations are not
      // layout changes to the real controls and must not trigger measurement.
      if (records.some(({ target }) => {
        const element = target instanceof Element ? target : target.parentElement;
        return !element?.closest("[data-glass-target-lens]");
      })) measure();
    });
    observer.observe(node, {
      subtree: true,
      attributes: true,
      childList: true,
      characterData: true,
      attributeFilter: ["data-state"],
    });
    const resize = typeof ResizeObserver === "undefined" ? null :
      new ResizeObserver(() => {
        pointer = false;
        measure();
      });
    resize?.observe(node);
    for (const item of node.querySelectorAll<HTMLElement>("[data-state]"))
      resize?.observe(item);
    node.addEventListener("pointerdown", onPointer, true);
    node.addEventListener("keydown", onKey, true);
    measure();
    return () => {
      observer.disconnect();
      resize?.disconnect();
      node.removeEventListener("pointerdown", onPointer, true);
      node.removeEventListener("keydown", onKey, true);
    };
  }, []);

  const indicator = {
    lens: {
      lensW: selection.width + (refractionTarget ? 8 : 0),
      lensH: selection.height + (refractionTarget ? 16 : 0),
      borderRadius: 999,
    },
    x: selection.x,
    y: selection.y,
    active: selection.visible,
    parameters: CONTROL_LENS_PRESETS.selection,
    duration: selection.pointer ? 500 : 0,
  };
  return (
    <div
      ref={root}
      className="glass-selection-source relative flex min-w-0 flex-1 self-stretch"
    >
      <span
        aria-hidden="true"
        data-selection-fallback=""
        style={{
          position: "absolute",
          pointerEvents: "none",
          left: selection.left,
          top: selection.top,
          width: selection.width,
          height: selection.height,
          borderRadius: 999,
          background: "color-mix(in oklab,var(--foreground) 8%,transparent)",
          opacity: selection.visible ? 1 : 0,
        }}
      />
      {refractionTarget ? (
        <>
          {children}
          <GlassLens
            {...indicator}
            settledScale={{
              x: selection.width / (selection.width + 8),
              y: selection.height / (selection.height + 16),
            }}
            style={{
              position: "absolute",
              inset: "-8px -4px",
              zIndex: 2,
              pointerEvents: "none",
            }}
            refractionTarget={
              <div style={{
                position: "absolute",
                left: 4,
                top: 8,
                width: "calc(100% - 8px)",
                height: "calc(100% - 16px)",
              }}>
                {refractionTarget}
              </div>
            }
          />
        </>
      ) : (
        <GlassLens {...indicator} className="size-full">
          {children}
        </GlassLens>
      )}
    </div>
  );
}
