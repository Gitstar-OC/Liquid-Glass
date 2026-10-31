"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { useGlassScene, useGlassSettings } from "@/components/glass-scene";
import {
  buildAtlasTextures,
  getAtlasTextureCacheStats,
  type AtlasLens,
} from "@/lib/glass-atlas";
import {
  decodeLensTextures,
  resolveLensParams,
  resolveOptics,
} from "@/lib/glass";
import { attachSceneMirror } from "@/lib/glass-scene";
import { GlassFilterManager } from "@/lib/glass-filter";
import { registerGlassLens } from "@/lib/glass-performance";
import type { GlassShape } from "@/lib/glass";
import { subscribeReducedGlass as subscribeReduced, prefersReducedGlass as reducedSnapshot, serverGlassPreference as serverSnapshot } from "@/lib/glass-preferences";

interface AtlasContextValue {
  register: (
    element: HTMLElement,
    radius: number,
    shape: GlassShape,
  ) => () => void;
  invalidate: () => void;
  active: boolean;
  enabled: boolean;
}
const AtlasContext = createContext<AtlasContextValue | null>(null);

/** Opt-in batching for non-overlapping sibling surfaces sharing one optical configuration. */
export function GlassAtlas({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const scene = useGlassScene(),
    settings = useGlassSettings();
  const root = useRef<HTMLDivElement>(null),
    layer = useRef<HTMLDivElement>(null),
    host = useRef<HTMLDivElement>(null);
  const housing = useRef<SVGSVGElement>(null),
    reflection = useRef<HTMLDivElement>(null),
    blur = useRef<HTMLDivElement>(null);
  const filter = useRef<GlassFilterManager | null>(null),
    installed = useRef<{
      map: string;
      reflection: string;
      rim?: string;
      rimScale?: number;
      width: number;
      height: number;
    } | null>(null);
  const members = useRef(
      new Map<HTMLElement, { radius: number; shape: GlassShape }>(),
    ),
    resize = useRef<ResizeObserver | null>(null);
  const queue = useRef<() => void>(() => {});
  const [admitted, setAdmitted] = useState(false),
    [ready, setReady] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    reducedSnapshot,
    serverSnapshot,
  );
  const enabled = Boolean(scene) && !reduced;
  const invalidate = useCallback(() => queue.current(), []);
  const register = useCallback(
    (element: HTMLElement, radius: number, shape: GlassShape) => {
      members.current.set(element, { radius, shape });
      resize.current?.observe(element);
      queue.current();
      return () => {
        members.current.delete(element);
        resize.current?.unobserve(element);
        queue.current();
      };
    },
    [],
  );
  const params = resolveLensParams("clear", {
    ...settings.config,
    ...scene?.config,
    ...(settings.refraction === false ? { depth: 0, chroma: 0 } : {}),
  });
  const latestParams = useRef(params);
  const optics = resolveOptics(settings.optics),
    latestOptics = useRef(optics);
  const geometryKey = JSON.stringify([
    params.splay,
    params.feather,
    params.curve,
    params.glint,
    { ...optics, colorBleed: 0 },
  ]);
  const applyFinish = useCallback(() => {
    const p = latestParams.current;
    if (blur.current)
      blur.current.style.filter = `saturate(${p.saturate}) brightness(${p.brightness}) contrast(${p.contrast})`;
    if (installed.current)
      filter.current?.update({
        ...installed.current,
        depth: p.depth,
        blur: p.blur,
        chroma: p.chroma,
        glint: Math.min(1, p.glint / 100),
        colorBleed: latestOptics.current.colorBleed,
      });
    if (reflection.current)
      reflection.current.style.opacity = String(
        1 - latestOptics.current.colorBleed * 0.85,
      );
  }, []);
  useLayoutEffect(() => {
    latestParams.current = params;
    latestOptics.current = optics;
  });
  useLayoutEffect(applyFinish, [
    params.blur,
    params.saturate,
    params.brightness,
    params.contrast,
    params.depth,
    params.chroma,
    optics.colorBleed,
    applyFinish,
  ]);
  useEffect(() => {
    if (!enabled || !root.current) return;
    return registerGlassLens(root.current, setAdmitted, {
      limit: settings.performance?.maxActiveSurfaces,
      priority: 2,
    });
  }, [enabled, settings.performance?.maxActiveSurfaces]);
  useEffect(() => {
    const surface = root.current,
      target = layer.current,
      mirrorHost = host.current,
      svg = housing.current,
      source = scene?.source.current;
    if (
      !enabled ||
      !admitted ||
      !surface ||
      !target ||
      !mirrorHost ||
      !svg ||
      !source
    )
      return;
    const [, , , , optics] = JSON.parse(geometryKey);
    const params = latestParams.current;
    let disposed = false,
      frame = 0,
      ticket = 0,
      last = "",
      builds = 0;
    const manager = new GlassFilterManager(svg, target);
    filter.current = manager;
    const mirror = attachSceneMirror(source, mirrorHost, surface, 0, {
      frameRate: scene?.frameRate ?? settings.performance?.frameRate ?? 30,
      onPaint: manager.refresh,
    });
    const paint = async () => {
      frame = 0;
      if (disposed || document.hidden) return;
      const bounds = surface.getBoundingClientRect();
      if (bounds.width < 2 || bounds.height < 2) return;
      const shapes: AtlasLens[] = [];
      for (const [element, { radius, shape }] of members.current) {
        const rect = element.getBoundingClientRect();
        if (!element.isConnected || rect.width < 2 || rect.height < 2) continue;
        // Match CSS layout's subpixel grid; half-pixel snapping separated the
        // atlas rim from each member's fractional clip and diagnostic contour.
        const round = (value: number) => Math.round(value * 64) / 64;
        shapes.push({
          x: round(rect.left - bounds.left),
          y: round(rect.top - bounds.top),
          width: round(rect.width),
          height: round(rect.height),
          radius,
          shape,
        });
      }
      const key = JSON.stringify([bounds.width, bounds.height, shapes]);
      mirror.updateGeometry();
      if (key === last) return;
      last = key;
      const current = ++ticket;
      const before = getAtlasTextureCacheStats();
      const started = performance.now();
      const textures = buildAtlasTextures(
        bounds.width,
        bounds.height,
        shapes,
        params,
        optics,
      );
      surface.dataset.atlasTextureMs = (performance.now() - started).toFixed(2);
      surface.dataset.atlasTextureBuilds = String(
        getAtlasTextureCacheStats().builds - before.builds,
      );
      if (!textures) return;
      await decodeLensTextures(textures);
      if (disposed || current !== ticket) return;
      surface.style.maskImage = `url("${textures.mask}")`;
      surface.style.setProperty(
        "-webkit-mask-image",
        `url("${textures.mask}")`,
      );
      surface.style.maskSize = "100% 100%";
      surface.style.setProperty("-webkit-mask-size", "100% 100%");
      if (reflection.current)
        reflection.current.style.backgroundImage = `url("${textures.reflection}")`;
      installed.current = {
        map: textures.displacement,
        reflection: textures.reflection,
        rim: textures.rim,
        rimScale: textures.rimScale,
        width: bounds.width,
        height: bounds.height,
      };
      applyFinish();
      surface.dataset.atlasMapBuilds = String(++builds);
      surface.dataset.atlasShapes = String(shapes.length);
      setReady(true);
    };
    const schedule = () => {
      if (!frame && !disposed && !document.hidden)
        frame = requestAnimationFrame(() => {
          void paint();
        });
    };
    queue.current = schedule;
    const observer = new ResizeObserver(schedule);
    resize.current = observer;
    const foreground = surface.parentElement;
    foreground?.addEventListener("transitionend", schedule, true);
    foreground?.addEventListener("animationend", schedule, true);
    observer.observe(surface);
    for (const element of members.current.keys()) observer.observe(element);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    document.fonts?.addEventListener("loadingdone", schedule);
    schedule();
    return () => {
      disposed = true;
      ++ticket;
      cancelAnimationFrame(frame);
      queue.current = () => {};
      observer.disconnect();
      resize.current = null;
      mirror.destroy();
      manager.destroy();
      setReady(false);
      filter.current = null;
      installed.current = null;
      foreground?.removeEventListener("transitionend", schedule, true);
      foreground?.removeEventListener("animationend", schedule, true);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      document.removeEventListener("visibilitychange", schedule);
      document.fonts?.removeEventListener("loadingdone", schedule);
    };
  }, [
    enabled,
    admitted,
    scene?.source,
    scene?.frameRate,
    settings.performance?.frameRate,
    geometryKey,
    applyFinish,
  ]);
  const value = useMemo(
    () => ({
      register,
      invalidate,
      active: enabled && admitted && ready,
      enabled,
    }),
    [register, invalidate, enabled, admitted, ready],
  );
  return (
    <AtlasContext.Provider value={value}>
      <div
        className={className}
        data-glass-atlas-root=""
        style={{ position: "relative" }}
      >
        <div
          ref={root}
          aria-hidden="true"
          data-liquid-glass=""
          data-glass-atlas=""
          data-glass-clip=""
          data-glass-color-bleed={optics.colorBleed}
          data-glass-blur-px={params.blur}
          data-glass-rendering={enabled && admitted ? "active" : "lightweight"}
          data-refraction={
            settings.refraction === false
              ? "disabled"
              : enabled && admitted && ready
                ? "scene-atlas"
                : "css"
          }
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            visibility: enabled && admitted && ready ? "visible" : "hidden",
            isolation: "isolate",
            overflow: "hidden",
          }}
        >
          <svg
            ref={housing}
            width="0"
            height="0"
            style={{ position: "absolute" }}
            aria-hidden="true"
          />
          <div
            ref={blur}
            className="glass-atlas-finish"
            style={{ position: "absolute", inset: 0 }}
          >
            <div
              ref={layer}
              data-lens-layer=""
              style={{ position: "absolute", inset: 0 }}
            >
              <div
                ref={host}
                data-glass-mirror-host=""
                inert
                style={{ position: "absolute", pointerEvents: "none" }}
              />
            </div>
          </div>
          <div
            ref={reflection}
            data-atlas-reflection=""
            style={{
              position: "absolute",
              inset: 0,
              backgroundSize: "100% 100%",
            }}
          />
        </div>
        {children}
      </div>
    </AtlasContext.Provider>
  );
}
export function useGlassAtlas() {
  return useContext(AtlasContext);
}
export function useAtlasMember(
  ref: RefObject<HTMLElement | null>,
  radius: number,
  enabled: boolean,
  shape: GlassShape = "round",
) {
  const atlas = useGlassAtlas();
  const register = atlas?.register,
    invalidate = atlas?.invalidate;
  const available = enabled && Boolean(atlas?.enabled);
  useLayoutEffect(() => {
    if (available && register && ref.current)
      return register(ref.current, radius, shape);
  }, [available, register, ref, radius, shape]);
  useLayoutEffect(() => {
    if (available) invalidate?.();
  });
  return available ? atlas : null;
}
