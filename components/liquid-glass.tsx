"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  buildLensTextures,
  decodeLensTextures,
  resolveLensParams,
  resolveOptics,
  resolveBackdropTreatment,
  rgba,
  lensClipPath,
  lensOutlinePath,
  supportsSvgBackdropFilter,
  type GlassOptics,
  type LensTextures,
  type GlassPreset,
  type LensParams,
  type GlassShape,
} from "@/lib/glass";
import { attachSceneMirror, classifyGlassBackdrop, type SceneMirror } from "@/lib/glass-scene";
import { GlassFilterManager } from "@/lib/glass-filter";
import { useGlassScene, useGlassSettings } from "@/components/glass-scene";
import { useBackdropPlane } from "@/components/glass-backdrop";
import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";
import { registerGlassLens } from "@/lib/glass-performance";

export interface LiquidGlassProps extends HTMLAttributes<HTMLElement> {
  preset?: GlassPreset;
  config?: Partial<LensParams>;
  radius?: number;
  shape?: GlassShape;
  adaptiveBackdrop?: boolean;
  /** Keep an explicit component blur while retaining background-content protection. */
  preserveBlur?: boolean;
  showOutline?: boolean;
  pad?: number;
  optics?: Partial<GlassOptics>;
  deformation?: { x: number; y: number };
  /** Complete bounded DOM source; lenses inside it are excluded from capture. */
  sceneRef?: React.RefObject<HTMLElement | null>;
  /** Optional legacy image-only source. Prefer sceneRef/GlassScene for full DOM. */
  backdropRef?: React.RefObject<HTMLImageElement | null>;
  frameRate?: number;
  tintBlendMode?: CSSProperties["mixBlendMode"];
  as?: "div" | "section" | "aside" | "nav" | "header" | "footer" | "article";
  /** Apply the optical surface to one ref-forwarding component, e.g. a shadcn Card. */
  asChild?: boolean;
  /** Readability overlay; separate from optical tint so refraction stays intact. */
  readability?: { color: string; opacity: number };
  children?: ReactNode;
  /** Shared controls use a lightweight glass finish without another mirror. */
  rendering?: "auto" | "shared" | "composited" | "inherited";
  /** Atlas admission/readiness; keeps its fallback free of per-member blur passes. */
  compositorReady?: boolean;
  priority?: number;
}
const subscribeNoop = () => () => {};
const REDUCE_GLASS =
  "(prefers-reduced-transparency: reduce), (prefers-contrast: more)";
const reducedGlassSnapshot = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia(REDUCE_GLASS).matches;
function subscribeReducedGlass(listener: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const media = window.matchMedia(REDUCE_GLASS);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
export function useGlassSupport(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    supportsSvgBackdropFilter,
    () => false,
  );
}

export function LiquidGlass({
  preset = "clear",
  config,
  radius,
  shape = "round",
  adaptiveBackdrop = false,
  preserveBlur = false,
  showOutline,
  pad = 32,
  optics,
  deformation,
  sceneRef,
  backdropRef,
  frameRate,
  tintBlendMode = "multiply",
  as = "div",
  asChild = false,
  readability,
  rendering = "auto",
  compositorReady = true,
  priority = 0,
  className = "",
  style,
  children,
  ref,
  ...rest
}: LiquidGlassProps & { ref?: React.Ref<HTMLElement> }) {
  const Tag = asChild ? Slot.Root : as;
  const context = useGlassScene();
  const settings = useGlassSettings();
  const effectiveOptics = { ...settings.optics, ...optics };
  const resolvedRadius = radius ?? settings.radius ?? 24;
  const source = sceneRef ?? context?.source;
  const rootEl = useRef<HTMLElement | null>(null);
  const housing = useRef<SVGSVGElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const mirrorHost = useRef<HTMLDivElement>(null);
  const mirror = useRef<SceneMirror | null>(null);
  const manager = useRef<GlassFilterManager | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [backdropKind,setBackdropKind] = useState<"plain"|"image"|"content"|null>(null);
  const [budgetActive, setBudgetActive] = useState(false);
  const [budgetResolved, setBudgetResolved] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [textures, setTextures] = useState<LensTextures | null>(null);
  const nativeRefraction = useGlassSupport();
  const reduced = useSyncExternalStore(
    subscribeReducedGlass,
    reducedGlassSnapshot,
    () => false,
  );
  useEffect(() => {
    const element = rootEl.current;
    if (!element || reduced || rendering !== "auto" || (!source?.current && !backdropRef?.current)) { setBudgetActive(false); setBudgetResolved(true); return; }
    return registerGlassLens(element, value => {setBudgetActive(value);setBudgetResolved(true);}, { limit: settings.performance?.maxActiveSurfaces, priority });
  }, [source, backdropRef, reduced, rendering, priority, settings.performance?.maxActiveSurfaces]);
  const p = resolveLensParams(preset, {
    ...settings.config,
    ...context?.config,
    ...config,
  });
  const optical = useMemo(
    () =>
      resolveOptics({
        refractiveIndex: effectiveOptics.refractiveIndex,
        thickness: effectiveOptics.thickness,
        lightAngle: effectiveOptics.lightAngle,
        roughness: effectiveOptics.roughness,
        interior: effectiveOptics.interior,
        colorBleed: effectiveOptics.colorBleed,
      }),
    [
      effectiveOptics.refractiveIndex,
      effectiveOptics.thickness,
      effectiveOptics.lightAngle,
      effectiveOptics.roughness,
      effectiveOptics.interior,
      effectiveOptics.colorBleed,
    ],
  );
  const safeRadius = Number.isFinite(resolvedRadius)
    ? Math.max(0, resolvedRadius)
    : 24;
  const samplingPad = Math.ceil(
    Math.max(
      Number.isFinite(pad) ? pad : 32,
      (p.depth * (1 + p.chroma)) / 2 + p.blur * 3 + 2,
    ),
  );
  const plane = useBackdropPlane(
    rootEl,
    source ? undefined : backdropRef,
    samplingPad,
  );
  const portable = sceneReady || Boolean(plane);
  const refractive = rendering==="auto" && !reduced && budgetActive && (portable || nativeRefraction);
  const fw = size.w + samplingPad * 2;
  const fh = size.h + samplingPad * 2;
  const map = textures?.displacement;
  const pullX = deformation?.x, pullY = deformation?.y;
  const active = refractive && Boolean(map);

  useEffect(() => {
    const element = rootEl.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    let frame = 0;
    const measure = (entry?:ResizeObserverEntry) => {
      const box=entry?.borderBoxSize?.[0];
      const css=getComputedStyle(element);
      const add=(keys:string[])=>keys.reduce((sum,key)=>sum+(parseFloat(css.getPropertyValue(key))||0),0);
      const contentBox=css.boxSizing!=="border-box";
      const w = box?.inlineSize ?? ((parseFloat(css.width)||element.clientWidth)+(contentBox?add(["padding-left","padding-right","border-left-width","border-right-width"]):0));
      const h = box?.blockSize ?? ((parseFloat(css.height)||element.clientHeight)+(contentBox?add(["padding-top","padding-bottom","border-top-width","border-bottom-width"]):0));
      setSize((previous) =>
        previous.w === w && previous.h === h ? previous : { w, h },
      );
      mirror.current?.updateGeometry();
    };
    const observer = new ResizeObserver((entries) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(()=>measure(entries.find(entry=>entry.target===element)));
    });
    observer.observe(element, { box: "border-box" });
    measure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const element = rootEl.current;
    const scene = source?.current;
    const host = mirrorHost.current;
    if (!element || !scene || !host || reduced || !budgetActive || rendering!=="auto") {
      setSceneReady(false);
      return;
    }
    const subscription = attachSceneMirror(scene, host, element, samplingPad, {
      frameRate: frameRate ?? context?.frameRate ?? settings.performance?.frameRate,
      onPaint: () => {manager.current?.refresh();if(adaptiveBackdrop)setBackdropKind(classifyGlassBackdrop(scene,element));},
    });
    mirror.current = subscription;
    setSceneReady(true);
    return () => {
      subscription.destroy();
      mirror.current = null;
    };
  }, [source, reduced, budgetActive, samplingPad, frameRate, context?.frameRate, settings.performance?.frameRate,adaptiveBackdrop,rendering]);

  useEffect(() => {
    if (!refractive || size.w < 2 || size.h < 2) return;
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      const next = buildLensTextures(fw, fh, {
        radius: Math.min(safeRadius, size.w / 2, size.h / 2),
        splay: p.splay,
        feather: p.feather,
        curve: p.curve,
        pad: samplingPad,
        optics: optical,
        shape,
        deformation: pullX === undefined && pullY === undefined ? undefined : {x: pullX ?? 0, y: pullY ?? 0},
      });
      void decodeLensTextures(next).then(() => {
        if (!cancelled) setTextures(next);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [
    refractive,
    size.w,
    size.h,
    fw,
    fh,
    safeRadius,
    samplingPad,
    optical,
    p.splay,
    p.feather,
    p.curve,
    shape,
    pullX,
    pullY,
  ]);

  const {blur:resolvedBlur,depth:resolvedDepth}=resolveBackdropTreatment(backdropKind,p,adaptiveBackdrop,preserveBlur);
  const colorFinish = `saturate(${p.saturate})${p.brightness !== 1 ? ` brightness(${p.brightness})` : ""}${p.contrast !== 1 ? ` contrast(${p.contrast})` : ""}`;
  const diffuse = `${resolvedBlur > 0 ? `blur(${resolvedBlur}px) ` : ""}${colorFinish}`;
  useLayoutEffect(() => {
    if (!housing.current || !layer.current) return;
    manager.current?.destroy();
    manager.current = null;
    if (!active || !map) return;
    const filter = new GlassFilterManager(
      housing.current,
      layer.current,
      portable ? "filter" : "backdropFilter",
    );
    manager.current = filter;
    filter.update({
      map,
      width: fw,
      height: fh,
      depth: settings.refraction === false ? 0 : resolvedDepth,
      chroma: settings.refraction === false ? 0 : p.chroma,
      blur: portable ? resolvedBlur : 0,
      reflection: portable ? textures?.reflection : undefined,
      rim: portable ? textures?.rim : undefined,
      rimScale: portable ? textures?.rimScale : undefined,
      colorBleed: optical.colorBleed,
      glint: Math.min(1,p.glint/100),
      postFilter: portable ? undefined : diffuse,
    });
    return () => {
      filter.destroy();
      if (manager.current === filter) manager.current = null;
    };
  }, [active, portable, map, fw, fh, resolvedDepth, resolvedBlur, p.chroma, p.glint, diffuse, settings.refraction, textures?.reflection, textures?.rim, textures?.rimScale, optical.colorBleed]);

  // React moves can change only the position, leaving size/maps unchanged.
  // Update the source offset and Safari's output on every geometry commit.
  useLayoutEffect(() => {
    mirror.current?.updateGeometry();
  });

  const setRoot = useCallback(
    (element: HTMLElement | null) => {
      rootEl.current = element;
      if (typeof ref === "function") {
        const cleanup = ref(element);
        if (typeof cleanup === "function")
          return () => {
            rootEl.current = null;
            cleanup();
          };
      } else if (ref)
        (ref as React.RefObject<HTMLElement | null>).current = element;
    },
    [ref],
  );
  const textureStyle: CSSProperties = {
    position: "absolute",
    inset: -samplingPad,
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    opacity: p.glint / 100,
  };
  const mode = rendering==="inherited" ? "inherited" : settings.refraction === false ? "disabled" : rendering === "composited" ? compositorReady?"scene-atlas":"css" : reduced
    ? "opaque"
    : active
      ? sceneReady
        ? "scene-svg"
        : plane
          ? "source-svg"
          : "backdrop-svg"
      : "css";
  return (
    <Tag
      {...rest}
      ref={setRoot}
      className={cn("relative isolate", className)}
      data-liquid-glass=""
      data-glass-shape={shape}
      data-glass-admission={budgetResolved ? budgetActive ? "active" : "fallback" : "pending"}
      data-glass-backdrop={backdropKind ?? "unclassified"}
      data-glass-blur-px={resolvedBlur}
      data-glass-depth-px={settings.refraction===false?0:resolvedDepth}
      data-glass-color-bleed={optical.colorBleed}
      data-glass-rendering={rendering === "composited" ? compositorReady?"composited":"lightweight" : rendering === "shared" || rendering==="inherited" ? "shared" : budgetActive ? "active" : "lightweight"}
      data-refraction={mode}
      style={{ borderRadius: safeRadius, ...style }}
    >
      {/* Each lens owns its housing. The manager retains at most two definitions. */}
      {rendering==="auto" && <svg
        ref={housing}
        aria-hidden="true"
        width={0}
        height={0}
        style={{ position: "absolute", pointerEvents: "none" }}
      />}
      {rendering!=="inherited" && <div
        aria-hidden="true"
        data-glass-clip=""
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          clipPath: lensClipPath(size.w,size.h,safeRadius,shape),
          isolation: "isolate",
        }}
      >
        {/* Keep color finish outside the SVG; blur runs before its colored rim. */}
        {rendering!=="composited" && <div
          data-glass-blur=""
          style={{
            position: "absolute",
            inset: -samplingPad,
            filter: portable && !reduced ? active ? colorFinish : diffuse : undefined,
          }}
        >
          <div
            ref={layer}
            data-lens-layer=""
            className="glass-optical-layer"
            style={{
              position: "absolute",
              inset: 0,
              backdropFilter:
                !portable && !active ? (reduced ? "none" : diffuse) : undefined,
              WebkitBackdropFilter:
                !portable && !active ? (reduced ? "none" : diffuse) : undefined,
            }}
          >
            {/* Clip the *source* before filtering so SourceGraphic is lens-sized,
              even if the bounded scene contains hundreds of DOM nodes. */}
            <div
              data-glass-source-window=""
              style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                contain: "paint",
                backgroundImage:
                  plane && !reduced
                    ? `url(${JSON.stringify(plane.src)})`
                    : undefined,
                backgroundSize: plane
                  ? `${plane.width}px ${plane.height}px`
                  : undefined,
                backgroundPosition: plane
                  ? `${plane.x}px ${plane.y}px`
                  : undefined,
                backgroundRepeat: "no-repeat",
              }}
            >
              <div
                ref={mirrorHost}
                data-glass-mirror-host=""
                inert
                style={{ position: "absolute", pointerEvents: "none" }}
              />
            </div>
          </div>
        </div>}
        <div
          data-glass-tint=""
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: reduced
              ? "var(--background, #f7f7f9)"
              : rgba(p.tintColor, p.tint),
            mixBlendMode: reduced ? "normal" : tintBlendMode,
          }}
        />
        {!reduced && readability && readability.opacity > 0 && (
          <div
            data-glass-readability=""
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: readability.color,
              opacity: readability.opacity,
            }}
          />
        )}
        {active && !reduced && textures?.reflection && (
          <div
            data-glass-reflection=""
            style={{
              ...textureStyle,
              backgroundImage: `url("${textures.reflection}")`,
              opacity: p.glint / 100 * (1 - optical.colorBleed * .85),
            }}
          />
        )}
        {active && !reduced && textures?.shade && (
          <div
            style={{
              ...textureStyle,
              backgroundImage: `url("${textures.shade}")`,
            }}
          />
        )}
      </div>}
      {rendering!=="inherited" && (showOutline ?? settings.showOutlines) && size.w>0 && size.h>0 && <svg data-glass-outline="" aria-hidden="true" viewBox={`0 0 ${size.w} ${size.h}`} style={{position:"absolute",inset:0,width:"100%",height:"100%",overflow:"visible",pointerEvents:"none"}}><path d={lensOutlinePath(size.w,size.h,safeRadius,shape)} fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="1" vectorEffect="non-scaling-stroke"/></svg>}
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
    </Tag>
  );
}

export function LiquidButton({
  children,
  preset = "clear",
  config,
  radius = 999,
  onClick,
  className = "",
}: {
  children: ReactNode;
  preset?: GlassPreset;
  config?: Partial<LensParams>;
  radius?: number;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-block cursor-pointer transition-transform duration-150 outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.97] ${className}`}
    >
      <LiquidGlass preset={preset} config={config} radius={radius}>
        <span className="block px-7 py-3 text-sm font-semibold tracking-wide text-white">
          {children}
        </span>
      </LiquidGlass>
    </button>
  );
}

export function LiquidContextMenu({
  items,
  preset = "regular",
  config,
  className = "",
}: {
  items: { label: string; action: () => void; danger?: boolean }[];
  preset?: GlassPreset;
  config?: Partial<LensParams>;
  className?: string;
}) {
  return (
    <LiquidGlass
      preset={preset}
      config={config}
      radius={20}
      className={`w-64 p-1.5 ${className}`}
    >
      <div className="flex flex-col gap-0.5">
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={item.action}
            className={`w-full rounded-xl px-3.5 py-2 text-left text-[13px] font-medium transition-colors duration-100 outline-none hover:bg-white/15 focus-visible:bg-white/10 active:bg-white/25 ${
              item.danger
                ? "text-red-300 hover:text-red-200"
                : "text-white/90 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </LiquidGlass>
  );
}
