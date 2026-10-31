# Compact glass panels

Tooltips, hover cards, popovers, dropdowns, drawers and cards use `GlassPanel`.
It shares the slider's curved displacement field and `GlassFilterManager`.
Foreground labels, inputs and actions remain normal DOM outside the filter.

```tsx
<TooltipProvider delayDuration={300}>
  <Tooltip>
    <TooltipTrigger asChild>
      <GlassButton variant="ghost" size="icon" aria-label="Copy image link">
        <Link />
      </GlassButton>
    </TooltipTrigger>
    <GlassTooltipContent variant="beak" radius={13} shape="round">
      Copy link
    </GlassTooltipContent>
  </Tooltip>
</TooltipProvider>
```

Use `variant="plain"` to omit the pointer. `shape="squircle"` changes the corner
contour; `radius` sets its size. Hover cards and popovers accept `beak` as a
boolean. The transparent native Radix arrow supplies placement and collision
coordinates. The visible pointer is a smooth union in the same coverage,
displacement and reflection map as the body, with no joining line.

The default tooltip is 26px high with 0.35px background softening and 1.04× source
zoom. Light surfaces have no gray body tint or added source brightness.
Dark surfaces retain a faint neutral reflection. These are material defaults,
not a claim about Apple's renderer. `lensParameters` overrides the shared field.
Larger panels use 4–8px background softening and 1.04–1.12× source zoom, while
their foreground stays sharp. Source-colored shoulders reuse the bounded
source and cached rim mask without boosting source saturation or RGB. The dock
has a fixed 1.6px local-color band, 24px rounded corners, 6px blur and a shallow
1.05× lens. A 1.25px directional tonal bevel preserves the silhouette on light
paper and in the fallback. This is part of the cached contour maps.

The colored shoulder samples the interior of each background column instead
of sampling only pixels at the perimeter. It reuses the existing rim texture
and filter's column projection, without a CPU color histogram. Neighboring
columns stay separate and source saturation/RGB gain remain unchanged.

Put a small, complete background in `GlassScene` for portable DOM refraction,
and keep portals within that source's bounds. Backgrounds must paint their
whole plane; transparent holes can expose unbent pixels. Outside a bounded
scene, supported Chromium versions use native SVG backdrop filtering. Other
browsers retain local blur and the contour glint. No whole-document mirror,
pixel readback or idle animation is introduced. Reduced transparency uses an
opaque fallback. Native focus, Escape, outside dismissal and disabled states
remain provided by Radix/shadcn and Vaul.

Higher contrast does not disable the lens. It increases neutral contrast
protection; explicit Reduce Transparency and forced-color palettes use solid UI.
The renderer exposes `data-glass-fallback` to distinguish an accessibility
preference, budget admission, source bounds, pending textures or unsupported
native backdrop filtering. A missing native SVG backdrop path does not disable
the bounded DOM or explicit-target path used by the main control examples.

`GlassDock material="backdrop"` uses that local backdrop path for floating docks.
The existing `scene` and explicit-target `lens` modes remain available.
`GlassButton variant="glass"` uses the compact material; nested actions share
their parent's surface. Primary and secondary actions remain plain controls.

The homepage uses interaction tabs and three lower sections: Profile, Overlays
and Details. Each section mounts one example at a time and releases it outside
the viewport. Frames use the dimensions that suit the component. The profile
lens refracts a centered circular avatar over its paper plane, with two actions.
Docs retain radius/shape and refraction controls. Normal-glass comparisons are
deferred; these examples focus on the actual lens.

On the homepage, the six lower examples show centered triggers on a plain paper
plane, with no images or surrounding application UI. Popovers, menus, drawers,
tooltips and hover cards start closed; the card remains visible. Touch users
can tap tooltip/hover-card triggers. The richer examples load only in docs/gallery.

The docs/gallery examples share an asset-workspace context. A toolbar icon owns
the tooltip, a collaborator link owns the hover card, and the View popover
changes the grid/list layout and file details. File-row ellipses expose copy,
duplicate and download actions. Filenames open a native details drawer. The
collection card uses its cover as the optical source. Its entire cover and glass
caption open an asset-grid dialog. Image tiles and review images likewise open
their previews from the whole surface, with native focus return and Escape.
Shared dialogs now use the same compact lens, without a whole-viewport blur.
These are ordinary product layouts; the overlay or collection caption is the
only lens. On the homepage, tooltips and hover cards open on hover/focus. The
documentation inspector can still pin them for shape and refraction editing.
Popover and hover-card foreground viewports scroll within the available local
space while their optical contours stay intact. Initial readiness fades the
completed finish in once; resizing keeps foreground labels visible.
