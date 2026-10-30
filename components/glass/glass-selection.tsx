"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { GlassLens } from "@/components/glass/glass-target-lens";
import { useGlassSettings } from "@/components/glass-scene";
import { CONTROL_LENS_PRESETS, buildControlLensTextures, controlLensMetrics, sampleControlLensSpring } from "@/lib/glass-lens-optics";
import { decodeLensTextures } from "@/lib/glass";
import { GlassFilterManager } from "@/lib/glass-filter";
import { registerGlassLens } from "@/lib/glass-performance";

const EMPTY = {
  left: 0,
  top: 0,
  width: 2,
  height: 2,
  x: 0,
  y: 0,
  visible: false,
  pointer: false,
  boundsWidth: 0,
  boundsHeight: 0,
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
      const key = [left, top, a.width, a.height, b.width, b.height].join(",");
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
        boundsWidth: b.width,
        boundsHeight: b.height,
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
      lensW: selection.width,
      lensH: selection.height,
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
          <SelectionLens selection={selection} owner={root}>
            {refractionTarget}
          </SelectionLens>
        </>
      ) : (
        <GlassLens {...indicator} className="size-full">
          {children}
        </GlassLens>
      )}
    </div>
  );
}

const PREFERENCE = "(prefers-reduced-transparency: reduce), (prefers-contrast: more)";
const subscribe = (callback: () => void) => {
  const media = matchMedia(PREFERENCE);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const reduced = () => matchMedia(PREFERENCE).matches;
const subscribeMotion = (callback: () => void) => {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const server = () => false;
const PADDING = 64;
const OPTICS = CONTROL_LENS_PRESETS.selection;
// Selection has its own pacing; the approved slider/switch springs stay intact.
const SELECTION_DURATION = 1000;
const CAP_RELEASE = 205;
const CAP_SETTLE = 180;
type Rect = { left: number; top: number; width: number; height: number };

/** Native controls never resize. Only this small lens changes shape, using
 * exact rounded-rectangle maps instead of stretching an oversized bitmap. */
function SelectionLens({ selection, owner, children }: {
  selection: typeof EMPTY;
  owner: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null), layer = useRef<HTMLDivElement>(null);
  const housing = useRef<SVGSVGElement>(null), reflection = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLDivElement>(null), manager = useRef<GlassFilterManager | null>(null);
  const pose = useRef<Rect | null>(null), velocity = useRef({ left: 0, top: 0, width: 0, height: 0 });
  const paint = useRef<(rect: Rect) => void>(() => {});
  const settings = useGlassSettings(), solid = useSyncExternalStore(subscribe, reduced, server);
  const still = useSyncExternalStore(subscribeMotion, reducedMotion, server);
  const [admitted, setAdmitted] = useState(false), [ready, setReady] = useState(false);
  const fullWidth = selection.boundsWidth + PADDING * 2,
    fullHeight = selection.boundsHeight + PADDING * 2;
  const bounded = selection.boundsWidth > 0 && selection.boundsHeight > 0 &&
    fullWidth <= 4096 && fullHeight <= 4096 && fullWidth * fullHeight <= 1_500_000;
  useEffect(() => {
    if (!selection.visible || !bounded || solid || !owner.current) return;
    return registerGlassLens(owner.current, setAdmitted, { priority: 5, limit: settings.performance?.maxActiveSurfaces });
  }, [selection.visible, bounded, solid, owner, settings.performance?.maxActiveSurfaces]);

  useLayoutEffect(() => {
    if (!admitted || solid || !bounded || !housing.current || !layer.current) return;
    const filter = new GlassFilterManager(housing.current, layer.current);
    manager.current = filter;
    let disposed = false, revision = 0, requestedKey = "", frame = 0;
    let current: { width: number; height: number; pad: number; reflection: string } | null = null;
    const place = () => {
      const rect = pose.current;
      if (!rect || !layer.current || !current || !reflection.current) return;
      const left = PADDING + rect.left + (rect.width - current.width) / 2,
        top = PADDING + rect.top + (rect.height - current.height) / 2;
      // Keep the accepted map, contour and glint together while a new shape
      // decodes. Its center follows input immediately; pixels never stretch.
      layer.current.style.clipPath = `inset(${top}px ${fullWidth - left - current.width}px ${fullHeight - top - current.height}px ${left}px round ${Math.min(current.width, current.height) / 2}px)`;
      filter.moveMap(left - current.pad, top - current.pad, current.width + current.pad * 2, current.height + current.pad * 2);
      Object.assign(reflection.current.style, {
        left: `${left - current.pad}px`, top: `${top - current.pad}px`,
        width: `${current.width + current.pad * 2}px`, height: `${current.height + current.pad * 2}px`,
        backgroundImage: `url("${current.reflection}")`,
      });
      filter.refresh();
      if (root.current) root.current.dataset.glassFilterPaints = String(filter.refreshes);
    };
    paint.current = (rect) => {
      pose.current = rect;
      // Half-pixel geometry bounds the number of maps during a short squish.
      // Pure translation reuses the current PNG and SVG graph.
      const width = Math.max(2, Math.round(rect.width * 2) / 2),
        height = Math.max(2, Math.round(rect.height * 2) / 2), key = `${width},${height}`;
      if (key !== requestedKey) {
        requestedKey = key;
        const request = ++revision, texture = buildControlLensTextures(width, height, height / 2, OPTICS);
        if (!texture.displacement) return;
        const metrics = controlLensMetrics(width, height, OPTICS);
        void decodeLensTextures(texture).then(() => {
          if (disposed || request !== revision) return;
          current = { width, height, pad: metrics.pad, reflection: texture.reflection };
          const rect = pose.current!;
          if (!filter.template) filter.update({
            map: texture.displacement, width: fullWidth, height: fullHeight,
            depth: settings.refraction === false ? 0 : metrics.displacementScale,
            chroma: 0, blur: 0, opticalTransmission: settings.refraction !== false,
            mapRegion: { x: PADDING + rect.left - metrics.pad, y: PADDING + rect.top - metrics.pad,
              width: width + metrics.pad * 2, height: height + metrics.pad * 2 },
          });
          else filter.replaceMap(texture.displacement, settings.refraction === false ? 0 : metrics.displacementScale);
          place();
          setReady(true);
        }).catch(() => { if (!disposed && request === revision) setReady(false); });
      }
      place();
    };
    const refresh = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(() => { frame = 0; filter.refresh(); });
    };
    const source = new MutationObserver(refresh);
    if (target.current) source.observe(target.current, { childList: true, subtree: true, characterData: true, attributes: true });
    const theme = new MutationObserver(refresh);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    theme.observe(document.body, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    document.fonts?.addEventListener("loadingdone", refresh);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      source.disconnect(); theme.disconnect();
      document.fonts?.removeEventListener("loadingdone", refresh);
      paint.current = () => {};
      filter.destroy(); manager.current = null;
      setReady(false);
    };
  }, [admitted, solid, bounded, fullWidth, fullHeight, settings.refraction]);

  useLayoutEffect(() => {
    const to = { left: selection.left, top: selection.top, width: selection.width, height: selection.height };
    const from = pose.current ?? to, momentum = { ...velocity.current };
    const moving = Math.hypot(from.left - to.left, from.top - to.top) > 0.1;
    const duration = selection.pointer && moving && admitted && !still && !solid ? SELECTION_DURATION : 0;
    let frame = 0, lift = 0;
    const start = performance.now();
    let last = start;
    const draw = (now: number) => {
      const elapsed = duration && !document.hidden ? Math.min(duration, now - start) : duration;
      const next = { ...to };
      for (const key of ["left", "top", "width", "height"] as const) {
        const value = sampleControlLensSpring(from[key], to[key], momentum[key], elapsed, duration);
        next[key] = value.value;
        velocity.current[key] = value.velocity;
      }
      const distance = Math.max(0.1, Math.hypot(to.left - from.left, to.top - from.top));
      const arrival = 1 - Math.min(1, Math.hypot(to.left - next.left, to.top - next.top) / distance);
      // Travel opens the cap. A slower release keeps its actual curved shape
      // inspectable as the spring arrives, then closes with a zero-slope finish.
      // There is no opening delay or separate grow-then-slide animation.
      lift = elapsed < duration ? Math.max(Math.sin(Math.PI * arrival), lift * Math.exp(-(now - last) / CAP_RELEASE)) : 0;
      last = now;
      const tail = duration ? Math.max(0, Math.min(1, (duration - elapsed) / CAP_SETTLE)) : 0;
      const expansion = lift * tail * tail * (3 - 2 * tail);
      const width = next.width + expansion * 4, height = Math.min(to.height + 24, next.height + expansion * 24);
      const rect = { left: next.left - expansion * 2, top: next.top - expansion * 12, width, height };
      pose.current = rect;
      paint.current(rect);
      if (elapsed < duration) frame = requestAnimationFrame(draw);
    };
    draw(start);
    return () => cancelAnimationFrame(frame);
  }, [selection, admitted, solid, still, bounded, fullWidth, fullHeight, settings.refraction]);

  const visible = ready && admitted && !solid && selection.visible;
  return (
    <div ref={root} aria-hidden="true" inert data-glass-ignore="" data-glass-target-lens="" data-lens-visible={visible}
      data-glass-rendering={visible ? "active" : "lightweight"}
      data-refraction={visible ? "target-svg" : "disabled"}
      style={{ position: "absolute", inset: "-20px -8px", overflow: "clip", zIndex: 2, pointerEvents: "none", opacity: visible ? 1 : 0 }}>
      <div style={{ position: "absolute", left: 8 - PADDING, top: 20 - PADDING, width: fullWidth, height: fullHeight }}>
        <svg ref={housing} width="0" height="0" style={{ position: "absolute" }} />
        <div ref={layer} style={{ position: "absolute", inset: 0, background: "var(--glass-lens-plane,var(--background))" }}>
          <div ref={target} style={{ position: "absolute", inset: PADDING }}>{children}</div>
        </div>
        <div ref={reflection} style={{ position: "absolute", backgroundSize: "100% 100%" }} />
      </div>
    </div>
  );
}
