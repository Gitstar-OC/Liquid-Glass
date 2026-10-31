"use client";

import * as React from "react";
import { useAtlasMember } from "@/components/glass-atlas";
import { LiquidGlass } from "@/components/liquid-glass";
import {
  resolveGlassStyle,
  type GlassKind,
  type GlassMode,
  type GlassSurface,
} from "@/lib/glass-theme";
import { useGlassTheme } from "@/components/glass/glass-theme-provider";
import { cn } from "@/lib/utils";
import { useAdaptiveContrast } from "@/components/adaptive-contrast";
import { sampleFromLuminance } from "@/lib/contrast";
import { useGlassScene, useGlassSettings } from "@/components/glass-scene";

const GlassSurfaceContext = React.createContext<{ lightInk: boolean } | null>(
  null,
);
export function useWithinGlassSurface() {
  return Boolean(React.useContext(GlassSurfaceContext));
}
/** Foreground context for custom low-level LiquidGlass compositions. Adds no DOM or optics. */
export function GlassContent({
  ink,
  children,
}: {
  ink: "light" | "dark";
  children: React.ReactNode;
}) {
  return (
    <GlassSurfaceContext.Provider value={{ lightInk: ink === "light" }}>
      {children}
    </GlassSurfaceContext.Provider>
  );
}

export interface GlassSurfaceProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  kind?: GlassKind;
  /** Automatic background sampling, or an explicit text color. */
  ink?: "auto" | "light" | "dark";
  /** Add only the neutral overlay needed by the sampled background. */
  contrastProtection?: boolean;
  /** Compose onto one shadcn/Radix component that forwards props and ref. */
  asChild?: boolean;
  surface?: GlassSurface;
  mode?: GlassMode;
  radius?: number;
  shape?: import("@/lib/glass").GlassShape;
  /** Classify a bounded scene on paints; explicit local blur remains authoritative. */
  adaptiveBackdrop?: boolean;
  config?: Partial<import("@/lib/glass").LensParams>;
  deformation?: { x: number; y: number };
  sceneRef?: React.RefObject<HTMLElement | null>;
  frameRate?: number;
  /** Share optics or admit this surface to the document budget. */
  rendering?: "auto" | "shared";
  /** Disable atlas batching when the surface needs its own transform. */
  composite?: boolean;
  /** Higher values are admitted first; overlays use 10. The device cap still applies. */
  priority?: number;
  tintBlendMode?: React.CSSProperties["mixBlendMode"];
  as?: "div" | "section" | "aside" | "nav" | "header" | "footer" | "article";
  /** @deprecated Surfaces use optical edges without elevation. */
  shadow?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
}

/**
 * The one component every glass UI part is built on. Resolves the material
 * for a component family (kind), honoring explicit overrides, the global
 * per-kind override map and the active light/dark mode.
 *
 * Children render directly into the glass root — layout classes (flex,
 * grid, p-*, gap-*) behave exactly like they would on a plain div.
 */
export function GlassSurface({
  kind = "card",
  ink: requestedInk,
  contrastProtection: requestedProtection,
  asChild = false,
  sceneRef,
  rendering = "auto",
  composite = true,
  priority,
  tintBlendMode,
  surface,
  mode,
  radius,
  shape: requestedShape,
  adaptiveBackdrop = true,
  config,
  deformation,
  as,
  shadow = false,
  className = "",
  children,
  ref,
  style: rootStyle,
  ...rest
}: GlassSurfaceProps) {
  const inheritedSurface = React.useContext(GlassSurfaceContext);
  // React context crosses portals; an overlay still needs its own optical layer.
  const overlay =
    /dialog|popover|tooltip|select|drawer|sheet|command|dropdown|context-menu|hover-card|toast/.test(
      kind,
    );
  const parentSurface = overlay ? null : inheritedSurface;
  const theme = useGlassTheme();
  const scene = useGlassScene();
  const settings = useGlassSettings();
  const ink = requestedInk ?? settings.ink ?? "auto";
  const contrastProtection =
    requestedProtection ?? settings.contrastProtection ?? true;
  const effectiveMode = mode ?? scene?.appearance ?? theme.resolvedMode;
  const effectiveSurface =
    surface ?? settings.surface ?? theme.surfaceFor(kind);
  const style = resolveGlassStyle({
    kind,
    surface: effectiveSurface,
    mode: effectiveMode,
    config: { ...settings.config, ...scene?.config, ...config },
    radius: radius ?? settings.radius,
  });
  const shape = requestedShape ?? (style.radius >= 999 ? "round" : "squircle");
  // A higher layer softens the text and controls it captures underneath it.
  // A local override remains useful for deliberately clear overlays.
  if (overlay && config?.blur === undefined) {
    style.params.blur = Math.max(
      style.params.blur,
      kind === "tooltip" ? 4 : /dialog|drawer|sheet|command/.test(kind) ? 8 : 6,
    );
  }
  const blend =
    tintBlendMode ?? (effectiveMode === "light" ? "normal" : "multiply");
  const localRef = React.useRef<HTMLElement | null>(null);
  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") return ref(node);
      if (ref) ref.current = node;
    },
    [ref],
  );
  const compatibleConfig =
    !config ||
    Object.keys(config).every((key) => key === "tint" || key === "tintColor");
  const atlas = useAtlasMember(
    localRef,
    style.radius,
    composite &&
      !parentSurface &&
      !overlay &&
      rendering === "auto" &&
      compatibleConfig &&
      !deformation &&
      !sceneRef &&
      (effectiveSurface === undefined || effectiveSurface === "clear"),
    shape,
  );
  const sample = useAdaptiveContrast(localRef, {
    enabled:
      (ink === "auto" || settings.themeBehavior === "duotheme") &&
      !parentSurface,
    tone:
      settings.themeBehavior === "duotheme" && ink !== "auto" ? ink : undefined,
    source: sceneRef ?? scene?.source,
    live: scene?.live ?? false,
    interval: 300,
    tintColor: style.params.tintColor,
    tintOpacity: style.params.tint,
    tintBlendMode: blend,
    brightness: style.params.brightness,
    saturate: style.params.saturate,
    contrast: style.params.contrast,
    fallback: sampleFromLuminance(effectiveMode === "dark" ? 0.02 : 0.9, 0),
  });
  const tone =
    ink === "auto"
      ? (parentSurface?.lightInk ?? sample.tone === "light")
      : ink === "light";
  const foreground = tone ? "#ffffff" : "#000000";
  const background = tone ? "#151719" : "#ffffff";
  const colors = {
    "--glass-action": "#006de5",
    "--background": background,
    "--foreground": foreground,
    "--card": "transparent",
    "--card-foreground": foreground,
    "--muted": tone ? "#ffffff18" : "#0000000a",
    "--muted-foreground": foreground,
    "--popover": background,
    "--popover-foreground": foreground,
    "--primary": foreground,
    "--primary-foreground": background,
    "--secondary": tone ? "#ffffff18" : "#0000000a",
    "--secondary-foreground": foreground,
    "--accent": tone ? "#ffffff20" : "#0000000e",
    "--accent-foreground": foreground,
    "--input": tone ? "#ffffff45" : "#00000030",
    "--border": tone ? "#ffffff30" : "#00000020",
    "--ring": foreground,
    "--destructive": tone ? "#ffb4b4" : "#a10820",
    "--sidebar": "transparent",
    "--sidebar-foreground": foreground,
    "--sidebar-primary": foreground,
    "--sidebar-primary-foreground": background,
    "--sidebar-accent": tone ? "#ffffff20" : "#0000000e",
    "--sidebar-accent-foreground": foreground,
    "--sidebar-border": tone ? "#ffffff30" : "#00000020",
    "--sidebar-ring": foreground,
    colorScheme: tone ? "only dark" : "only light",
  };
  const protection =
    (ink === "auto" || settings.themeBehavior === "duotheme") &&
    contrastProtection &&
    !parentSurface
      ? sample.samples || sample.inherited
        ? (sample.scrimOpacity ?? 0)
        : 0.12
      : 0;

  return (
    <GlassSurfaceContext.Provider value={{ lightInk: tone }}>
      <LiquidGlass
        preset={effectiveSurface ?? "clear"}
        config={style.params}
        deformation={deformation}
        radius={style.radius}
        shape={shape}
        adaptiveBackdrop={adaptiveBackdrop}
        preserveBlur={
          overlay ||
          config?.blur !== undefined ||
          settings.config?.blur !== undefined ||
          scene?.config?.blur !== undefined ||
          effectiveSurface !== "clear"
        }
        tintBlendMode={blend}
        as={as}
        asChild={asChild}
        sceneRef={sceneRef}
        requireSceneCoverage={overlay}
        ref={setRef}
        readability={{
          color: tone ? "#000000" : "#ffffff",
          opacity: protection,
        }}
        rendering={
          atlas ? "composited" : parentSurface ? "inherited" : rendering
        }
        compositorReady={atlas?.active}
        priority={priority ?? (overlay ? 10 : 0)}
        data-adaptive-tone={tone ? "light" : "dark"}
        data-adaptive-source={
          sample.inherited
            ? "inherited"
            : sample.samples
              ? "sampled"
              : "fallback"
        }
        data-glass-compositor={atlas ? "atlas" : undefined}
        data-glass-await-optics={overlay && Boolean(scene) ? "true" : undefined}
        data-glass-appearance={effectiveMode}
        data-glass-theme-behavior={settings.themeBehavior ?? "unitheme"}
        data-glass-shape={shape}
        data-glass={kind}
        data-glass-surface={effectiveSurface ?? "default"}
        data-glass-mode={tone ? "dark" : "light"}
        style={{ ...colors, ...rootStyle } as React.CSSProperties}
        className={cn(
          "text-foreground",
          !parentSurface && "glass-material",
          shadow && "shadow-none",
          className,
        )}
        {...rest}
      >
        {children}
      </LiquidGlass>
    </GlassSurfaceContext.Provider>
  );
}
