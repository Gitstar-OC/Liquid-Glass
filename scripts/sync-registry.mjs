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
  if (/glass-(chip|field|inset|accent|control-icon|action|outline|state-swap|tooltip-motion|elastic-button|selection|atlas-finish|material|player-details|toast-host)/.test(src))
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
  "glass-elastic-button": "Elastic Glass Button",
  "glass-card": "Glass Card",
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
  "glass-preferences":
    "An editable preferences form composed from standard shadcn controls, with adaptive ink and an async save callback.",
  "glass-music-player":
    "An independent audio player with track navigation, seeking, and volume control.",
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
  "glass-input":
    "Input, textarea, and label with shared form semantics and focus states.",
  "glass-switch": "A switch whose track is a tinted glass channel.",
  "glass-progress": "A determinate progress meter with an inset glass track.",
  "glass-slider": "Range input with a glass thumb and rail.",
  "glass-checkbox": "Checkbox and radio group rendered as glass chips.",
  "glass-toggle": "Toggle and toggle group with pressed-state glass.",
  "glass-tabs": "Tabs, tab list, trigger and content.",
  "glass-dock": "A glass dock with labelled controls, native links, and keyboard-accessible tooltips.",
  "glass-icons": "Original control glyphs on a consistent 24px grid. Label the parent button for accessibility.",
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
    "--ease-drawer": "cubic-bezier(0.32, 0.72, 0, 1)"
  },
  "@layer components": {
    ".glass-chip": {
      "border": "0",
      "background": "color-mix(in oklab, var(--foreground) 5%, transparent)",
      "box-shadow": "none",
      "backdrop-filter": "blur(0.75px) saturate(1)",
      "-webkit-backdrop-filter": "blur(0.75px) saturate(1)"
    },
    ".glass-state-swap": {
      "display": "inline-grid",
      "vertical-align": "middle"
    },
    ".glass-state-swap > [data-swap-layer]": {
      "grid-area": "1 / 1",
      "display": "inline-flex",
      "align-items": "center",
      "justify-content": "center",
      "gap": "0.5rem",
      "transition": "opacity 180ms var(--ease-out), transform 180ms var(--ease-out), filter 180ms var(--ease-out)"
    },
    ".glass-state-swap > [data-swap-layer=\"to\"], .glass-state-swap[data-active=\"true\"] > [data-swap-layer=\"from\"]": {
      "opacity": "0",
      "filter": "blur(2px)",
      "transform": "translateY(8%) scale(.96)"
    },
    ".glass-state-swap > [data-swap-layer=\"from\"], .glass-state-swap[data-active=\"true\"] > [data-swap-layer=\"to\"]": {
      "opacity": "1",
      "filter": "blur(0)",
      "transform": "translateY(0) scale(1)"
    },
    ".glass-state-swap[data-animate=\"false\"] > [data-swap-layer]": {
      "transition": "none"
    },
    ".glass-control-icon": {
      "display": "grid",
      "place-items": "center",
      "flex-shrink": "0",
      "border-radius": "999px",
      "background": "color-mix(in oklab, var(--foreground) 10%, transparent)"
    },
    ".glass-accent": {
      "color": "white",
      "background": "var(--glass-action)",
      "border-color": "#ffffff24"
    },
    ".glass-accent:hover": {
      "background": "color-mix(in oklab, var(--glass-action) 88%, white)"
    },
    ".glass-accent:active": {
      "background": "color-mix(in oklab, var(--glass-action) 90%, black)"
    },
    ".glass-emphasis": {
      "background": "color-mix(in oklab, var(--foreground) 13%, transparent)",
      "font-weight": "500"
    },
    ".glass-plain-action": {
      "border": "0",
      "background": "color-mix(in oklab,var(--foreground) 8%,transparent)",
      "background-image": "none",
      "box-shadow": "none",
      "backdrop-filter": "none",
      "-webkit-backdrop-filter": "none"
    },
    ".glass-field": {
      "border": "1px solid color-mix(in oklab, var(--foreground) 10%, transparent)",
      "background": "color-mix(in oklab, var(--foreground) 3%, transparent)",
      "box-shadow": "none",
      "backdrop-filter": "blur(0.75px) saturate(1)",
      "-webkit-backdrop-filter": "blur(0.75px) saturate(1)"
    },
    ".glass-field::placeholder": {
      "opacity": "0.62"
    },
    ".glass-inline-action": {
      "border": "0",
      "background": "color-mix(in oklab,var(--foreground) 9%,transparent)",
      "backdrop-filter": "none",
      "-webkit-backdrop-filter": "none"
    },
    ".glass-inset": {
      "background": "color-mix(in oklab, var(--foreground) 8%, transparent)"
    },
  },
  "[data-glass-button][data-input-modality=\"keyboard\"], .glass-hold-button[data-input-modality=\"keyboard\"]::before": {
    "transition": "none"
  },
  "[data-glass-button=\"core\"][data-glass-compositor=\"atlas\"]": {
    "transform": "none !important",
    "background-color": "transparent !important"
  },
  ".glass-hold-button::before": {
    "content": "\"\"",
    "position": "absolute",
    "inset": "0",
    "border-radius": "inherit",
    "background": "color-mix(in oklab,var(--foreground) 12%,transparent)",
    "opacity": "1",
    "transition": "opacity 180ms var(--ease-out)",
    "pointer-events": "none",
    "z-index": "-1"
  },
  ".glass-hold-button[data-liquid-held=\"true\"]::before": {
    "opacity": "0"
  },
  ".glass-hold-button[data-liquid-held=\"true\"]": {
    "transform": "scale(1.045)"
  },
  ".glass-slider-thumb": {
    "background": "linear-gradient(145deg,#ffffff90,#ffffff05 45%,#ffffff40)"
  },
  ".glass-slider-thumb::before": {
    "content": "\"\"",
    "position": "absolute",
    "inset": "0",
    "border-radius": "inherit",
    "background": "var(--slider-thumb-fill,var(--foreground))",
    "opacity": "1",
    "transition": "opacity 220ms var(--ease-out)"
  },
  "[data-liquid-pressed=\"true\"] .glass-slider-thumb": {
    "transform": "scale(1.14,1.14)",
    "backdrop-filter": "blur(.75px)",
    "-webkit-backdrop-filter": "blur(.75px)",
    "opacity": "1",
    "transition-duration": "260ms",
    "transition-delay": "60ms"
  },
  "[data-liquid-pressed=\"true\"] .glass-slider-thumb::before": {
    "opacity": "0",
    "transition-delay": "60ms"
  },
  "[data-slot=\"slider\"][data-input-modality=\"keyboard\"] .glass-slider-thumb, [data-slot=\"slider\"][data-input-modality=\"keyboard\"] .glass-slider-thumb::before": {
    "transition": "none"
  },
  ".glass-switch-thumb": {
    "background": "linear-gradient(150deg,#ffffffb3,#ffffff18 42%,#ffffff66)",
    "scale": "1"
  },
  ".glass-switch-thumb::before": {
    "content": "\"\"",
    "position": "absolute",
    "inset": "0",
    "border-radius": "inherit",
    "background": "#fff",
    "transition": "opacity 160ms var(--ease-out)"
  },
  "[data-liquid-pressed=\"true\"] .glass-switch-thumb": {
    "scale": "1.12 1.36"
  },
  "[data-liquid-pressed=\"true\"] .glass-switch-thumb::before": {
    "opacity": ".12"
  },
  ".glass-action-group[data-slot=\"button-group\"] > [data-glass-button]": {
    "border-radius": "999px !important"
  },
  "[data-slot=\"switch\"][data-input-modality=\"keyboard\"] .glass-switch-thumb::before": {
    "transition": "none"
  },
  ".glass-selection-indicator": {
    "pointer-events": "none",
    "position": "absolute",
    "left": "0",
    "top": "0",
    "width": "var(--selection-w,0px)",
    "height": "var(--selection-h,0px)",
    "opacity": "var(--selection-opacity,0)",
    "border-radius": "var(--selection-radius,999px)",
    "transform": "translate(var(--selection-x,0px),var(--selection-y,0px))",
    "background": "color-mix(in oklab,var(--foreground) 6%,transparent)",
    "transition": "transform 300ms var(--ease-out), width 300ms var(--ease-out), height 300ms var(--ease-out), background-color 200ms var(--ease-out)"
  },
  "[data-liquid-selection][data-liquid-moving=\"true\"] > .glass-selection-indicator": {
    "background": "transparent"
  },
  "[data-liquid-selection] > [data-state]": {
    "border": "0",
    "background": "transparent !important",
    "box-shadow": "none"
  },
  "[data-liquid-selection] > [data-state]:hover": {
    "background": "transparent !important"
  },
  "[data-liquid-selection][data-input-modality=\"keyboard\"] > .glass-selection-indicator": {
    "transition": "none"
  },
  ".glass-elastic-button": {
    "transition": "transform 320ms var(--ease-out), background-color 150ms var(--ease-out)"
  },
  ".glass-elastic-button[data-elastic-held=\"true\"]": {
    "transition-duration": "80ms"
  },
  ".glass-elastic-button:hover": {
    "background-color": "color-mix(in oklab,var(--foreground) 4%,transparent)"
  },
  "[data-glass-await-optics=\"true\"]": {
    "transition": "opacity 120ms var(--ease-out)"
  },
  "[data-glass-await-optics=\"true\"][data-refraction=\"css\"][data-glass-rendering=\"active\"]": {
    "opacity": "0"
  },
  "[data-glass-await-optics=\"true\"][data-glass-admission=\"pending\"]": {
    "opacity": "0"
  },
  ".glass-atlas-finish": {
    "transition": "filter 240ms var(--ease-out)"
  },
  ".glass-tooltip-motion": {
    "--tooltip-x": "0px",
    "--tooltip-y": "3px"
  },
  ".glass-tooltip-motion[data-side=\"bottom\"]": {
    "--tooltip-y": "-3px"
  },
  ".glass-tooltip-motion[data-side=\"left\"]": {
    "--tooltip-x": "3px",
    "--tooltip-y": "0px"
  },
  ".glass-tooltip-motion[data-side=\"right\"]": {
    "--tooltip-x": "-3px",
    "--tooltip-y": "0px"
  },
  ".glass-tooltip-motion[data-state=\"delayed-open\"], .glass-tooltip-motion[data-state=\"instant-open\"]": {
    "animation": "glass-tooltip-in 220ms var(--ease-out) both"
  },
  ".glass-tooltip-motion[data-state=\"closed\"]": {
    "animation": "glass-tooltip-out 140ms ease-out both"
  },
  "@keyframes glass-tooltip-in": {
    "from": {
      "opacity": "0",
      "transform": "translate(var(--tooltip-x),var(--tooltip-y)) scale(.98)"
    },
    "to": {
      "opacity": "1",
      "transform": "translate(0,0) scale(1)"
    }
  },
  "@keyframes glass-tooltip-out": {
    "from": {
      "opacity": "1"
    },
    "to": {
      "opacity": "0",
      "transform": "translate(calc(var(--tooltip-x) / 2),calc(var(--tooltip-y) / 2)) scale(.99)"
    }
  },
  ".glass-player-details": {
    "animation": "glass-player-reveal 180ms var(--ease-out) both"
  },
  "@keyframes glass-player-reveal": {
    "from": {
      "opacity": "0",
      "transform": "translateY(3px)"
    },
    "to": {
      "opacity": "1",
      "transform": "translateY(0)"
    }
  },
  ".glass-toast-host": {
    "background": "transparent !important",
    "border": "0 !important",
    "padding": "0 !important",
    "backdrop-filter": "none !important",
    "-webkit-backdrop-filter": "none !important",
    "box-shadow": "none !important"
  },
  "@media (prefers-reduced-motion: reduce)": {
    ".glass-slider-thumb::before": {
      "transition": "none"
    },
    ".glass-hold-button[data-liquid-held=\"true\"], [data-liquid-pressed=\"true\"] .glass-slider-thumb": {
      "transform": "none"
    },
    ".glass-state-swap > [data-swap-layer]": {
      "transform": "none !important",
      "filter": "none !important",
      "transition": "opacity 100ms ease",
      "transition-duration": "100ms !important"
    },
    ".glass-state-swap[data-animate=\"false\"] > [data-swap-layer]": {
      "transition": "none",
      "transition-duration": "0s !important"
    },
    ".glass-switch-thumb::before, .glass-selection-indicator, .glass-atlas-finish": {
      "transition": "none"
    },
    ".glass-elastic-button": {
      "transform": "none !important",
      "transition": "none"
    },
    ".glass-switch-thumb": {
      "scale": "1 !important"
    },
    ".glass-tooltip-motion": {
      "--tooltip-x": "0px !important",
      "--tooltip-y": "0px !important",
      "animation-duration": "80ms !important",
      "transform": "none !important"
    },
    ".glass-player-details": {
      "animation": "none"
    }
  },
  "@media (prefers-reduced-transparency: reduce), (prefers-contrast: more)": {
    "[data-liquid-pressed=\"true\"] .glass-slider-thumb": {
      "background": "var(--foreground)",
      "backdrop-filter": "none",
      "-webkit-backdrop-filter": "none"
    },
    "[data-liquid-pressed=\"true\"] .glass-switch-thumb": {
      "background": "white",
      "backdrop-filter": "none",
      "-webkit-backdrop-filter": "none"
    },
    ".glass-chip, .glass-field": {
      "backdrop-filter": "none",
      "-webkit-backdrop-filter": "none",
      "background": "var(--background)",
      "border-color": "var(--foreground)"
    },
    ".glass-switch-thumb::before": {
      "opacity": "1 !important"
    },
    "[data-liquid-selection][data-liquid-moving=\"true\"] > .glass-selection-indicator": {
      "background": "color-mix(in oklab,var(--foreground) 15%,var(--background))",
      "backdrop-filter": "none",
      "-webkit-backdrop-filter": "none"
    }
  }
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
    /glass-(chip|field|inset|accent|control-icon|action|outline|state-swap|tooltip-motion|elastic-button|selection|atlas-finish|material|player-details|toast-host)/.test(read(f.path)),
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
