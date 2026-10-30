# Glass performance rules

## Budget and rendering modes

The document-wide runtime admits at most **5 visible independent lenses on fine
pointers** and **3 on coarse pointers**. A provider can request a lower limit:

```tsx
<GlassSettingsProvider performance={{ maxActiveSurfaces: 3, frameRate: 30 }}>
  {children}
</GlassSettingsProvider>
```

The device cap still wins. Modal/overlay lenses have priority 10 over ordinary panels. The homepage uses priority 2 for its small intro atlas; the elastic example uses 5 while held. Offscreen and document-hidden lenses release their mirrored DOM/filter
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
  `composite={false}` so their content, clipping and optics move together.
  The homepage mounts one selected example, a compact intro atlas and a dock.
  Two neutral lenses remain at rest. A pressed or inspector-pinned control adds
  one compact lens; selected navigation keeps that one slot at rest. The device cap still wins.
  Sources stay separately bounded.
  The Video example uses one admitted WebGL compositor for its four disjoint
  control shapes, one video texture upload per rendered frame, and cached maps.
  It does not register each button or build scene mirrors for video.
- Use one bounded `GlassScene` for related panels. Keep unrelated page sections
  outside that source. Do not mirror an entire document by default.
- Put text/images/forms in the explicit source. Put interactive glass in children.
- Use a single parent panel for a form, toolbar, player, or settings group.
- Mount only the active example on the homepage and in the gallery. Unmounting
  releases the previous media, observers, gestures, portals and optical layers.
  Do not use CSS hiding to keep an entire catalogue alive. An atlas is useful
  for related, non-overlapping shapes, but its empty rectangle is not glass.
  Lower-layer capture checks actual member bounds and ignores other scenes.
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
  original DOM filtering, optional explicit targets, moving geometry without rebuilding maps.
- [MDN: Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API):
  asynchronous visibility monitoring and avoiding offscreen work.
- [MDN: will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change):
  use sparingly after measuring rather than as a blanket optimization.

## Homepage source bounds

The homepage has no full-viewport atlas or animated scroll source. Its active example is a small flat control plane (the stage is 356px high,
324px on phones). Intro links and
the dock have their own small neutral sources. Only the selected example mounts;
changing it releases the previous lens before the new one is admitted. Dynamic
music and elastic components load on demand, and audio is removed on departure.
The demo's refraction comparison changes displacement only. No idle RAF loop runs.
Clip the page's sampling margins so the bottom lens cannot extend scroll height.

## Nested controls and deliberate presses

A form, player, or menu has one optical layer. Its buttons and thumbs can have a
local translucent finish without independent distortion. Bare music transport
icons use `variant="ghost"`. Put controls outside the panel when they need their
own shape and source mirror. Repeatedly nesting lenses distorts foreground text
and increases capture cost; this is a library tradeoff, not a universal rule about
Apple’s implementation.

`GlassButton liquidOnHold` temporarily admits a standalone lens after a 180ms
pointer hold. Keyboard feedback has no hold delay. The old slot is released when
the gesture ends. Slider/switch pointer feedback uses a small explicit-target SVG lens,
registers no scene mirror, and releases its transient budget slot on release. Normal buttons do not use the hold transition.

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

## Texture readiness

Decode promises are keyed by the complete texture bundle in a WeakMap. Two
bundles with identical displacement but different reflection/rim images must
both decode before presentation. Cached bundle objects reuse their promise,
and evicted bundles can be garbage collected.

## Original DOM and explicit target refraction

`GlassLens` filters its original DOM children by default. A small positioned
map overlays a neutral displacement field; cached coverage confines blur to the
lens and restores the original pixels outside it. No clone, screenshot or pixel
readback is involved. Bound the source to 1.5 million CSS pixels or less; larger
sources (or axes over 4096px) remain unfiltered. The browser still processes this bounded source graphic,
so a small map does not make a huge DOM source cheap.

An optional `refractionTarget` switches to a lens-sized filter over an explicit
presentational target. It does not clone the enclosing scene or read its pixels. The source window moves
inversely to the normalized lens position; cached map generation depends on shape
and dimensions, not x/y, target progress, source container size or press scale.
The compact curved-cap model lives in `glass-lens-optics.ts`. One quadrant is
computed and signed vectors are mirrored. DOM and video use the same curved
shoulder; a narrow explicit track source produces the source-colored rim and
panel-colored crescent directly through displacement. Normal controls no longer
run the multi-channel difference/weight/column-projection graph. The blue channel
stores a small, edge-confined transmission response; there is no black texture,
CSS border, or full-body gray wash. Cached diagonal glints retain the silhouette.
Padding includes the maximum ray excursion. At most 2× map resolution,
1.5M storage pixels and 12 cached bundles are retained.

Only a completed slider requests the optional source-mixture reflection. It uses
seven SVG primitives over the existing small SourceGraphic: map, coordinates,
area blur, projection, opacity, mask and composition. Its 1.1px rim mixes actual
RGB, including gray and the surrounding plane. There is no CPU histogram or
additional capture. Normal sliders, switches and selection indicators omit it.
The switch's explicit fill occupies 95% of track width and 75% of track height.
Its source color mixes continuously with drag progress. Refraction supplies the
colored edge; it is not a uniform primary-colored outline.

Slider/switch thumbs rest solid. `engaged` opens and contracts the optical cap
using the same 220ms scale/material transition. The cap remains visible through
the complete contraction; transition completion releases its source/filter/slot,
with a 260ms timeout as a safety net. Native thumbs hand back immediately, without
a second opacity transition. There is no compact black shade texture/layer.
Maps decode
before reveal and are reused through the press. Pointer switch travel uses a
400ms spring and a matching 400ms settling window; keyboard travel is zero. Tabs/groups
keep one selected glass pill and use a 500ms spring with retained velocity when
retargeted. A scale envelope shares that travel frame: it grows during movement
and returns to the item's normal dimensions, staying glass. The source is
counter-scaled to retain label size. No per-frame map regeneration, extra frame
loop, hold/settle timer or material release is introduced.
Their persistent lens remains admitted until hidden/unmounted or deselected.
Slider dragging follows its native value immediately. Elastic endpoint release
returns over 180ms; endpoint offsets
are coalesced to one update per input frame. Value/position/offset changes reuse
the map. Only pointer gestures request the endpoint frame; there is no idle loop.
Visible and optical rails share the same thumb-center inset, including both
endpoints. `GlassSliderSource` supplies the same 17/6× optical track in the
playground; its visible text and rail remain ordinary DOM. The single lens
slider projects a single bounded area mixture over both axes around its full rim
at maximum. It latches the pointer coordinate when max is first reached, even
after a large pointer jump. A further 14px of input returns to local columns;
returning within 8px restores the full rim. This changes the light graph only,
not its cached geometry or source. There is no fixed purple ring.

Switch dragging uses a captured pointer and the rendered track scale. Movement
is direct while held; release commits the side beyond halfway exactly once,
suppressing the following pointer click. Cancellation clears the gesture and
restores the checked side. Pointer travel then retains its ordinary spring and
contraction. A bounded 8px elastic offset at either end uses the same translated
frame; drag state and source color stay clamped. Keyboard and native form
semantics stay with Radix.
`opticalIdle` is an explicit inspector override, false in normal controls.
The homepage exposes this as Inspect active state. No idle frame loop remains.

The compact renderer translates an outer frame and scales an inner cap. CSS
scale can no longer multiply the position offset. Optical roots ignore pointer
events and sit above the local track; keyboard focus remains visible. Positional
effects depend on coordinates, not React child/target object identity, so source
rerenders do not restart spring travel or delay the slider.

`GlassFilterManager` reuses one live graph on Chromium/Firefox. Position/source
changes do not clone its SVG definitions. WebKit, including iOS browsers, keeps
the fresh-ID-per-paint workaround and at most two definitions. This removes
per-frame graph allocation from the Chromium drag path, while retaining bounded
source paints and cached displacement textures. Native platform timing remains
separately unmeasured; structural savings are not a frame-rate certification.

## Video compositor

`GlassVideoPlayer` consumes a same-origin or CORS-enabled `src` and optional
poster. It uses the compact renderer's cached map in one transparent WebGL canvas
over the native video. Four non-overlapping control regions share one admitted
budget slot, one decoded video and one texture upload per rendered frame. Texture
units, uniforms and geometry buffers are reused. Canvas resolution is capped at
1.5 DPR / 1.5 million pixels. Frame callbacks are capped at 30 updates per second;
paused video has no continuous frame loop. Seeking and resizing draw on demand.
Offscreen/document-hidden media pauses. Context loss, reduced transparency and
unavailable WebGL preserve functional native video controls.

The flower demo mounts on demand, starts paused and uses a local 960px-wide,
30fps, silent clip (1,597,102 bytes). Credit remains with the Aave reference demo.
It is not fetched by the default Slider example. Native Safari and physical
device behavior still require separate platform review before broad claims.

The Target lens and Original DOM renderers in `/lab` reports map revisions during 120 frames of
motion; a settled run should report zero map revisions. This revision has not
been benchmarked in the local browser; no tests were written or run.

## Portals and source coverage

Overlay surfaces verify that their actual bounds fit inside their bounded scene.
A dropdown above the dock, for example, lies outside the dock's source. Such a
portal releases its SVG slot/mirror and uses ordinary CSS backdrop blur over the
real page. It must not report scene refraction while sampling an empty region or
leave unrefracted text visible through a transparent source. No whole-page DOM
capture is introduced. Bounds are observed on layout, scroll and position changes,
without an idle polling loop. Menus keep content scrolling in a separate viewport;
optical sampling margins never belong in that scrolling container.

The homepage's on-demand profile menu portals into its own small scene host.
The profile's visual DOM stays bounded to 380 × 264px. The menu filters an explicit
aligned copy of that visual source in its own lens-sized viewport with 1.12× zoom
and 0.5px blur. The source function is shared with the visible profile; it performs
no scene capture. Sharp native menu rows render above it. Material and rows share
one trigger-origin CSS entrance/exit transform; no displacement map is regenerated
for opening scale. Native Radix wrapper positioning supplies source coordinates,
with resize/position/scroll observers and no idle polling. Opacity crossfades the
ready lens while the readable fallback softens behind it. Reduced transparency
uses the solid fallback; reduced motion removes travel and fades.

`GlassLensButton` likewise aligns an explicit target using source geometry only.
Its ResizeObserver is event driven; the complete button scales through CSS and
keeps cached maps. The two-button example requests two lenses, so the homepage
with its intro/dock requests four at most; admission still caps this at five/fine
or three/coarse. The menu example has the same upper request count with its
lens button trigger and open menu. No document-wide filter or capture is added.
