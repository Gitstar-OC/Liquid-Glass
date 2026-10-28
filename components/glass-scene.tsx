"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";
import type { LensParams, GlassOptics, GlassPreset } from "@/lib/glass";

export type GlassThemeBehavior = "unitheme" | "duotheme";

export interface GlassSettings {
  surface?: GlassPreset;
  /** Keeps finish and blur unchanged; switches only optical bending on/off. */
  refraction?: boolean;
  /** Diagnostic contour from the same geometry as the refracting mask. */
  showOutlines?: boolean;
  /** Unitheme adapts ink; duotheme keeps the supplied ink while material changes. */
  themeBehavior?: GlassThemeBehavior;
  config?: Partial<LensParams>;
  optics?: Partial<GlassOptics>;
  radius?: number;
  ink?: "auto" | "light" | "dark";
  contrastProtection?: boolean;
  performance?: { maxActiveSurfaces?: number; frameRate?: number };
}
const GlassSettingsContext = createContext<GlassSettings>({});
export function useGlassSettings() {
  return useContext(GlassSettingsContext);
}
/** Shared optical settings for components and portals, without another DOM layer. */
export function GlassSettingsProvider({
  children,
  surface,
  config,
  optics,
  radius,
  ink,
  contrastProtection,
  performance,
  themeBehavior,
  refraction,
  showOutlines,
}: GlassSettings & { children: ReactNode }) {
  const parent = useGlassSettings();
  const [initialInk] = useState<"light" | "dark">(ink === "light" ? "light" : "dark");
  const behavior = themeBehavior ?? parent.themeBehavior ?? "unitheme";
  const selectedInk = ink ?? parent.ink;
  const resolvedInk = behavior === "duotheme" && (!selectedInk || selectedInk === "auto") ? initialInk : selectedInk;
  const value = useMemo(
    () => ({
      surface: surface ?? parent.surface,
      config: { ...parent.config, ...config },
      optics: { ...parent.optics, ...optics },
      radius: radius ?? parent.radius,
      ink: resolvedInk,
      themeBehavior: behavior,
      contrastProtection: contrastProtection ?? parent.contrastProtection,
      performance: { ...parent.performance, ...performance },
      refraction: refraction ?? parent.refraction ?? true,
      showOutlines: showOutlines ?? parent.showOutlines ?? false,
    }),
    [parent, surface, config, optics, radius, resolvedInk, behavior, contrastProtection, performance, refraction, showOutlines],
  );
  return (
    <GlassSettingsContext.Provider value={value}>
      {children}
    </GlassSettingsContext.Provider>
  );
}

export interface GlassSceneContextValue {
  source: RefObject<HTMLDivElement | null>;
  config?: Partial<LensParams>;
  frameRate?: number;
  appearance?: "light" | "dark";
  live?: boolean;
}
const GlassSceneContext = createContext<GlassSceneContextValue | null>(null);
export function useGlassScene() {
  return useContext(GlassSceneContext);
}

export interface GlassSceneProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  /** The complete, interactive DOM backdrop. Lenses go in children. */
  content: ReactNode;
  sourceClassName?: string;
  /** Optional ref to the original scene, for contrast sampling or explicit invalidation. */
  sourceRef?: RefObject<HTMLDivElement | null>;
  config?: Partial<LensParams>;
  frameRate?: number;
  appearance?: "light" | "dark";
  /** Poll adaptive ink only for continuously animated or video sources. */
  live?: boolean;
}

/** One bounded source scene, shared by every descendant glass lens. */
export function GlassScene({
  content,
  children,
  sourceClassName,
  sourceRef,
  frameRate,
  config,
  appearance,
  live = false,
  style,
  ...props
}: GlassSceneProps) {
  const localSource = useRef<HTMLDivElement>(null);
  const source = sourceRef ?? localSource;
  const value = useMemo(
    () => ({ source, frameRate, config, appearance, live }),
    [source, frameRate, config, appearance, live],
  );
  return (
    <GlassSceneContext.Provider value={value}>
      <div
        {...props}
        data-glass-scene=""
        style={{ position: "relative", ...style }}
      >
        <div
          ref={source}
          data-glass-scene-source=""
          className={sourceClassName}
          style={{ position: "absolute", inset: 0 }}
        >
          {content}
        </div>
        {children}
      </div>
    </GlassSceneContext.Provider>
  );
}
