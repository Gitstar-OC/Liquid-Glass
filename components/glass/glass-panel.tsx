"use client";

import {
  useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore,
  type CSSProperties, type HTMLAttributes, type ReactNode, type Ref,
} from "react";
import { Slot } from "radix-ui";
import { useGlassScene, useGlassSettings } from "@/components/glass-scene";
import { GlassContent, useWithinGlassSurface } from "@/components/glass/glass-surface";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";
import { useGlassSupport } from "@/components/liquid-glass";
import { decodeLensTextures, type GlassShape } from "@/lib/glass";
import { CONTROL_LENS_PRESETS, buildControlLensTextures, controlLensMetrics, resolveControlLens, type ControlLensInput, type ControlLensTextures } from "@/lib/glass-lens-optics";
import type { GlassBeak } from "@/lib/glass-lens-shape";
import { GlassFilterManager } from "@/lib/glass-filter";
import { attachSceneMirror, type SceneMirror } from "@/lib/glass-scene";
import { registerGlassLens } from "@/lib/glass-performance";
import { cn } from "@/lib/utils";

type PanelKind = "tooltip" | "hover-card" | "popover" | "dropdown" | "drawer" | "dialog" | "card" | "button" | "dock";
export interface GlassPanelProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  kind?: PanelKind;
  radius?: number;
  shape?: GlassShape;
  /** A continuous, softly joined pointer. Its side follows Radix placement. */
  beak?: boolean;
  lensParameters?: ControlLensInput;
  ink?: "auto" | "light" | "dark";
  contrastProtection?: boolean;
  asChild?: boolean;
  ref?: Ref<HTMLElement>;
}
const PREFERENCE = "(prefers-reduced-transparency: reduce), (prefers-contrast: more)";
const subscribe = (listener: () => void) => {
  const media = matchMedia(PREFERENCE);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
};
const reduced = () => matchMedia(PREFERENCE).matches;
const server = () => false;
const BLUR: Record<PanelKind, number> = { tooltip: 0.35, "hover-card": 1, popover: 1.25, dropdown: 1.25, drawer: 2, dialog: 2.5, card: 0.7, button: 0.25, dock: 10 };
// A wide stationary dock needs a shallow lens, not a magnified control thumb.
const DOCK_LENS = { ...CONTROL_LENS_PRESETS.surface, blur: 10, scale: 0.018, depth: 9,
  curvature: 40, splay: 1, magnification: 1.025, rimStrength: 0.7, edgeHighlight: 0.32 };
const OPPOSITE = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;

/** The shared curved field over a bounded scene or the native backdrop where
 * supported. Foreground text stays sharp; no whole-page source is captured. */
export function GlassPanel({
  children, kind = "card", radius = 20, shape = "squircle", beak = false,
  lensParameters, ink = "auto", contrastProtection = true, asChild = false, ref, className, style, ...props
}: GlassPanelProps) {
  const root = useRef<HTMLElement | null>(null), housing = useRef<SVGSVGElement>(null);
  const layer = useRef<HTMLDivElement>(null), host = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const manager = useRef<GlassFilterManager | null>(null), mirror = useRef<SceneMirror | null>(null);
  const scene = useGlassScene(), settings = useGlassSettings();
  const { resolvedMode } = useGlassTheme();
  const inherited = useWithinGlassSurface() && (kind === "card" || kind === "button");
  const nativeBackdrop = useGlassSupport();
  const solid = useSyncExternalStore(subscribe, reduced, server);
  const [size, setSize] = useState({ width: 0, height: 0, covered: false, side: "bottom" as GlassBeak["side"], offset: 0.5 });
  const [admitted, setAdmitted] = useState(false), [ready, setReady] = useState(false);
  const [budgetResolved, setBudgetResolved] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [bundle, setBundle] = useState<{
    key: string; width: number; height: number; pad: number; parameters: string;
    textures: ControlLensTextures;
  } | null>(null);
  const resolvedInk = ink === "auto" ? settings.ink ?? "auto" : ink;
  const dark = resolvedInk === "auto" ? (scene?.appearance ?? resolvedMode) === "dark" : resolvedInk === "light";
  const parameterKey = JSON.stringify(resolveControlLens({
    ...(kind === "button" ? CONTROL_LENS_PRESETS.button : CONTROL_LENS_PRESETS.surface),
    blur: BLUR[kind], magnification: kind === "tooltip" ? 1.04 : kind === "drawer" || kind === "dialog" ? 1.06 : 1.12,
    rimStrength: 1, edgeHighlight: 0.46,
    ...(kind === "dock" ? DOCK_LENS : {}),
    ...lensParameters,
  }));
  const optical = JSON.parse(parameterKey) as ReturnType<typeof resolveControlLens>;
  const safeRadius = Number.isFinite(radius) ? Math.max(0, Math.min(radius,
    size.width ? size.width / 2 : Infinity, size.height ? size.height / 2 : Infinity)) : 20;
  const geometry = { shape, rimWidth: kind === "dock" ? 1.25 : 1.1, ...(beak ? { beak: { side: size.side, offset: size.offset } } : {}) };
  const metrics = controlLensMetrics(size.width, size.height, optical, geometry);
  const key = JSON.stringify([size.width, size.height, safeRadius, parameterKey, geometry]);
  // Radius edits keep the last complete contour + field + glint together until
  // the replacement decodes. Never stretch an old map into a different size.
  const textures = bundle && bundle.width === size.width && bundle.height === size.height &&
    bundle.parameters === parameterKey && bundle.pad === metrics.pad ? bundle.textures : null;
  const bounded = size.width >= 2 && size.height >= 2 && size.width <= 1024 && size.height <= 1024;
  const fullWidth = size.width + metrics.pad * 2, fullHeight = size.height + metrics.pad * 2;
  const source = scene?.source;
  const portable = Boolean(source && size.covered);
  const available = portable || nativeBackdrop;

  const setRoot = useCallback((node: HTMLElement | null) => {
    root.current = node;
    if (typeof ref === "function") return ref(node);
    if (ref) ref.current = node;
  }, [ref]);

  useLayoutEffect(() => {
    const node = root.current;
    if (!node || inherited) return;
    let frame = 0;
    const measure = (entry?: ResizeObserverEntry) => {
      const css = getComputedStyle(node), box = entry?.borderBoxSize?.[0];
      const width = box?.inlineSize ?? parseFloat(css.width), height = box?.blockSize ?? parseFloat(css.height);
      if (!width || !height) return;
      const a = node.getBoundingClientRect(), b = source?.current?.getBoundingClientRect();
      const placement = node.parentElement?.closest("[data-side]")?.getAttribute("data-side") as keyof typeof OPPOSITE | null;
      const side = OPPOSITE[placement ?? "top"] ?? "bottom";
      const arrow = node.parentElement?.querySelector("[data-glass-beak-anchor]")?.getBoundingClientRect();
      const vertical = side === "top" || side === "bottom";
      const offset = arrow ? Math.round(Math.max(0, Math.min(1, vertical
        ? (arrow.left + arrow.width / 2 - a.left) / Math.max(1, a.width)
        : (arrow.top + arrow.height / 2 - a.top) / Math.max(1, a.height))) * 256) / 256 : 0.5;
      const covered = Boolean(b && b.width <= 4096 && b.height <= 4096 && b.width * b.height <= 1_500_000 &&
        a.left >= b.left - 1 && a.right <= b.right + 1 && a.top >= b.top - 1 && a.bottom <= b.bottom + 1);
      setSize(old => old.width === width && old.height === height && old.covered === covered && old.side === side && old.offset === offset
        ? old : { width, height, covered, side, offset });
      mirror.current?.updateGeometry();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; measure(); });
    };
    const resize = new ResizeObserver(entries => measure(entries.find(entry => entry.target === node)));
    resize.observe(node);
    if (source?.current) resize.observe(source.current);
    const position = new MutationObserver(schedule);
    // Observe only the native positioning wrappers, never the optical subtree.
    for (let parent = node.parentElement, count = 0; parent && count < 2; parent = parent.parentElement, count++)
      position.observe(parent, { attributes: true, attributeFilter: ["style", "data-side"] });
    const arrow = node.parentElement?.querySelector("[data-glass-beak-anchor]")?.parentElement;
    if (arrow) position.observe(arrow, { attributes: true, attributeFilter: ["style"] });
    node.addEventListener("transitionend", schedule);
    node.addEventListener("animationend", schedule);
    window.addEventListener("resize", schedule);
    if (source?.current) window.addEventListener("scroll", schedule, true);
    measure();
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); position.disconnect();
      node.removeEventListener("transitionend", schedule); node.removeEventListener("animationend", schedule);
      window.removeEventListener("resize", schedule); window.removeEventListener("scroll", schedule, true);
    };
  }, [source, inherited, beak]);

  useEffect(() => {
    if (inherited || solid || !available || !bounded || !root.current) return;
    const release = registerGlassLens(root.current, value => { setAdmitted(value); setBudgetResolved(true); }, {
      priority: kind === "card" ? 0 : kind === "button" || kind === "dock" ? 5 : 10, limit: settings.performance?.maxActiveSurfaces,
    });
    return () => { release(); setAdmitted(false); setBudgetResolved(false); };
  }, [inherited, solid, available, bounded, kind, settings.performance?.maxActiveSurfaces]);

  useEffect(() => {
    if (inherited || !bounded) return;
    let cancelled = false;
    setMapFailed(false);
    const frame = requestAnimationFrame(() => {
      const next = buildControlLensTextures(size.width, size.height, safeRadius, JSON.parse(parameterKey), geometry);
      if (!next.displacement || !next.coverage) { setMapFailed(true); return; }
      void decodeLensTextures(next).then(() => {
        if (!cancelled) setBundle({ key, width: size.width, height: size.height, pad: metrics.pad, parameters: parameterKey, textures: next });
      }).catch(() => { if (!cancelled) setMapFailed(true); });
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
    // The serialized key includes every optical and contour input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, bounded, inherited]);

  useLayoutEffect(() => {
    const node = root.current, sceneNode = source?.current;
    const output = portable ? layer.current : backdrop.current;
    if (inherited || solid || !admitted || !available || !textures || !node || !output || !housing.current || (portable && (!sceneNode || !host.current))) {
      setReady(false);
      return;
    }
    const filter = new GlassFilterManager(housing.current, output, portable ? "filter" : "backdropFilter");
    manager.current = filter;
    filter.update({
      map: textures.displacement, width: fullWidth, height: fullHeight,
      depth: settings.refraction === false ? 0 : metrics.displacementScale,
      chroma: 0, blur: optical.blur, opticalTransmission: settings.refraction !== false,
      rim: textures.rim, rimScale: 0, colorBleed: kind === "dock" ? 0.5 : 0.3, glint: 1,
      colorSaturation: 1, colorGain: 1, colorSpread: kind === "dock" ? 12 : 8,
    });
    if (!portable) {
      setReady(true);
      return () => { filter.destroy(); manager.current = null; setReady(false); };
    }
    const subscription = attachSceneMirror(sceneNode!, host.current!, node, metrics.pad, {
      frameRate: scene?.frameRate ?? settings.performance?.frameRate,
      onPaint: () => {
        filter.refresh();
        node.dataset.glassFilterPaints = String(filter.refreshes);
        setReady(true);
      },
    });
    mirror.current = subscription;
    return () => {
      subscription.destroy(); filter.destroy(); mirror.current = null; manager.current = null; setReady(false);
    };
  }, [inherited, solid, admitted, available, portable, source, textures, fullWidth, fullHeight, metrics.pad, metrics.displacementScale, optical.blur, kind, dark, settings.refraction, scene?.frameRate, settings.performance?.frameRate]);

  const active = ready && admitted && available && !solid;
  const Tag = asChild ? Slot.Root : "div";
  const mask: CSSProperties = textures ? {
    maskImage: `url("${textures.coverage}")`, maskSize: "100% 100%", maskRepeat: "no-repeat",
    WebkitMaskImage: `url("${textures.coverage}")`, WebkitMaskSize: "100% 100%", WebkitMaskRepeat: "no-repeat",
  } : { clipPath: `inset(${metrics.pad}px round ${safeRadius}px)` };
  return (
    <GlassContent ink={dark ? "light" : "dark"}>
      <Tag {...props} ref={setRoot} data-liquid-glass="" data-glass={kind}
        data-glass-rendering={active ? "active" : inherited ? "shared" : "lightweight"}
        data-refraction={active ? portable ? "scene-compact-svg" : "backdrop-compact-svg" : inherited ? "inherited" : "css"}
        data-glass-shape={shape}
        data-glass-blur-px={optical.blur}
        data-glass-beak={beak ? size.side : "none"}
        className={cn("relative isolate", className)}
        style={{ "--foreground": dark ? "#fff" : "#171719", "--background": dark ? "#111113" : "#fff",
          "--muted-foreground": dark ? "#b8b8bd" : "#626268",
          borderRadius: safeRadius, color: dark ? "#fff" : "#171719",
          opacity: kind === "tooltip" && !solid && !mapFailed &&
            (!textures || (available && (!budgetResolved || (admitted && !ready)))) ? 0 : undefined, ...style } as CSSProperties}>
        {!inherited && <>
          <svg ref={housing} aria-hidden="true" width="0" height="0" style={{ position: "absolute" }} />
          <div ref={backdrop} aria-hidden="true" data-glass-ignore="" className="glass-panel-backdrop"
            data-panel-source={active && portable ? "dom" : solid ? "solid" : "backdrop"}
            style={{ "--panel-blur": `${optical.blur}px`, position: "absolute", inset: -metrics.pad, zIndex: -1, pointerEvents: "none", ...mask,
            background: solid ? "var(--background)" : active ? kind === "dock"
              ? "color-mix(in srgb,var(--foreground) 3%,transparent)" : "transparent"
              : kind === "dock" || portable
                ? "color-mix(in srgb,var(--background) 14%,transparent)" : dark
              ? "color-mix(in srgb,color-mix(in srgb,var(--background) 86%,var(--foreground) 14%) 86%,transparent)"
              : "color-mix(in srgb,var(--background) 94%,transparent)" } as CSSProperties}>
            <div ref={layer} style={{ position: "absolute", inset: 0, opacity: active && portable ? 1 : 0 }}>
              <div style={{ position: "absolute", inset: 0, overflow: "hidden", contain: "paint" }}>
                <div ref={host} data-glass-mirror-host="" inert style={{ position: "absolute" }} />
              </div>
            </div>
            {active && dark && kind !== "dock" && contrastProtection && <div style={{ position: "absolute", inset: 0, background: "color-mix(in srgb,var(--foreground) 3%,transparent)" }} />}
            {textures && !solid && <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${textures.reflection}")`, backgroundSize: "100% 100%" }} />}
          </div>
        </>}
        {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
      </Tag>
    </GlassContent>
  );
}
