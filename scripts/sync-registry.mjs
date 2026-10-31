/**
 * Regenerates registry.json from the real source tree.
 *
 * Run with: npm run registry:sync
 *
 * The manifest is derived from the files on disk, so registryDependencies can
 * never drift from the imports that actually exist. Commit the result.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ORIGIN = (process.env.REGISTRY_ORIGIN ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);
const url = (name) => `${ORIGIN}/r/${name}.json`;
const isInternalUrl = (dep) => dep.startsWith(`${ORIGIN}/r/`);

const cwd = process.cwd();
const read = (p) => readFileSync(join(cwd, p), "utf8");

const IMPORT_RE = /from\s+"([^"]+)"/g;

/** Bare module specifiers -> npm packages the consumer must install. */
const NPM = new Set([
  "class-variance-authority",
  "radix-ui",
  "cmdk",
  "lucide-react",
  "sonner",
  "vaul",
]);

/** `@/lib/utils` ships with `shadcn init`, so it is never a dependency. */
const IGNORED = new Set(["@/lib/utils"]);

/** Internal specifier -> the registry item that provides it. */
const INTERNAL = {
  "@/lib/glass": "glass-lens",
  "@/lib/glass-atlas": "glass-lens",
  "@/components/glass-atlas": "glass-lens",
  "@/lib/glass-scene": "glass-lens",
  "@/lib/glass-performance": "glass-lens",
  "@/lib/glass-filter": "glass-lens",
  "@/lib/glass-lens-optics": "glass-lens",
  "@/lib/glass-lens-shape": "glass-lens",
  "@/lib/glass-video": "glass-lens",
  "@/components/glass-scene": "glass-lens",
  "@/components/glass-backdrop": "glass-lens",
  "@/components/liquid-glass": "glass-lens",
  "@/lib/glass-theme": "glass-materials",
  "@/lib/contrast": "glass-adaptive-ink",
  "@/components/adaptive-contrast": "glass-adaptive-ink",
  "@/components/glass/glass-theme-provider": "glass-theme-provider",
  "@/components/glass/glass-surface": "glass-surface",
  "@/components/glass/glass-controls": "glass-surface",
  "@/components/glass/glass-selection": "glass-surface",
  "@/components/glass/index": "glass-components",
};

/**
 * Install target for a repo-relative path. The CLI resolves `@<alias>/…`
 * against the consumer's own `aliases` in components.json, so the installed
 * project mirrors this repo exactly and no import needs rewriting.
 */
const file = (path, type) => ({
  path,
  type,
  target: path.startsWith("lib/")
    ? `@lib/${path.slice("lib/".length)}`
    : `@components/${path.slice("components/".length)}`,
});

/** Reads a file's imports and splits them into internal / upstream / npm. */
function depsOf(path) {
  const src = read(path);
  const internal = new Set();
  const shadcn = new Set();
  const npm = new Set();

  for (const [, spec] of src.matchAll(IMPORT_RE)) {
    if (IGNORED.has(spec)) continue;

    if (spec.startsWith("@/components/ui/")) {
      // Bare names in registryDependencies always mean "official shadcn item",
      // resolved by the CLI against the consumer's own components.json style.
      shadcn.add(spec.replace("@/components/ui/", ""));
      continue;
    }

    if (spec.startsWith("@/")) {
      const owner =
        INTERNAL[spec] ??
        // Sibling glass components are already named `glass-*` in the registry.
        (spec.startsWith("@/components/glass/")
          ? spec.slice("@/components/glass/".length)
          : null);
      if (owner) internal.add(url(owner));
      continue;
    }

    if (NPM.has(spec)) npm.add(spec);
  }

  // CSS-level materials: every glass control is poured into one of these.
  if (
    /glass-(lens-action|chip|field|inset|accent|control-icon|action|outline|state-swap|tooltip-motion|bubble-motion|panel-backdrop|elastic-button|selection|atlas-finish|material|player-details|toast-host|video-player)/.test(
      src,
    )
  )
    internal.add(url("glass-utilities"));

  return { internal, shadcn, npm };
}

/** Rolls several files up into one item's dependency lists. */
function rollUp(paths) {
  const internal = new Set();
  const shadcn = new Set();
  const npm = new Set();
  for (const p of paths) {
    const d = depsOf(p);
    d.internal.forEach((x) => internal.add(x));
    d.shadcn.forEach((x) => shadcn.add(x));
    d.npm.forEach((x) => npm.add(x));
  }
  // Utilities are folded into whichever item needs them.
  internal.delete(url("glass-utilities"));
  return {
    registryDependencies: [...internal].sort(),
    shadcn: [...shadcn].sort(),
    npm: [...npm].sort(),
  };
}

/** Items that ship their own dependencies and therefore carry none. */
const SELF_CONTAINED = new Set(["glass-lens", "glass-adaptive-ink"]);

const TITLES = {
  "glass-sound": "Glass Sound",
  "glass-connectivity": "Glass Sharing",
  "glass-range-control": "Glass Range Control",
  "glass-preferences": "Glass Preferences",
  "glass-music-player": "Glass Music Player",
  "glass-video-player": "Glass Video Player",
  "glass-control-center": "Glass Control Center",
  "glass-spotlight": "Glass Spotlight",
  "glass-power": "Glass Power Controls",
  "glass-accordion": "Glass Accordion",
  "glass-button-group": "Glass Button Group",
  "glass-combobox": "Glass Combobox",
  "glass-form": "Glass Form",
  "glass-navbar": "Glass Navbar",
  "glass-sidebar": "Glass Sidebar",
  "glass-badge": "Glass Badge",
  "glass-button": "Glass Button",
  "glass-lens-button": "Glass Lens Button",
  "glass-elastic-button": "Elastic Glass Button",
  "glass-card": "Glass Card",
  "glass-panel": "Glass Panel",
  "glass-input": "Glass Input",
  "glass-switch": "Glass Switch",
  "glass-progress": "Glass Progress",
  "glass-slider": "Glass Slider",
  "glass-checkbox": "Glass Checkbox",
  "glass-toggle": "Glass Toggle",
  "glass-tabs": "Glass Tabs",
  "glass-dock": "Glass Dock",
  "glass-icons": "Glass Icons",
  "glass-alert": "Glass Alert",
  "glass-avatar": "Glass Avatar",
  "glass-dropdown": "Glass Dropdown Menu",
  "glass-context-menu": "Glass Context Menu",
  "glass-menubar": "Glass Menubar",
  "glass-select": "Glass Select",
  "glass-popover": "Glass Popover",
  "glass-tooltip": "Glass Tooltip",
  "glass-hover-card": "Glass Hover Card",
  "glass-dialog": "Glass Dialog",
  "glass-alert-dialog": "Glass Alert Dialog",
  "glass-sheet": "Glass Sheet",
  "glass-drawer": "Glass Drawer",
  "glass-command": "Glass Command",
  "glass-navigation-menu": "Glass Navigation Menu",
  "glass-toaster": "Glass Toaster",
};

const DESCRIPTIONS = {
  "glass-lens-button":
    "A native button with the shared cached control lens, sharp labels, and an optional aligned visual source.",
  "glass-image-lens":
    "The video-control optical shader over a bounded window of a displayed image, with event-driven rendering and no duplicate image DOM.",
  "glass-target-lens":
    "A cached moving SVG lens over original interactive DOM, with an optional explicit visual target for small controls. Position changes reuse the map; dormant lenses release their filter and budget slot.",
  "glass-preferences":
    "An editable preferences form composed from standard shadcn controls, with adaptive ink and an async save callback.",
  "glass-music-player":
    "An independent audio player with track navigation, seeking, and volume control.",
  "glass-video-player":
    "A native video player with shared WebGL glass controls, seeking, playback and skip actions.",
  "glass-control-center":
    "Connection toggles, brightness, sound, and focus in a controlled or uncontrolled panel.",
  "glass-spotlight":
    "A searchable command panel and optional dialog, with keyboard navigation.",
  "glass-power":
    "Independent sleep, restart, and shutdown controls with an accessible confirmation dialog.",
  "glass-accordion": "Expandable sections built on the shadcn accordion.",
  "glass-button-group":
    "A joined group of glass buttons, with horizontal and vertical layouts.",
  "glass-combobox":
    "A searchable, keyboard-accessible option picker with controlled and uncontrolled state.",
  "glass-form":
    "Form fields with connected labels, descriptions, and error messages.",
  "glass-navbar":
    "A refracting navigation surface for your brand, links, and actions.",
  "glass-sidebar":
    "A glass sidebar shell and navigation items with an active state.",
  "glass-button":
    "A shadcn button with scene refraction, crisp labels, and visible focus states.",
  "glass-badge": "Compact status pills in the same optical material.",
  "glass-card":
    "Card, header, title, action and footer sub-components on the shared clear lens.",
  "glass-panel":
    "A compact, source-refracting panel with a continuous optional beak and sharp foreground content.",
  "glass-input":
    "Input, textarea, and label with shared form semantics and focus states.",
  "glass-switch":
    "A native switch with a solid resting thumb and a transient, source-colored glass cap.",
  "glass-progress": "A determinate progress meter with an inset glass track.",
  "glass-slider": "Range input with a glass thumb and rail.",
  "glass-checkbox": "Checkbox and radio group rendered as glass chips.",
  "glass-toggle": "Toggle and toggle group with pressed-state glass.",
  "glass-tabs": "Tabs, tab list, trigger and content.",
  "glass-dock":
    "A glass dock with labelled controls, native links, and keyboard-accessible tooltips.",
  "glass-icons":
    "Original control glyphs on a consistent 24px grid. Label the parent button for accessibility.",
  "glass-alert": "Alert with a glass title and description.",
  "glass-avatar":
    "Avatar with a ringed glass portrait and a graceful fallback.",
  "glass-dropdown": "Dropdown menu with every sub-component on one material.",
  "glass-context-menu":
    "Context menu with every sub-component on one material.",
  "glass-menubar": "Menubar with every sub-component on one material.",
  "glass-select": "Select trigger, content and items on one material.",
  "glass-popover": "Popover with header, title and description.",
  "glass-tooltip": "Tooltip provider and content.",
  "glass-hover-card": "Hover card trigger and content.",
  "glass-dialog": "Dialog overlay, content, header and footer.",
  "glass-alert-dialog": "Alert dialog with the shared glass surface.",
  "glass-sheet": "Sheet with an edge-to-edge glass panel.",
  "glass-drawer": "Drawer with the shared refracting surface.",
  "glass-command": "Command palette, list, group, item and dialog.",
  "glass-navigation-menu": "Navigation menu with triggers, content and links.",
  "glass-toaster": "Sonner toaster styled with the glass materials.",
};

/**
 * The `.glass-*` materials, expressed as registry CSS so nothing in the
 * consumer's globals.css has to be edited by hand.
 */
const UTILITIES_CSS = {
  ":root": {
    "--glass-action": "#006de5",
    "--ease-out": "cubic-bezier(0.23, 1, 0.32, 1)",
    "--ease-in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
    "--ease-drawer": "cubic-bezier(0.32, 0.72, 0, 1)",
  },
  "@layer components": {
    ".glass-video-player": {
      position: "relative",
      isolation: "isolate",
      width: "100%",
      "aspect-ratio": "16 / 9",
      overflow: "hidden",
      "border-radius": "20px",
      background: "#171a12",
      color: "#fff",
    },
    ".glass-video-player > video, .glass-video-player > canvas": {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      "object-fit": "cover",
    },
    ".glass-video-player > canvas": { "pointer-events": "none", opacity: "0" },
    '.glass-video-player[data-optical="true"] > canvas': { opacity: "1" },
    ".glass-video-controls": {
      position: "absolute",
      inset: "0",
      display: "flex",
      "align-items": "center",
      "justify-content": "center",
      gap: "20px",
      "pointer-events": "none",
    },
    ".glass-video-player .glass-video-button": {
      width: "46px",
      height: "46px",
      "min-width": "46px",
      padding: "0",
      border: "0",
      "border-radius": "999px",
      color: "#fff !important",
      background: "rgb(0 0 0 / .2)",
      "box-shadow": "none",
      "pointer-events": "auto",
    },
    ".glass-video-player .glass-video-play": { width: "76px", height: "76px" },
    ".glass-video-player .glass-video-button:hover": {
      background: "rgb(255 255 255 / .06)",
    },
    ".glass-video-player .glass-video-button:focus-visible, .glass-video-seek:has(input:focus-visible)":
      { outline: "2px solid white", "outline-offset": "4px" },
    ".glass-video-player .glass-video-button svg": {
      width: "26px",
      height: "26px",
    },
    ".glass-video-player .glass-video-play svg": {
      width: "32px",
      height: "32px",
    },
    ".glass-video-seek": {
      position: "absolute",
      left: "18px",
      right: "18px",
      bottom: "18px",
      display: "flex",
      "align-items": "center",
      height: "26px",
      "padding-inline": "12px",
      "border-radius": "999px",
      background: "rgb(0 0 0 / .2)",
    },
    '.glass-video-player[data-optical="true"] :is(.glass-video-button,.glass-video-seek)':
      { background: "transparent !important" },
    ".glass-video-track": {
      width: "100%",
      height: "4px",
      overflow: "hidden",
      "border-radius": "999px",
      background: "rgb(255 255 255 / .35)",
    },
    ".glass-video-track > span": {
      display: "block",
      height: "100%",
      "border-radius": "inherit",
      background: "white",
    },
    ".glass-video-seek > input": {
      position: "absolute",
      "inset-inline": "0",
      top: "-9px",
      width: "100%",
      height: "44px",
      margin: "0",
      opacity: "0",
      cursor: "pointer",
    },
    ".glass-video-error": {
      position: "absolute",
      top: "12px",
      left: "12px",
      padding: "6px 10px",
      "border-radius": "8px",
      background: "rgb(0 0 0 / .6)",
      "font-size": "12px",
    },
    ".glass-chip": {
      border: "0",
      background: "color-mix(in oklab, var(--foreground) 5%, transparent)",
      "box-shadow": "none",
      "backdrop-filter": "blur(0.75px) saturate(1)",
      "-webkit-backdrop-filter": "blur(0.75px) saturate(1)",
    },
    ".glass-state-swap": {
      display: "inline-grid",
      "vertical-align": "middle",
    },
    ".glass-state-swap > [data-swap-layer]": {
      "grid-area": "1 / 1",
      display: "inline-flex",
      "align-items": "center",
      "justify-content": "center",
      gap: "0.5rem",
      transition:
        "opacity 180ms var(--ease-out), transform 180ms var(--ease-out), filter 180ms var(--ease-out)",
    },
    '.glass-state-swap > [data-swap-layer="to"], .glass-state-swap[data-active="true"] > [data-swap-layer="from"]':
      {
        opacity: "0",
        filter: "blur(2px)",
        transform: "translateY(8%) scale(.96)",
      },
    '.glass-state-swap > [data-swap-layer="from"], .glass-state-swap[data-active="true"] > [data-swap-layer="to"]':
      {
        opacity: "1",
        filter: "blur(0)",
        transform: "translateY(0) scale(1)",
      },
    '.glass-state-swap[data-animate="false"] > [data-swap-layer]': {
      transition: "none",
    },
    ".glass-control-icon": {
      display: "grid",
      "place-items": "center",
      "flex-shrink": "0",
      "border-radius": "999px",
      background: "color-mix(in oklab, var(--foreground) 10%, transparent)",
    },
    ".glass-accent": {
      color: "white",
      background: "var(--glass-action)",
      "border-color": "#ffffff24",
    },
    ".glass-accent:hover": {
      background: "color-mix(in oklab, var(--glass-action) 88%, white)",
    },
    ".glass-accent:active": {
      background: "color-mix(in oklab, var(--glass-action) 90%, black)",
    },
    ".glass-emphasis": {
      background: "color-mix(in oklab, var(--foreground) 13%, transparent)",
      "font-weight": "500",
    },
    ".glass-plain-action": {
      border: "0",
      background: "color-mix(in oklab,var(--foreground) 8%,transparent)",
      "background-image": "none",
      "box-shadow": "none",
      "backdrop-filter": "none",
      "-webkit-backdrop-filter": "none",
    },
    ".glass-field": {
      border:
        "1px solid color-mix(in oklab, var(--foreground) 10%, transparent)",
      background: "color-mix(in oklab, var(--foreground) 3%, transparent)",
      "box-shadow": "none",
      "backdrop-filter": "blur(0.75px) saturate(1)",
      "-webkit-backdrop-filter": "blur(0.75px) saturate(1)",
    },
    ".glass-field::placeholder": {
      opacity: "0.62",
    },
    ".glass-inline-action": {
      border: "0",
      background: "color-mix(in oklab,var(--foreground) 9%,transparent)",
      "backdrop-filter": "none",
      "-webkit-backdrop-filter": "none",
    },
    ".glass-inset": {
      background: "color-mix(in oklab, var(--foreground) 8%, transparent)",
    },
  },
  '[data-glass-button][data-input-modality="keyboard"], .glass-hold-button[data-input-modality="keyboard"]::before':
    {
      transition: "none",
    },
  '[data-glass-button][data-glass-compositor="atlas"]': {
    transform: "none !important",
    scale: "1 !important",
    "background-color": "transparent !important",
  },
  ".glass-hold-button::before": {
    content: '""',
    position: "absolute",
    inset: "0",
    "border-radius": "inherit",
    background: "color-mix(in oklab,var(--foreground) 12%,transparent)",
    opacity: "1",
    transition: "opacity 180ms var(--ease-out)",
    "pointer-events": "none",
    "z-index": "-1",
  },
  '.glass-hold-button[data-liquid-held="true"]::before': {
    opacity: "0",
  },
  '.glass-hold-button[data-liquid-held="true"]': {
    transform: "scale(1.045)",
  },
  ".glass-lens-action": {
    position: "relative", isolation: "isolate", display: "inline-grid", "flex-shrink": "0",
    "border-radius": "999px", transition: "scale 180ms var(--ease-out)",
  },
  ".glass-lens-action::before": {
    content: '\"\"', position: "absolute", inset: "0", "border-radius": "inherit",
    background: "color-mix(in srgb,currentColor 5%,transparent)", "pointer-events": "none",
  },
  ".glass-lens-action[data-has-source]::before": { background: "transparent", "backdrop-filter": "blur(1.5px)" },
  '.glass-lens-action:has([data-target-lens-ready="true"])::before': { opacity: "0" },
  ".glass-lens-action [data-glass-target-lens]": { transition: "opacity 140ms var(--ease-out)" },
  ".glass-lens-action > .glass-lens-action-label": {
    position: "relative", "z-index": "2", "border-radius": "inherit",
    background: "transparent", color: "inherit", cursor: "pointer",
  },
  ".glass-lens-action > .glass-lens-action-label:disabled": { opacity: "1" },
  ".glass-lens-action:has(button:active:not(:disabled))": { scale: ".97" },
  ".glass-lens-action[data-disabled]": { opacity: ".45", cursor: "not-allowed" },
  ".glass-lens-action-source": {
    position: "absolute", inset: "-128px", background: "var(--glass-lens-plane,var(--background))",
  },
  ".glass-lens-action-source::after": {
    content: '\"\"', position: "absolute", inset: "134px 136px", "border-radius": "999px",
    background: "color-mix(in srgb,var(--glass-action) 12%,var(--glass-lens-plane,var(--background)))",
  },
  ".glass-slider-thumb": {
    background: "var(--slider-thumb-fill,var(--foreground))",
  },
  '[data-appearance="lens"] .glass-slider-thumb': {
    "box-shadow": "0 2px 8px rgb(24 20 48 / .12)",
  },
  '[data-slot="slider"]:has([data-lens-visible="true"]) .glass-slider-thumb[data-lens-thumb="true"]':
    { opacity: "0" },
  '[data-slot="slider"][data-input-modality="keyboard"] .glass-slider-thumb:focus-visible': {
    outline: "2px solid var(--glass-action)", "outline-offset": "3px",
  },
  '[data-slot="slider"][data-input-modality="keyboard"]:has([data-lens-visible="true"]) > span:has(> [data-slot="slider-thumb"]:focus-visible)': {
    "z-index": "3", "border-radius": "999px",
    outline: "2px solid var(--glass-action)", "outline-offset": "3px",
  },
  ".glass-switch-thumb": { background: "#fff", scale: "1" },
  '.glass-switch[data-input-modality="keyboard"]:focus-visible': {
    outline: "2px solid var(--glass-action,var(--ring))",
    "outline-offset": "4px",
  },
  '.glass-menu-panel :is([role^="menuitem"],[role="option"])': {
    "min-height": "36px",
    padding: "8px 28px 8px 10px",
    "border-radius": "10px",
    "font-size": "13px",
    "line-height": "20px",
  },
  '.glass-menu-panel :is([role^="menuitem"],[role="option"])[data-highlighted]':
    {
      background: "color-mix(in oklab,var(--foreground) 7%,transparent)",
      color: "var(--foreground)",
    },
  '.glass-menu-panel [data-slot="dropdown-menu-label"]': {
    padding: "5px 10px 6px",
    "font-size": "11px",
  },
  ".glass-selection-source > [data-glass-target-root] > [data-lens-original]": {
    display: "flex",
    "align-items": "center",
    gap: "inherit",
    "flex-direction": "inherit",
  },
  ".glass-selection-source": { gap: "inherit", "flex-direction": "inherit" },
  ".glass-options-source": {
    position: "absolute", inset: "0", isolation: "isolate", display: "flex",
    "align-items": "center", gap: "calc(var(--gap,2) * .25rem)",
  },
  '.glass-options-source[data-orientation="vertical"]': {
    "flex-direction": "column", "align-items": "stretch",
  },
  ".glass-options-source::before": {
    content: '""', position: "absolute", inset: "-128px", "z-index": "-2",
    background: "var(--glass-lens-plane,var(--background))",
  },
  ".glass-options-source::after": {
    content: '""', position: "absolute", inset: "-1px -3px", "z-index": "-1",
    "border-radius": "999px",
    background: "var(--glass-selection-track,var(--muted))",
    border: "1px solid color-mix(in srgb,var(--foreground) 8%,transparent)",
  },
  ".glass-options-source .glass-options-source-item": { color: "var(--control-ink, var(--foreground))" },
  '.glass-options-source:not([data-orientation="vertical"]) .glass-options-source-item': { height: "calc(100% - 4px)" },
  '.glass-options-source[data-orientation="vertical"]::after': { inset: "-3px -1px" },
  ".glass-options-source .glass-options-source-item svg": { color: "var(--glass-option-color, var(--glass-action))", opacity: "1" },
  ".glass-options-source-item[data-disabled]": { opacity: ".4" },
  ".glass-selection-source > [data-glass-target-root]": {
    display: "flex",
    "align-items": "center",
    "min-width": "0",
    gap: "inherit",
    "flex-direction": "inherit",
  },
  '.glass-selection-source:has([data-lens-visible="true"]) > [data-selection-fallback]':
    { opacity: "0 !important" },
  "[data-liquid-selection] [data-state]": {
    border: "0",
    background: "transparent !important",
    "box-shadow": "none",
  },
  "[data-liquid-selection] [data-state]:hover": {
    background:
      "color-mix(in oklab,var(--foreground) 4%,transparent) !important",
  },
  '.glass-switch:has([data-lens-visible="true"]) .glass-switch-thumb': {
    opacity: "0",
  },
  ".glass-tooltip-motion": {
    "--tooltip-x": "0px",
    "--tooltip-y": "3px",
  },
  '.glass-tooltip-motion[data-side="bottom"]': {
    "--tooltip-y": "-3px",
  },
  '.glass-tooltip-motion[data-side="left"]': {
    "--tooltip-x": "3px",
    "--tooltip-y": "0px",
  },
  '.glass-tooltip-motion[data-side="right"]': {
    "--tooltip-x": "-3px",
    "--tooltip-y": "0px",
  },
  '.glass-tooltip-motion[data-state="delayed-open"], .glass-tooltip-motion[data-state="instant-open"]':
    {
      animation: "glass-tooltip-in 220ms var(--ease-out) both",
    },
  '.glass-tooltip-motion[data-state="closed"]': {
    animation: "glass-tooltip-out 140ms ease-out both",
  },
  ".glass-bubble-motion": { "--bubble-offset": "3px", "--bubble-scale": ".97" },
  '.glass-panel-backdrop[data-panel-source="backdrop"]': { "backdrop-filter": "blur(var(--panel-blur))", "-webkit-backdrop-filter": "blur(var(--panel-blur))" },
  '[data-glass-reveal]': { transition: "opacity 140ms var(--ease-out)" },
  '.glass-bubble-motion[data-side="bottom"]': { "--bubble-offset": "-3px" },
  '.glass-bubble-motion[data-state="open"]': { animation: "glass-bubble-in 240ms var(--ease-out) both" },
  '.glass-bubble-motion[data-state="closed"]': { animation: "glass-bubble-out 160ms ease-out both" },
  '.glass-dialog-motion[data-state="open"]': { animation: "glass-dialog-in 300ms var(--ease-out) both" },
  '.glass-dialog-motion[data-state="closed"]': { animation: "glass-dialog-out 180ms ease-out both" },
  "@keyframes glass-dialog-in": {
    from: { opacity: "0", transform: "translateY(8px) scale(.98)" },
    to: { opacity: "1", transform: "translateY(0) scale(1)" },
  },
  "@keyframes glass-dialog-out": {
    from: { opacity: "1", transform: "translateY(0) scale(1)" },
    to: { opacity: "0", transform: "translateY(4px) scale(.99)" },
  },
  "@keyframes glass-bubble-in": {
    from: { opacity: "0", transform: "translateY(var(--bubble-offset)) scale(var(--bubble-scale))" },
    to: { opacity: "1", transform: "translateY(0) scale(1)" },
  },
  "@keyframes glass-bubble-out": {
    from: { opacity: "1" },
    to: { opacity: "0", transform: "translateY(calc(var(--bubble-offset) / 2)) scale(var(--bubble-scale))" },
  },
  "@keyframes glass-tooltip-in": {
    from: {
      opacity: "0",
      transform: "translate(var(--tooltip-x),var(--tooltip-y)) scale(.98)",
    },
    to: {
      opacity: "1",
      transform: "translate(0,0) scale(1)",
    },
  },
  "@keyframes glass-tooltip-out": {
    from: {
      opacity: "1",
    },
    to: {
      opacity: "0",
      transform:
        "translate(calc(var(--tooltip-x) / 2),calc(var(--tooltip-y) / 2)) scale(.99)",
    },
  },
  ".glass-player-details": {
    animation: "glass-player-reveal 180ms var(--ease-out) both",
  },
  "@keyframes glass-player-reveal": {
    from: {
      opacity: "0",
      transform: "translateY(3px)",
    },
    to: {
      opacity: "1",
      transform: "translateY(0)",
    },
  },
  ".glass-toast-host": {
    background: "transparent !important",
    border: "0 !important",
    padding: "0 !important",
    "backdrop-filter": "none !important",
    "-webkit-backdrop-filter": "none !important",
    "box-shadow": "none !important",
  },
  "@media (prefers-reduced-motion: reduce)": {
    '[data-glass-reveal]': { transition: "none" },
    ".glass-dialog-motion": { "animation-duration": "100ms !important", transform: "none !important" },
    ".glass-bubble-motion": { "--bubble-offset": "0px", "--bubble-scale": "1", "animation-duration": "100ms !important" },
    ".glass-lens-action": { scale: "1 !important", transition: "none" },
    ".glass-lens-action [data-glass-target-lens]": { transition: "none" },
    ".glass-slider-thumb::before": {
      transition: "none",
    },
    '.glass-hold-button[data-liquid-held="true"], [data-liquid-pressed="true"] .glass-slider-thumb':
      {
        transform: "none",
      },
    ".glass-state-swap > [data-swap-layer]": {
      transform: "none !important",
      filter: "none !important",
      transition: "opacity 100ms ease",
      "transition-duration": "100ms !important",
    },
    '.glass-state-swap[data-animate="false"] > [data-swap-layer]': {
      transition: "none",
      "transition-duration": "0s !important",
    },
    ".glass-switch-thumb::before, .glass-switch-thumb::after, .glass-atlas-finish":
      {
        transition: "none",
      },
    ".glass-elastic-button": {
      transform: "none !important",
      transition: "none",
    },
    ".glass-switch-thumb": {
      scale: "1 !important",
    },
    ".glass-tooltip-motion": {
      "--tooltip-x": "0px !important",
      "--tooltip-y": "0px !important",
      "animation-duration": "80ms !important",
      transform: "none !important",
    },
    ".glass-player-details": {
      animation: "none",
    },
  },
  "@media (max-width: 479px)": {
    ".glass-video-player": { "aspect-ratio": "4 / 3" },
    ".glass-video-controls": { gap: "16px" },
  },
  "@media (prefers-reduced-transparency: reduce), (prefers-contrast: more)": {
    ".glass-lens-action::before, .glass-lens-action[data-has-source]::before": {
      background: "var(--glass-lens-plane,var(--background))", "backdrop-filter": "none",
    },
    '[data-liquid-pressed="true"] .glass-slider-thumb': {
      background: "var(--foreground)",
      "backdrop-filter": "none",
      "-webkit-backdrop-filter": "none",
    },
    '[data-liquid-pressed="true"] .glass-switch-thumb': {
      background: "white",
      "backdrop-filter": "none",
      "-webkit-backdrop-filter": "none",
    },
    ".glass-chip, .glass-field": {
      "backdrop-filter": "none",
      "-webkit-backdrop-filter": "none",
      background: "var(--background)",
      "border-color": "var(--foreground)",
    },
    ".glass-switch-thumb::before": {
      opacity: "1 !important",
    },
    ".glass-selection-source > [data-selection-fallback]": {
      background:
        "color-mix(in oklab,var(--foreground) 15%,var(--background)) !important",
      "backdrop-filter": "none",
      "-webkit-backdrop-filter": "none",
    },
  },
};

/* --------------------------------------------------------------------- build */

const glassFiles = readdirSync(join(cwd, "components/glass"))
  .filter((f) => f.endsWith(".tsx"))
  .sort();

const LENS = [
  file("lib/glass-atlas.ts", "registry:lib"),
  file("components/glass-atlas.tsx", "registry:ui"),
  file("lib/glass.ts", "registry:lib"),
  file("components/liquid-glass.tsx", "registry:ui"),
  file("lib/glass-scene.ts", "registry:lib"),
  file("lib/glass-performance.ts", "registry:lib"),
  file("lib/glass-filter.ts", "registry:lib"),
  file("lib/glass-lens-optics.ts", "registry:lib"),
  file("lib/glass-lens-shape.ts", "registry:lib"),
  file("lib/glass-video.ts", "registry:lib"),
  file("components/glass-scene.tsx", "registry:ui"),
  file("components/glass-backdrop.ts", "registry:ui"),
];
const INK = [
  file("lib/contrast.ts", "registry:lib"),
  file("components/adaptive-contrast.tsx", "registry:ui"),
];
const MATERIALS = [file("lib/glass-theme.ts", "registry:lib")];
const PROVIDER = [
  file("components/glass/glass-theme-provider.tsx", "registry:ui"),
];
const SURFACE = [
  file("components/glass/glass-surface.tsx", "registry:ui"),
  file("components/glass/glass-controls.tsx", "registry:ui"),
  file("components/glass/glass-selection.tsx", "registry:ui"),
];
const FAMILIES = glassFiles.filter(
  (f) =>
    !SURFACE.some((s) => s.path === `components/glass/${f}`) &&
    f !== "glass-theme-provider.tsx",
);

const items = [];

items.push({
  name: "glass-utilities",
  type: "registry:theme",
  title: "Glass Utilities",
  description:
    "The CSS-level materials (.glass-chip, .glass-field, .glass-inset) every glass control is poured into. Pulled in automatically by any glass item.",
  docs: `${ORIGIN}/docs/glass-utilities`,
  css: UTILITIES_CSS,
  files: [],
});

/** Builds an item, folding the utilities dep in only when it is needed. */
function makeItem({ name, type, title, description, files, extraDeps = [] }) {
  const roll = rollUp(files.map((f) => f.path));
  const needsUtilities = files.some((f) =>
    /glass-(lens-action|chip|field|inset|accent|control-icon|action|outline|state-swap|tooltip-motion|bubble-motion|panel-backdrop|elastic-button|selection|atlas-finish|material|player-details|toast-host|video-player)/.test(
      read(f.path),
    ),
  );
  const internal = SELF_CONTAINED.has(name) ? [] : roll.registryDependencies;

  return {
    name,
    type,
    title,
    description,
    docs: `${ORIGIN}/docs/${name}`,
    registryDependencies: [
      ...new Set([
        ...extraDeps,
        ...internal,
        ...roll.shadcn,
        ...(needsUtilities ? [url("glass-utilities")] : []),
      ]),
    ].sort(),
    ...(roll.npm.length ? { dependencies: roll.npm } : {}),
    files,
  };
}

items.push(
  makeItem({
    name: "glass-lens",
    type: "registry:ui",
    title: "Liquid Lens",
    description:
      "The optical engine and full DOM scene provider, with bounded capture, displacement maps, and live scene synchronization.",
    files: LENS,
  }),
  makeItem({
    name: "glass-adaptive-ink",
    type: "registry:ui",
    title: "Adaptive Ink",
    description:
      "Estimates contrast from accessible source pixels and CSS paints, then chooses light or dark ink.",
    files: INK,
  }),
  makeItem({
    name: "glass-materials",
    type: "registry:lib",
    title: "Glass Materials",
    description: "Optical presets and per-component light and dark defaults.",
    files: MATERIALS,
  }),
  makeItem({
    name: "glass-theme-provider",
    type: "registry:ui",
    title: "Glass Theme Provider",
    description:
      "Light/dark mode plus per-family material overrides, persisted to localStorage and applied before first paint.",
    files: PROVIDER,
  }),
  makeItem({
    name: "glass-surface",
    type: "registry:ui",
    title: "Glass Surface",
    description:
      "GlassSurface — the component every glass part is built on — plus the material controls.",
    files: SURFACE,
  }),
);

for (const f of FAMILIES) {
  const stem = f.replace(/\.tsx$/, "");
  items.push(
    makeItem({
      name: stem,
      type: "registry:ui",
      title: TITLES[stem] ?? stem,
      description:
        DESCRIPTIONS[stem] ??
        `The ${stem.replace("glass-", "")} component, styled for liquid glass.`,
      files: [file(`components/glass/${f}`, "registry:ui")],
    }),
  );
}

items.push(
  makeItem({
    name: "glass-components",
    type: "registry:ui",
    title: "Glass Components",
    description:
      'The whole family re-exported from one place: import { GlassButton, GlassDialog, … } from "@/components/glass".',
    files: [file("components/glass/index.ts", "registry:ui")],
  }),
);

// The headline item: every file, self-contained, one command, no config.
const allFiles = [
  ...LENS,
  ...INK,
  ...MATERIALS,
  ...PROVIDER,
  ...SURFACE,
  ...FAMILIES.map((f) => file(`components/glass/${f}`, "registry:ui")),
  file("components/glass/index.ts", "registry:ui"),
];
const allRoll = rollUp(allFiles.map((f) => f.path));

items.push({
  name: "liquid-glass",
  type: "registry:component",
  title: "Liquid Glass",
  description:
    "The optical engine, full DOM scene provider, adaptive ink, and every glass component.",
  docs: `${ORIGIN}/docs/liquid-glass`,
  css: UTILITIES_CSS,
  registryDependencies: allRoll.shadcn,
  ...(allRoll.npm.length ? { dependencies: allRoll.npm } : {}),
  files: allFiles,
});

// Every internal URL in the manifest must point at an item that exists, and no
// item may depend on itself.
const known = new Set(items.map((i) => `${ORIGIN}/r/${i.name}.json`));
for (const item of items) {
  for (const dep of item.registryDependencies ?? []) {
    if (!isInternalUrl(dep)) continue;
    if (dep === url(item.name)) {
      throw new Error(`${item.name} depends on itself`);
    }
    if (!known.has(dep)) {
      throw new Error(
        `${item.name} depends on ${dep}, which is not an item in this registry`,
      );
    }
  }
}

items.sort((a, b) => a.name.localeCompare(b.name));

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "liquid-glass",
  homepage: ORIGIN,
  items,
};

writeFileSync(
  join(cwd, "registry.json"),
  `${JSON.stringify(registry, null, 2)}\n`,
);

console.log(
  `registry.json written — ${items.length} items, ` +
    `${allFiles.length} files in liquid-glass`,
);
