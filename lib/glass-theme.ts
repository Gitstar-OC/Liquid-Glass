import { GLASS_PRESETS, type GlassPreset, type LensParams } from "@/lib/glass";

export type GlassMode = "light" | "dark";

export type GlassSurface = GlassPreset;

export const GLASS_SURFACES: readonly GlassSurface[] = [
  "transparent",
  "clear",
  "regular",
  "frosted",
  "thick",
];

export const SURFACE_LABELS: Record<GlassSurface, string> = {
  transparent: "Transparent",
  clear: "Clear",
  regular: "Regular",
  frosted: "Frosted",
  thick: "Thick",
};

/**
 * Dark-mode adjustments per surface. Dark glass reads best with a deep
 * neutral tint (instead of white), a touch less saturation/brightness and
 * softer glints.
 */
export const DARK_OVERRIDES: Record<GlassSurface, Partial<LensParams>> = {
  transparent: {
    tintColor: "#0b0c10",
    tint: 0.04,
    brightness: 1,
    glint: 40,
  },
  clear: {
    tintColor: "#101218",
    tint: 0.03,
  },
  regular: {
    tintColor: "#0f1116",
    tint: 0.22,
    saturate: 1.45,
    brightness: 0.99,
    glint: 50,
  },
  frosted: {
    tintColor: "#0e1015",
    tint: 0.3,
    saturate: 1.35,
    brightness: 0.97,
    glint: 40,
  },
  thick: {
    tintColor: "#0d0f14",
    tint: 0.42,
    saturate: 1.15,
    brightness: 0.94,
    glint: 30,
  },
};

/** Every component family that can sit on liquid glass. */
export type GlassKind =
  | "navbar"
  | "card"
  | "dialog"
  | "alert-dialog"
  | "sheet"
  | "drawer"
  | "popover"
  | "tooltip"
  | "hover-card"
  | "dropdown"
  | "context-menu"
  | "menubar"
  | "command"
  | "select"
  | "tabs"
  | "toast";

export const GLASS_KINDS: readonly GlassKind[] = [
  "navbar",
  "card",
  "dialog",
  "alert-dialog",
  "sheet",
  "drawer",
  "popover",
  "tooltip",
  "hover-card",
  "dropdown",
  "context-menu",
  "menubar",
  "command",
  "select",
  "tabs",
  "toast",
];

export const KIND_LABELS: Record<GlassKind, string> = {
  navbar: "Navbar",
  card: "Card",
  dialog: "Dialog",
  "alert-dialog": "Alert dialog",
  sheet: "Sheet",
  drawer: "Drawer",
  popover: "Popover",
  tooltip: "Tooltip",
  "hover-card": "Hover card",
  dropdown: "Dropdown menu",
  "context-menu": "Context menu",
  menubar: "Menubar",
  command: "Command",
  select: "Select",
  tabs: "Tabs",
  toast: "Toast",
};

/** All families start with the same clear optics as the playground. */
export const KIND_SURFACE: Record<GlassKind, GlassSurface> = {
  navbar: "clear",
  card: "clear",
  dialog: "clear",
  "alert-dialog": "clear",
  sheet: "clear",
  drawer: "clear",
  popover: "clear",
  tooltip: "clear",
  "hover-card": "clear",
  dropdown: "clear",
  "context-menu": "clear",
  menubar: "clear",
  command: "clear",
  select: "clear",
  tabs: "clear",
  toast: "clear",
};

/**
 * Default lens radius per component family — one shared scale so every
 * component reads as the same design language:
 *   12 (controls) · 20 (panels and notifications)
 */
export const KIND_RADIUS: Record<GlassKind, number> = {
  navbar: 20,
  card: 26,
  dialog: 28,
  "alert-dialog": 28,
  sheet: 20,
  drawer: 28,
  popover: 22,
  tooltip: 12,
  "hover-card": 20,
  dropdown: 20,
  "context-menu": 20,
  menubar: 12,
  command: 28,
  select: 12,
  tabs: 12,
  toast: 20,
};

export interface ResolvedGlassStyle {
  params: LensParams;
  radius: number;
}

export function resolveLensParams(
  surface: GlassSurface,
  mode?: GlassMode,
): LensParams {
  const base = GLASS_PRESETS[surface];
  if (mode !== "dark") return base;
  return { ...base, ...DARK_OVERRIDES[surface] };
}

export interface ResolveGlassOptions {
  kind: GlassKind;
  /** Explicit surface beats any context-level override or kind default. */
  surface?: GlassSurface;
  mode?: GlassMode;
  config?: Partial<LensParams>;
  radius?: number;
}

/**
 * Single source of truth for how a glass component looks:
 * kind default -> explicit override -> dark/light adaptation -> config tweak.
 */
export function resolveGlassStyle(
  opts: ResolveGlassOptions,
): ResolvedGlassStyle {
  const surface =
    opts.surface ?? KIND_SURFACE[opts.kind] ?? ("clear" as GlassSurface);
  return {
    params: { ...resolveLensParams(surface, opts.mode), ...opts.config },
    radius: opts.radius ?? KIND_RADIUS[opts.kind],
  };
}
