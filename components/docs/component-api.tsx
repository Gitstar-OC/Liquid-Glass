import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Prop = [name: string, type: string, defaultValue: string, description: string];
const API: Record<string, Prop[]> = {
  "glass-surface": [
    ["shape", '"round" | "squircle"', '"squircle"; capsules use "round"', "Uses the same contour for clipping, displacement, reflected light, and the optional outline. Radius sets the corner size."],
    ["adaptiveBackdrop", "boolean", "true", "Uses zero blur over plain content and the configured photo blur (4px by default). Background text/controls use at least 8px and zero displacement. Local config.blur preserves its value; false restores manual optics. Classification runs on scene paints, without an idle timer."],
    ["rendering", '"auto" | "shared"', '"auto"', "Auto uses the bounded scene or a compatible atlas. Shared retains the parent's optical finish without a second mirror."],
  ],
  "glass-toaster": [
    ["id", "string", "—", "Optional Toaster identity. Mount it inside the scene/settings context for scene-backed toast refraction."],
    ["glassToast options.toasterId", "string", "—", "Routes the notification to a matching Toaster. Duration, description, and action are also supported."],
    ["glassToast options.id", "string | number", "Generated", "Reusing an ID updates one notification instead of stacking duplicates."],
    ["glassToast options.image", "{ src: string; alt: string }", "—", "Optional 44px image preview. Supply an accessible description."],
  ],
  "glass-elastic-button": [
    ["className", "string", "—", "Layout classes for a small, independently refracting pull example. Hold for 160ms, then drag; input is bounded to 48px and visual travel to 12px."],
    ["Interaction", "Pointer / keyboard", "Idle", "Release returns the optical field over 420ms; cancellation, focus loss, and unmount clear gesture work. Reduced motion disables pull motion. It counts as one independent lens."],
  ],
  "glass-dock": [
    ["children", "ReactNode", "Required", "Compose GlassDockItem controls in one optical navigation surface."],
    ["aria-label", "string", '"Dock"', "Names the navigation region."],
    ["GlassDockItem label", "string", "Required", "Accessible action name and tooltip text. Tooltips also open on keyboard focus."],
    ["GlassDockItem asChild", "boolean", "false", "Composes a link such as Next Link; otherwise renders a button. Native events are forwarded."],
  ],
  "glass-icons": [
    ["name", "GlassIconName", "Required", "Selects an original 24px control glyph. Import the type for the available names."],
    ["className / strokeWidth", "SVGProps", "24px / 1.7", "Native SVG props are forwarded. Icons are decorative; label the enclosing button or link."],
  ],
  "glass-state-swap": [
    ["active", "boolean", "Required", "Chooses the destination visual state. Both layers stay mounted so rapid changes can reverse smoothly."],
    ["from / to", "ReactNode", "Required", "Two visual states. Give the parent button an accessible label; swap layers are hidden from assistive technology."],
    ["animate", "boolean", "true", "Set false for keyboard actions. Pointer feedback uses an interruptible 180 ms transition with a 2px blur bridge; reduced motion keeps only a fade."],
    ["className", "string", "—", "Adds layout classes to the inline grid. Reserve a stable width for changing labels."],
  ],
  "glass-state-button": [
    ["className", "string", "—", "Layout classes for GlassSaveButton, GlassLikeButton, and GlassAddButton."],
    ["onSavedChange", "(saved: boolean) => void", "—", "GlassSaveButton callback. Like and Add expose their selected state with aria-pressed."],
  ],
  "glass-button": [
    ["variant", '"core" | "primary" | "secondary" | "ghost" | shadcn variant', '"core"', "Core refracts glass; primary is flat blue; secondary is a flat neutral control without a lens or gradient; ghost has bare content. Legacy glass/glass-strong/accent aliases remain supported."],
    ["liquidOnHold", "boolean", "false", "Reveals a standalone scene lens after a 180ms pointer hold. Release, blur, and pointer cancellation restore the idle finish. Keyboard press feedback is immediate. Nested controls continue to share their panel."],
    ["shape", '"pill" | "circle" | "default"', '"pill"', "Selects a capsule, circular icon control, or 12px rounded rectangle."],
    ["rendering", '"auto" | "shared"', '"auto"', "Auto refracts a bounded scene when standalone. Shared uses the lightweight finish without another mirror."],
    ["asChild", "boolean", "false", "Composes onto a link or another element that forwards props and its ref."],
    ["disabled", "boolean", "false", "Disables the underlying button. Native button events and accessibility props are forwarded."],
  ],
  "glass-slider": [
    ["appearance", '"line" | "well" | "hud"', '"line"', "Chooses a fine track, broad track, or compact HUD. Holding reveals a translucent finish with a 14% expansion over 260ms after 60ms of intent; it shares the enclosing panel’s optics."],
    ["tone", '"neutral" | "accent"', '"neutral"', "Uses the foreground color or the action color for the filled track."],
    ["value / defaultValue", "number[]", "[min]", "Controlled or initial values. Multiple values produce multiple thumbs."],
    ["min / max / step", "number", "0 / 100 / 1", "Sets the range and keyboard increment."],
    ["onValueChange", "(value: number[]) => void", "—", "Runs while the value changes. Radix onValueCommit, orientation, and disabled are also supported."],
  ],
  "glass-range-control": [
    ["label", "string", '"Sound"', "Visible label and accessible slider name."],
    ["radius", "number", "20", "Rounded rectangle shared with the compact AirDrop surface; set 999 explicitly for a capsule."],
    ["kindOfControl", '"sound" | "brightness"', '"sound"', "Selects the end icons."],
    ["value / defaultValue", "number", "65 (defaultValue)", "Controlled or initial value from 0 to 100."],
    ["onValueChange", "(value: number) => void", "—", "Receives the new value."],
    ["disabled", "boolean", "false", "Disables the slider while keeping the label visible."],
  ],
  "glass-sound": [
    ["volume / defaultVolume", "number", "42 (defaultVolume)", "Controlled or initial volume from 0 to 100."],
    ["onVolumeChange", "(value: number) => void", "—", "Connects the preview to your own audio state. The component does not change system volume."],
    ["onOutputChange", "(value: string) => void", "—", 'Reports "speakers" or "display" from the output picker.'],
  ],
  "glass-connectivity": [
    ["defaultEnabled", "boolean", "true", "Initial sharing switch state. This is an interface control, not access to system AirDrop."],
    ["onEnabledChange", "(enabled: boolean) => void", "—", "Reports switch changes. Choices are disabled while sharing is off."],
    ["onVisibilityChange", "(value: string) => void", "—", 'Reports "contacts" or "everyone". The selected choice is preserved while disabled.'],
  ],
  "glass-control-center": [
    ["value / defaultValue", "Partial<GlassControlCenterState>", "Wi-Fi/Bluetooth on; brightness 72; volume 58; Focus off", "Controlled overrides or initial values for the connectivity and range controls."],
    ["onValueChange", "(state: GlassControlCenterState) => void", "—", "Receives the complete state after a change. Connect it to your application; it does not modify OS settings."],
  ],
  "glass-music-player": [
    ["compact", "boolean", "false", "Hides the extra heading and volume row for a compact player."],
    ["expandable", "boolean", "false", "Starts as a mini player. Play expands it; Minimize restores the mini layout without replacing the audio element."],
    ["expanded / onExpandedChange", "boolean / (expanded: boolean) => void", "Uncontrolled", "Controls the mini/full layout when expandable is enabled."],
    ["footer", "ReactNode", "—", "Optional content sharing the player’s optical surface."],
    ["tracks", "readonly GlassTrack[]", "Required", "Each track has title and src, with optional artist and artwork."],
    ["defaultTrack", "number", "0", "Initial track index, clamped to the available tracks."],
    ["trackIndex", "number", "Uncontrolled", "Controlled track index, clamped to the available tracks. Use with onTrackChange; the audio element remains mounted."],
    ["volume / defaultVolume", "number", "0.4 (defaultVolume)", "Controlled or initial HTML audio volume from 0 to 1."],
    ["onVolumeValueChange", "(volume: number) => void", "—", "Reports volume-slider changes; use with volume for external controls."],
    ["onTrackChange", "(index: number) => void", "—", "Reports the selected track. Playback begins after a user action."],
  ],
  "glass-spotlight": [
    ["commands", "readonly GlassSpotlightCommand[]", "Required", "Commands include id, label and onSelect; icon, group, shortcut and disabled are optional."],
    ["open / defaultOpen", "boolean", "false (defaultOpen)", "Controlled or initial dialog state."],
    ["onOpenChange", "(open: boolean) => void", "—", "Reports opening and dismissal."],
    ["shortcut", "boolean", "false", "Enables Command/Ctrl+K. Enable only one global command shortcut per page."],
    ["triggerLabel / placeholder", "string", '"Search anything…"', "Text for the trigger and search field."],
    ["container", "HTMLElement | null", "document.body", "Portal target. Keep it over the scene bounds to refract that scene."],
  ],
  "glass-drawer": [
    ["container", "HTMLElement | null", "document.body", "GlassDrawerContent portal target."],
    ["config", "Partial<LensParams>", "blur: 8", "Overrides the shared optics for the drawer surface."],
    ["surface", "GlassSurface", '"clear"', "Optional material override."],
    ["open / onOpenChange", "boolean / (open: boolean) => void", "Uncontrolled", "Pass to Drawer. Vaul direction, modal, and snap-point props remain available."],
  ],
  "glass-power": [
    ["title / description / confirmLabel", "string", "Shutdown copy", "Content of GlassPowerDialog. Always provide a clear action name."],
    ["trigger", "ReactNode", "—", "A button composed with the dialog trigger."],
    ["onConfirm", "(options: { reopenWindows: boolean }) => void", "—", "Runs when confirmed. No system action occurs automatically."],
    ["container", "HTMLElement | null", "document.body", "Portal target for the confirmation."],
    ["GlassPowerPanel", "Non-modal panel", "—", "Displays the same power controls without a portal or focus trap. It accepts onCancel and onConfirm callbacks."],
    ["onAction", '(action: "sleep" | "restart" | "shutdown") => void', "—", "GlassPowerMenu callback; shutdown runs after confirmation."],
  ],
  "glass-navbar": [["children", "ReactNode", "—", "Navigation links or composed controls. The navbar shares its optics with its children."]],
  "glass-switch": [
    ["size", '"sm" | "default"', '"default"', "A capsule track with an elongated capsule thumb. The thumb grows slightly beyond the track during its 300ms liquid travel; keyboard changes are instant."],
    ["checked / defaultChecked", "boolean", "false", "Controlled or initial checked state."],
    ["onCheckedChange", "(checked: boolean) => void", "—", "Reports state changes."],
    ["disabled", "boolean", "false", "Disables interaction. Radix Switch form props are forwarded."],
  ],
};
const SHARED: Prop[] = [
  ["surface", "GlassPreset", "Per component", "Scopes one material to a collection without changing saved theme preferences. An explicit component surface prop takes precedence."],
  ["showOutlines", "boolean", "false", "Shows a diagnostic SVG contour from the exact clipping geometry. It allocates no additional optical lens and does not change the surface dimensions."],
  ["refraction", "boolean", "true", "Set false to compare the same glass finish and background capture with displacement strength zero. Re-enabling it reuses the geometry map. Blur, tint, and glints remain unchanged."],
  ["themeBehavior", '"unitheme" | "duotheme"', '"unitheme"', "Unitheme allows adaptive ink. Duotheme preserves the supplied ink (or the initial dark ink) while tint/blur and appearance change; contrast protection supports that fixed color."],
  ["config", "Partial<LensParams>", "See optical settings", "Shared refraction, blur, tint, and light settings."],
  ["optics", "Partial<GlassOptics>", "IOR 1.45; thickness 0.7; angle −45°; roughness 0.18; interior 0.18; colorBleed 0.75", "Controls the optical model. Interior lensing and source-colored rim light are independently adjustable."],
  ["radius", "number", "Component dependent", "Shared corner radius in pixels. Explicit component radius takes precedence."],
  ["ink", '"auto" | "light" | "dark"', '"auto"', "Samples the scene or pins the foreground to white or black."],
  ["contrastProtection", "boolean", "true", "Allows a neutral readability overlay when automatic ink needs it."],
  ["performance", "{ maxActiveSurfaces?: number; frameRate?: number }", "Device cap; 30 fps", "Limits optical work. The document cap remains five lenses, or three on coarse pointers."],
];
const OPTICS: Prop[] = [
  ["depth", "number", "28", "Displacement strength in pixels. Adaptive background content uses zero displacement."],
  ["splay / feather / curve", "number", "10 / 20 / 2.2", "Controls edge spread, falloff, and curvature."],
  ["blur", "number", "4", "Background blur in pixels. Adaptive text/UI uses at least 8px; foreground content stays sharp."],
  ["glint", "number", "55", "Optical highlight strength."],
  ["tint / tintColor", "number / CSS hex color", '0.025 / "#ffffff"', "Tint opacity and color."],
  ["chroma", "number", "0", "Chromatic displacement. Keep zero for the cheapest rendering path."],
  ["saturate / brightness / contrast", "number", "1 / 1 / 1", "Color adjustments applied to the captured background."],
];
function PropTable({rows}: {rows: Prop[]}) {
  return <Table className="text-xs"><TableHeader><TableRow><TableHead>Prop</TableHead><TableHead>Type</TableHead><TableHead>Default</TableHead><TableHead>Description</TableHead></TableRow></TableHeader><TableBody>{rows.map(([name,type,value,description])=><TableRow key={name}><TableCell className="align-top font-mono">{name}</TableCell><TableCell className="max-w-60 min-w-36 align-top font-mono whitespace-normal">{type}</TableCell><TableCell className="max-w-48 min-w-28 align-top whitespace-normal">{value}</TableCell><TableCell className="min-w-56 align-top leading-5 whitespace-normal text-muted-foreground">{description}</TableCell></TableRow>)}</TableBody></Table>;
}
export function ComponentApi({name}: {name: string}) {
  const rows = API[name];
  return <section className="mt-12 flex flex-col gap-8" aria-label="Component API">
    {rows && <div><h2 className="mb-4 text-base font-medium">Props</h2><PropTable rows={rows}/></div>}
    <div><h2 className="mb-3 text-base font-medium">Shared glass settings</h2><p className="mb-4 text-sm leading-6 text-muted-foreground">Pass these props to <code>GlassSettingsProvider</code> to configure every glass component inside it. <code>GlassSurface</code> also accepts local <code>config</code>, <code>radius</code>, <code>shape</code>, <code>adaptiveBackdrop</code>, <code>ink</code>, and <code>className</code> overrides.</p><PropTable rows={SHARED}/></div>
    <details className="group"><summary className="cursor-pointer text-sm font-medium">Optical settings</summary><div className="mt-4"><PropTable rows={OPTICS}/></div></details>
    <p className="text-xs leading-5 text-muted-foreground">Place the background DOM in <code>GlassScene</code> and the controls in its children. Nested controls share their panel’s optics. Without a source scene, controls use a lightweight glass finish. Native component props and events are forwarded; check Source for the complete TypeScript signature.</p>
  </section>;
}
