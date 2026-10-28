# Glass performance rules

## Budget and rendering modes

The document-wide runtime admits at most **5 visible independent lenses on fine
pointers** and **3 on coarse pointers**. A provider can request a lower limit:

```tsx
<GlassSettingsProvider performance={{ maxActiveSurfaces: 3, frameRate: 30 }}>
  {children}
</GlassSettingsProvider>
```

The device cap still wins. Modal/overlay lenses have priority 10 over ordinary panels. The homepage
uses priority 2 for its atlas; the elastic example uses 5 while held. Offscreen and document-hidden lenses release their mirrored DOM/filter
work. Excess surfaces keep a lightweight translucent CSS finish and remain
interactive. No component disappears because it exceeded the optical budget.

`data-glass-rendering` distinguishes `active`, `composited`, `shared`, and `lightweight`.
`data-refraction="scene-svg"` confirms an independent scene mirror/filter is ready.
`data-refraction="scene-atlas"` confirms shared DOM refraction; composited members
use the atlas and do not own separate mirrors. Nested `GlassSurface` instances share their parent's ink and glass finish; small
controls do not each allocate another DOM copy or adaptive-ink sampler.
Nested surfaces use `data-refraction="inherited"` and mount no separate material
layer. Composited members mount no local blur/mirror/filter housing and cannot
display stale independent reflection textures after an overlay collapses.

`refraction={false}` on `GlassSettingsProvider` sets displacement strength to zero
for a controlled comparison. It retains the same mirror, map, blur, tint, and
glints; it is not a switch that eliminates all rendering cost. Squircle and round
surfaces use the same bounded texture path. Adaptive backdrop classification runs
only on mirror paints and checks at most 256 text nodes before choosing the
conservative content-blur path; it has no polling timer. A local `config.blur`
override preserves that blur while background-content protection still disables
displacement. Set `adaptiveBackdrop={false}` for completely manual optics.

The default surface uses 4px photo blur and 28px displacement, with a shallow
interior lens. When adaptive classification finds background text, controls or
lower glass, it uses at least 8px blur and zero displacement. Foreground children
stay sharp. The playground's Adapt to content switch permits manual comparison.
Source-colored rim lighting reuses `SourceGraphic` in the existing SVG filter:
a 1px-horizontal / 24px-vertical color diffusion preserves neighboring color
columns. The rim PNG also packs coordinates that project each lens's central
source column to its top and bottom arcs, using one additional displacement pass
only when source-colored light is enabled. Atlas members retain their own column
centers. Saturation/energy and the thin alpha mask retain color against white.
The transmitted scene is blurred inside the SVG before the sharp rim is added.
This replaces the outer CSS blur on the portable path; it does not add a second
content blur. The rim mask uses the same round/L4 geometry and cache as displacement.
It adds one cached PNG, no mirror, CPU image readback, raster capture or idle
loop. `optics.colorBleed=0` omits the color pass; its changes do not rebuild maps.
`optics.interior=0` restores the legacy flat interior. The color pass is an
approximation weighted toward the central column, not exact dominant-color histogram sampling
or a claim about Apple's private renderer.

## Composition rules

- Target **one to three optical panels** in a normal viewport. Five is a ceiling,
  not a reason to add more. Size and source complexity matter as much as count.
- Transforming standalone controls can opt out of the atlas with
  `composite={false}`. Their content, clip and optics then transform together.
  Tint-only overrides can stay batched. The homepage moves its intro links into
  the atlas to reserve three small lenses for Continue, Save and Search without
  raising the ceiling. Overlay priority still wins.
- Use one bounded `GlassScene` for related panels. Keep unrelated page sections
  outside that source. Do not mirror an entire document by default.
- Put text/images/forms in the explicit source. Put interactive glass in children.
- Use a single parent panel for a form, toolbar, player, or settings group.
- Mount only the active example in the gallery. The homepage is a curated exception:
  separate component silhouettes share one bounded viewport source. A `GlassAtlas` batches its non-overlapping sibling silhouettes with the same
  optics into one masked displacement field, one mirror, and one budget slot.
  Local config/source overrides and overlays opt out. The elastic example owns
  one additional small lens; it does not remove/re-add a shape in the atlas
  during every gesture. Do not hide a full catalogue of live lenses.
- Avoid overlapping independently refracting surfaces unless the interaction needs
  it. Lower glass must be copied into an upper lens, so overlapping stacks cost more.
- Static image scenes are event driven: no adaptive-ink timer. Set `live` on
  `GlassScene` only for continuously changing canvas/video/animated sources.
- Moving a lens updates geometry. It must not regenerate its displacement map
  unless geometry changes. Repeated unchanged geometry must not repaint filters.
- Keep chromatic aberration at zero by default; it adds a displacement pass.
- Use the local responsive Ice/Ocean/Dunes image variants. Do not put video, large canvases, or
  hundreds of nodes under a small control without measuring the cost.
- Do not blanket-apply `will-change`, GPU transforms, blur, or backdrop filters
  to layout wrappers. Visibility, caching, and bounded sources come first.
- Reduced-transparency/high-contrast preferences keep the opaque accessible fallback.

## Repeatable measurement

Open `/lab`. Compare Independent and Shared atlas renderers with 3, 5, and 8 mounted surfaces
and active limits of 3 and 5.
Use the Contour control to compare round and squircle masks with the same source
and fixed blur; the lab disables adaptive blur to keep this comparison consistent.
Use Rim light to compare the source-color pass with the neutral finish. The lab
uses the same clear defaults for both backends.
Each run moves the same DOM source for 120 animation frames and reports:

- mounted vs active lenses;
- mirror count and mirrored DOM nodes;
- filter refreshes during the run;
- median, 95th percentile, maximum frame interval, and intervals over 25ms.

Repeat after the first asset/map decode, at desktop and phone viewport sizes.
Check that eight mounted surfaces still respect the active limit, foreground
controls remain interactive, idle counters settle, and tab switching/unmounting
releases mirrors. Test native Safari/Firefox and physical low-powered phones
before advertising platform-specific performance. A desktop viewport emulation
is not a physical phone test; RAF intervals are not a complete GPU profile.

Measured results from this change are recorded in [performance-results.md](performance-results.md).

## Sources

- [Aave: Building Glass for the Web](https://aave.com/design/building-glass-for-the-web):
  bounded duplicated content, SVG filtering, moving geometry without rebuilding maps.
- [MDN: Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API):
  asynchronous visibility monitoring and avoiding offscreen work.
- [MDN: will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change):
  use sparingly after measuring rather than as a blanket optimization.

## Homepage source motion

The scroll scene reveals two full-bleed local photo layers using transforms and
opacity on source elements. The desktop foreground remains stationary. A passive scroll listener schedules at most one pending animation
frame; it stops when idle, hidden, or outside the section. The renderer keeps its
30 fps source-capture limit. No state update rerenders all controls on every scroll.
The composition pins at >=1024px wide and >=640px tall, with compact gaps below
720px. The expanded player uses
an independent priority-10 layer over its reserved mini slot; it does not reflow
the other examples. Shorter viewports and
reduced-motion devices use normal document flow so controls remain reachable.
State-icon crossfades blur only two tiny visual layers for 180ms; reduced motion
removes that blur and motion. General button labels remain static.


## Nested controls and deliberate presses

A form, player, or menu has one optical layer. Its buttons and thumbs can have a
local translucent finish without independent distortion. Bare music transport
icons use `variant="ghost"`. Put controls outside the panel when they need their
own shape and source mirror. Repeatedly nesting lenses distorts foreground text
and increases capture cost; this is a library tradeoff, not a universal rule about
Apple’s implementation.

`GlassButton liquidOnHold` temporarily admits a standalone lens after a 180ms
pointer hold. Keyboard feedback has no hold delay. The old slot is released when
the gesture ends. Slider/switch thumb feedback uses local CSS glass and does not
register extra mirrors. Normal buttons do not use the hold transition.

## Atlas limits and theme changes

- The atlas is opt-in for sibling shapes in one bounded source. It is not a way
  to flatten overlapping lenses, different optical configurations, or an entire site.
- Texture allocation is capped at 1.5 million pixels. The two-entry LRU cache
  retains only the current/previous geometry fields. Blur, tint, brightness, depth,
  and ink changes reuse geometry. Theme finish changes update the existing filter
  and mirror; they do not clear readiness and re-create the compositor.
- Fractional CSS sizes and positions on the 1/64px layout grid form the map key.
  Clipping, diagnostic contours, and optical masks share those sizes. Only PNG
  pixel allocation is rounded; ceiling physical sizes created a second rim.
  Idle and source
  scrolling must not rebuild displacement maps. Resize/layout changes can.
  Transition/animation completion schedules one final geometry check so a pressed
  button cannot leave its settled silhouette at an intermediate scale.
- Layer mutation filtering applies exclusion and relevance checks to the same
  mutation. Internal mirror updates in a mixed observer batch cannot masquerade
  as changes to the lower content.
- If an atlas is denied or still decoding, its members retain plain tint and
  readable foregrounds without mounting a CSS backdrop blur per member. Admission
  never silently expands the budget into dozens of fallback filter passes.
- The atlas precomposes the same reflection and optical shade as an independent
  lens into one light texture, without adding another optical pass.
- Ink sampling ignores load events from inert mirror images. Lens movement
  schedules a sample through its style observer; static scenes require no polling.
- The site reserves a stable scrollbar gutter and cancels Radix’s duplicate margin
  compensation. Its drawer disables Vaul body styling/scaling. Opening a modal
  must preserve the scene width, source coordinates, focus, and scroll position.
- The elastic button updates only a small independent map during pointer input.
  It has no idle frame loop and releases pointer/timer work on cancellation/unmount.
  Keep chroma at zero. Do not apply continuously changing deformations to the atlas.
