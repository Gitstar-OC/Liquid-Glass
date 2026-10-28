"use client";

import { useLayoutEffect, useRef } from "react";

/** One moving highlight for a single-selection Radix group. No extra lens. */
export function useGlassSelection(enabled = true) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pointer = false, initialized = false, previous = "";
    const stop = () => { clearTimeout(timer); root.dataset.liquidMoving = "false"; };
    const measure = () => {
      const active = root.querySelector<HTMLElement>('[data-state="on"], [data-state="active"]');
      if (!active) { root.style.setProperty("--selection-opacity", "0"); return; }
      const a = active.getBoundingClientRect(), b = root.getBoundingClientRect();
      const geometry = [a.left - b.left, a.top - b.top, a.width, a.height];
      const key = geometry.join(",");
      if (key === previous) return;
      root.dataset.inputModality = pointer && initialized ? "pointer" : "keyboard";
      if (pointer && initialized) { root.dataset.liquidMoving = "true"; clearTimeout(timer); timer = setTimeout(stop, 300); }
      geometry.forEach((value, i) => root.style.setProperty(["--selection-x", "--selection-y", "--selection-w", "--selection-h"][i], `${value}px`));
      root.style.setProperty("--selection-opacity", "1");
      initialized = true; previous = key;
    };
    const onPointer = () => { pointer = true; };
    const onKey = () => { pointer = false; stop(); };
    const observer = new MutationObserver(measure);
    observer.observe(root, {subtree: true, attributes: true, attributeFilter: ["data-state"]});
    const resize = new ResizeObserver(() => { pointer = false; measure(); });
    resize.observe(root); for (const item of root.querySelectorAll<HTMLElement>('[data-slot$="trigger"], [data-slot="toggle-group-item"]')) resize.observe(item);
    root.addEventListener("pointerdown", onPointer, true); root.addEventListener("keydown", onKey, true);
    measure();
    return () => { stop(); observer.disconnect(); resize.disconnect(); root.removeEventListener("pointerdown", onPointer, true); root.removeEventListener("keydown", onKey, true); };
  }, [enabled]);
  return ref;
}

export function GlassSelectionIndicator() { return <span aria-hidden="true" className="glass-selection-indicator"/>; }
