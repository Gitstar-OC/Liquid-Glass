"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { GlassKind, GlassMode, GlassSurface } from "@/lib/glass-theme";

export type GlassModeSetting = GlassMode | "system";

const DEFAULT_MODE: GlassModeSetting = "light";
const MODE_KEY = "liquid-glass-mode";
const SURFACES_KEY = "liquid-glass-surfaces";

type SurfaceOverrides = Partial<Record<GlassKind, GlassSurface>>;

/* ------------------------------------------------------------------ store */

interface GlassStoreState {
  mode: GlassModeSetting;
  surfaces: SurfaceOverrides;
}

const serverState: GlassStoreState = { mode: DEFAULT_MODE, surfaces: {} };

function readInitialState(): GlassStoreState {
  if (typeof window === "undefined") return serverState;
  let mode: GlassModeSetting = DEFAULT_MODE;
  try {
    const v = localStorage.getItem(MODE_KEY);
    if (v === "light" || v === "dark" || v === "system") mode = v;
  } catch {}
  let surfaces: SurfaceOverrides = {};
  try {
    const raw = localStorage.getItem(SURFACES_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        surfaces = parsed as SurfaceOverrides;
      }
    }
  } catch {}
  return { mode, surfaces };
}

let clientState: GlassStoreState | null = null;
const listeners = new Set<() => void>();

function getState(): GlassStoreState {
  if (clientState === null) clientState = readInitialState();
  return clientState;
}

function setState(next: Partial<GlassStoreState>) {
  const merged = { ...getState(), ...next };
  clientState = merged;
  try {
    localStorage.setItem(MODE_KEY, merged.mode);
    localStorage.setItem(SURFACES_KEY, JSON.stringify(merged.surfaces));
  } catch {}
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* --------------------------------------------------------- media queries */

function subscribePrefersLight(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: light)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function prefersLight(): boolean {
  return window.matchMedia("(prefers-color-scheme: light)").matches;
}

/* --------------------------------------------------------------- context */

interface GlassThemeContextValue {
  mode: GlassModeSetting;
  resolvedMode: GlassMode;
  setMode: (mode: GlassModeSetting) => void;
  surfaces: SurfaceOverrides;
  surfaceFor: (kind: GlassKind) => GlassSurface | undefined;
  setSurface: (kind: GlassKind, surface: GlassSurface | null) => void;
  resetSurfaces: () => void;
}

const GlassThemeContext = createContext<GlassThemeContextValue | null>(null);

export function GlassThemeProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(
    subscribe,
    () => getState().mode,
    () => serverState.mode,
  );
  const surfaces = useSyncExternalStore(
    subscribe,
    () => getState().surfaces,
    () => serverState.surfaces,
  );
  const systemLight = useSyncExternalStore(
    subscribePrefersLight,
    prefersLight,
    () => false,
  );

  const resolvedMode: GlassMode =
    mode === "system" ? (systemLight ? "light" : "dark") : mode;

  // Sync the external system (documentElement) — no React state writes here.
  useEffect(() => {
    const dark = resolvedMode === "dark";
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, [resolvedMode]);

  const value = useMemo<GlassThemeContextValue>(
    () => ({
      mode,
      resolvedMode,
      setMode: (m) => setState({ mode: m }),
      surfaces,
      surfaceFor: (kind) => surfaces[kind],
      setSurface: (kind, surface) =>
        setState({
          surfaces: (() => {
            const next = { ...surfaces };
            if (surface === null) delete next[kind];
            else next[kind] = surface;
            return next;
          })(),
        }),
      resetSurfaces: () => setState({ surfaces: {} }),
    }),
    [mode, resolvedMode, surfaces],
  );

  return (
    <GlassThemeContext.Provider value={value}>
      {children}
    </GlassThemeContext.Provider>
  );
}

export function useGlassTheme(): GlassThemeContextValue {
  const ctx = useContext(GlassThemeContext);
  if (!ctx) {
    throw new Error("useGlassTheme must be used inside <GlassThemeProvider>.");
  }
  return ctx;
}
