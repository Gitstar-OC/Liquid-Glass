"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import { useGlassSettings } from "@/components/glass-scene";
import { CONTROL_LENS_PRESETS, type ControlLensInput } from "@/lib/glass-lens-optics";
import { registerGlassLens } from "@/lib/glass-performance";
import { GlassVideoRenderer } from "@/lib/glass-video";

const PREFERENCE = "(prefers-reduced-transparency: reduce), (prefers-contrast: more)";
const subscribe = (callback: () => void) => {
  const media = matchMedia(PREFERENCE);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const reduced = () => matchMedia(PREFERENCE).matches;
const server = () => false;

export interface GlassImageLensProps {
  /** The actual displayed image. No duplicate image DOM or screenshot is made. */
  imageRef: RefObject<HTMLImageElement | null>;
  radius?: number;
  parameters?: ControlLensInput;
  /** Final layout position for an overlay whose parent animates from a trigger. */
  sourcePosition?: { x: number; y: number };
  active?: boolean;
  style?: CSSProperties;
}

/** The video's optical shader, over a bounded window of a static image.
 * Load, resize, scroll and settled transforms redraw; there is no idle loop. */
export function GlassImageLens({
  imageRef, radius = 999, parameters = CONTROL_LENS_PRESETS.button,
  sourcePosition, active = true, style,
}: GlassImageLensProps) {
  const root = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const redraw = useRef<() => void>(() => {});
  const settings = useGlassSettings();
  const solid = useSyncExternalStore(subscribe, reduced, server);
  const [admitted, setAdmitted] = useState(false), [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState(0);
  const latest = useRef({ radius, parameters, sourcePosition, refraction: settings.refraction !== false });
  useLayoutEffect(() => {
    latest.current = { radius, parameters, sourcePosition, refraction: settings.refraction !== false };
  });
  const parameterKey = JSON.stringify(parameters);

  useEffect(() => {
    if (!active || solid || !root.current) return;
    return registerGlassLens(root.current, setAdmitted, {
      priority: 5, limit: settings.performance?.maxActiveSurfaces,
    });
  }, [active, solid, settings.performance?.maxActiveSurfaces]);

  useEffect(() => {
    const node = root.current, output = canvas.current, image = imageRef.current;
    if (!active || !admitted || solid || !node || !output || !image) return;
    setReady(false);
    let renderer: GlassVideoRenderer;
    try { renderer = new GlassVideoRenderer(output); }
    catch { return; }
    let disposed = false, failed = false, frame = 0, revision = 0, size = "";
    const paint = async () => {
      if (disposed || failed || document.hidden || !image.complete || !image.naturalWidth) return;
      const width = node.clientWidth, height = node.clientHeight;
      if (!width || !height || width > 1024 || height > 1024 || width * height > 1_500_000) {
        setReady(false);
        return;
      }
      const b = image.getBoundingClientRect(), a = node.getBoundingClientRect();
      if (!b.width || !b.height) return;
      const config = latest.current, current = ++revision;
      if (size !== `${width},${height}`) {
        renderer.resize(width, height);
        size = `${width},${height}`;
      }
      try {
        await renderer.setLenses([{
          x: 0, y: 0, width, height, radius: Math.min(config.radius, width / 2, height / 2),
          parameters: config.parameters,
        }]);
        if (disposed || failed || current !== revision) return;
        renderer.drawImage(image, {
          x: config.sourcePosition?.x ?? (a.left - b.left) * image.clientWidth / b.width,
          y: config.sourcePosition?.y ?? (a.top - b.top) * image.clientHeight / b.height,
          width: image.clientWidth,
          height: image.clientHeight,
        }, latest.current.refraction);
        setReady(true);
      } catch {
        failed = true;
        setReady(false);
      }
    };
    const schedule = () => {
      if (frame || disposed || failed || document.hidden) return;
      frame = requestAnimationFrame(() => { frame = 0; void paint(); });
    };
    redraw.current = schedule;
    const observer = new ResizeObserver(schedule);
    observer.observe(node);
    observer.observe(image);
    const sourceChange = new MutationObserver(() => { setReady(false); schedule(); });
    sourceChange.observe(image, { attributes: true, attributeFilter: ["src", "srcset", "sizes"] });
    const parent = node.parentElement;
    const lost = (event: Event) => {
      event.preventDefault();
      failed = true;
      setReady(false);
      cancelAnimationFrame(frame);
    };
    const restored = () => setRecovery(value => value + 1);
    image.addEventListener("load", schedule);
    parent?.addEventListener("transitionend", schedule);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    output.addEventListener("webglcontextlost", lost);
    output.addEventListener("webglcontextrestored", restored);
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      sourceChange.disconnect();
      image.removeEventListener("load", schedule);
      parent?.removeEventListener("transitionend", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      output.removeEventListener("webglcontextlost", lost);
      output.removeEventListener("webglcontextrestored", restored);
      redraw.current = () => {};
      renderer.destroy();
      setReady(false);
    };
  }, [active, admitted, solid, imageRef, recovery]);

  useEffect(() => { redraw.current(); }, [parameterKey, radius, sourcePosition?.x, sourcePosition?.y, settings.refraction]);
  const visible = active && admitted && !solid && ready;
  return (
    <div
      ref={root}
      aria-hidden="true"
      inert
      data-glass-ignore=""
      data-glass-image-lens=""
      data-target-lens-ready={visible}
      data-glass-rendering={visible ? "active" : "lightweight"}
      data-refraction={visible ? "image-webgl" : "disabled"}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", ...style }}
    >
      <canvas ref={canvas} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: visible ? 1 : 0 }} />
    </div>
  );
}
