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
Larger panels use 0.7–2px background softening and 1.06–1.12× source zoom, while
their foreground stays sharp. Source-colored shoulders reuse the bounded
source and cached rim mask. The dock has a fixed 2px local-color band and
22px squircle corners; there is no painted accent border.

Put a small, complete background in `GlassScene` for portable DOM refraction,
and keep portals within that source's bounds. Backgrounds must paint their
whole plane; transparent holes can expose unbent pixels. Outside a bounded
scene, supported Chromium versions use native SVG backdrop filtering. Other
browsers retain local blur and the contour glint. No whole-document mirror,
pixel readback or idle animation is introduced. Reduced transparency uses an
opaque fallback. Native focus, Escape, outside dismissal and disabled states
remain provided by Radix/shadcn and Vaul.

`GlassDock material="backdrop"` uses that local backdrop path for floating docks.
The existing `scene` and explicit-target `lens` modes remain available.
`GlassButton variant="glass"` uses the compact material; nested actions share
their parent's surface. Primary and secondary actions remain plain controls.

The homepage uses interaction tabs and three lower sections: Profile, Overlays
and Details. Each section mounts one example at a time and releases it outside
the viewport. Frames use the dimensions that suit the component. The profile
lens refracts a centered illustration over its paper plane, with two actions.
Docs retain radius/shape and refraction controls. Normal-glass comparisons are
deferred; these examples focus on the actual lens.

The six lower examples share an asset-workspace context. A toolbar icon owns
the tooltip, a collaborator link owns the hover card, and the View popover
changes the grid/list layout and file details. File-row ellipses expose copy,
duplicate and download actions. Filenames open a native details drawer. The
collection card uses its cover as the optical source and opens its asset grid.
These are ordinary product layouts; the overlay or collection caption is the
only lens. On the homepage, tooltips and hover cards open on hover/focus. The
documentation inspector can still pin them for shape and refraction editing.
