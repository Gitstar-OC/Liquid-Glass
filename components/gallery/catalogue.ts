export const COMPONENT_GROUPS = [
  "All",
  "Controls",
  "Forms",
  "Navigation",
  "Overlays",
  "Feedback",
  "Widgets",
] as const;
export type ComponentGroup = (typeof COMPONENT_GROUPS)[number];
export const COMPONENT_CATALOGUE: {
  id: string;
  title: string;
  group: ComponentGroup;
  description: string;
}[] = [
  {
    id: "glass-dock",
    title: "Dock",
    group: "Navigation",
    description:
      "A single glass surface with app controls and accessible tooltips.",
  },
  {
    id: "glass-state-button",
    title: "Button states",
    group: "Controls",
    description:
      "Save, Like, and Add with interruptible blur transitions and instant keyboard feedback.",
  },
  {
    id: "glass-sound",
    title: "Sound",
    group: "Widgets",
    description: "A compact volume slider and audio output picker.",
  },
  {
    id: "glass-connectivity",
    title: "Sharing",
    group: "Widgets",
    description: "A connectivity switch with selectable visibility.",
  },
  {
    id: "glass-range-control",
    title: "Range control",
    group: "Controls",
    description: "A compact rounded rectangle with a fine slider track.",
  },
  {
    id: "glass-button",
    title: "Button",
    group: "Controls",
    description: "Circular, pill and rectangular actions. One optical surface.",
  },
  {
    id: "glass-button-group",
    title: "Button group",
    group: "Controls",
    description:
      "Related actions, joined together with clear focus and pressed states.",
  },
  {
    id: "glass-switch",
    title: "Switch",
    group: "Controls",
    description: "A glass track, a bright thumb and an unmistakable on state.",
  },
  {
    id: "glass-slider",
    title: "Slider",
    group: "Controls",
    description:
      "Precise control, from a fine line to a full-width glass well.",
  },
  {
    id: "glass-toggle",
    title: "Toggle",
    group: "Controls",
    description: "Persistent choices with tactile, readable pressed states.",
  },
  {
    id: "glass-checkbox",
    title: "Checkbox & radio",
    group: "Forms",
    description: "Single and multiple selections with native form semantics.",
  },
  {
    id: "glass-input",
    title: "Input & textarea",
    group: "Forms",
    description: "Sharp text, visible focus and a clear place to begin.",
  },
  {
    id: "glass-form",
    title: "Form",
    group: "Forms",
    description:
      "Connected labels, editable fields and a working submit action.",
  },
  {
    id: "glass-combobox",
    title: "Combobox",
    group: "Forms",
    description: "Search, choose and navigate options with your keyboard.",
  },
  {
    id: "glass-select",
    title: "Select",
    group: "Forms",
    description: "A familiar picker with a refracting option list.",
  },
  {
    id: "glass-navbar",
    title: "Navbar",
    group: "Navigation",
    description: "A clear, compact home for your primary actions.",
  },
  {
    id: "glass-sidebar",
    title: "Sidebar",
    group: "Navigation",
    description: "A quiet hierarchy for folders, pages and workspaces.",
  },
  {
    id: "glass-tabs",
    title: "Tabs",
    group: "Navigation",
    description: "Related views, with roving focus and a visible active state.",
  },
  {
    id: "glass-navigation-menu",
    title: "Navigation menu",
    group: "Navigation",
    description: "Links and expandable sections on the shared glass surface.",
  },
  {
    id: "glass-menubar",
    title: "Menubar",
    group: "Navigation",
    description: "Compact application menus with keyboard support.",
  },
  {
    id: "glass-dialog",
    title: "Dialog",
    group: "Overlays",
    description: "A focused task with managed focus and Escape to return.",
  },
  {
    id: "glass-alert-dialog",
    title: "Alert dialog",
    group: "Overlays",
    description: "A deliberate confirmation before an important action.",
  },
  {
    id: "glass-drawer",
    title: "Drawer",
    group: "Overlays",
    description: "A touch-friendly panel for preferences and secondary tasks.",
  },
  {
    id: "glass-sheet",
    title: "Sheet",
    group: "Overlays",
    description: "A generous side panel that keeps the scene in view.",
  },
  {
    id: "glass-popover",
    title: "Popover",
    group: "Overlays",
    description: "Small, contextual settings beside their trigger.",
  },
  {
    id: "glass-dropdown",
    title: "Dropdown menu",
    group: "Overlays",
    description: "Actions and submenus, with the same clear optical edge.",
  },
  {
    id: "glass-context-menu",
    title: "Context menu",
    group: "Overlays",
    description: "Right-click for contextual actions over the live backdrop.",
  },
  {
    id: "glass-hover-card",
    title: "Hover card",
    group: "Overlays",
    description: "A little more context, on hover or keyboard focus.",
  },
  {
    id: "glass-command",
    title: "Command",
    group: "Overlays",
    description: "Filter commands and choose with the keyboard.",
  },
  {
    id: "glass-tooltip",
    title: "Tooltip",
    group: "Feedback",
    description: "Brief, readable explanations close to a control.",
  },
  {
    id: "glass-toaster",
    title: "Toast",
    group: "Feedback",
    description: "An actionable notification with a dismiss control.",
  },
  {
    id: "glass-alert",
    title: "Alert",
    group: "Feedback",
    description:
      "A persistent message that sits naturally within your interface.",
  },
  {
    id: "glass-badge",
    title: "Badge",
    group: "Feedback",
    description: "Small status indicators with a restrained glass finish.",
  },
  {
    id: "glass-progress",
    title: "Progress",
    group: "Feedback",
    description: "A clear indication of work in progress.",
  },
  {
    id: "glass-avatar",
    title: "Avatar",
    group: "Feedback",
    description: "A portrait or initials with a clean optical rim.",
  },
  {
    id: "glass-accordion",
    title: "Accordion",
    group: "Feedback",
    description: "Reveal the details when you need them.",
  },
  {
    id: "glass-card",
    title: "Card & surface",
    group: "Widgets",
    description: "A composable container for ordinary shadcn components.",
  },
  {
    id: "glass-preferences",
    title: "Preferences",
    group: "Widgets",
    description: "A complete, editable preferences panel with a save callback.",
  },
  {
    id: "glass-music-player",
    title: "Music player",
    group: "Widgets",
    description: "Real playback, seeking, track navigation and volume.",
  },
  {
    id: "glass-control-center",
    title: "Control center",
    group: "Widgets",
    description:
      "Connectivity, brightness, sound and focus in one compact panel.",
  },
  {
    id: "glass-spotlight",
    title: "Spotlight",
    group: "Widgets",
    description: "Searchable commands in an independent glass panel.",
  },
  {
    id: "glass-power",
    title: "Power controls",
    group: "Widgets",
    description: "Sleep, restart and shutdown callbacks with confirmation.",
  },
];
