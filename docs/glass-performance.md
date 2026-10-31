# Glass performance rules

## Budget and rendering modes

The document-wide runtime admits at most **5 visible independent lenses on fine
pointers** and **3 on coarse pointers**. A provider can request a lower limit:

```tsx
<GlassSettingsProvider performance={{ maxActiveSurfaces: 3, frameRate: 30 }}>
  {children}
</GlassSettingsProvider>
```

The device cap still wins. Modal/overlay lenses have priority 10, control/selection
lenses 8, and media/image controls 7. The dock uses 2, static glass buttons 1 and
background cards 0. This prevents the two intro links and dock from filling all
three phone slots ahead of the selected example. Offscreen and document-hidden lenses release their mirrored DOM/filter
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
  The homepage mounts the active content of five interaction tabs, two small
  compact intro links and a fixed dock. Lower examples mount only when their
  individual sections enter the viewport. A pressed or inspector-pinned control adds
  one compact lens; selected navigation keeps that one slot at rest. Scrolled-out
  intro links release admission. The device cap still wins.
  Sources stay separately bounded.
  The Video example uses one admitted WebGL compositor for its four disjoint
  control shapes, one video texture upload per rendered frame, and cached maps.
  It does not register each button or build scene mirrors for video.
- Use one bounded `GlassScene` for related panels. Keep unrelated page sections
  outside that source. Do not mirror an entire document by default.
- Put text/images/forms in the explicit source. Put interactive glass in children.
- Use a single parent panel for a form, toolbar, player, or settings group.
- Mount only the active interaction tab and viewport-visible lower examples on
  the homepage; the gallery mounts only its active example. Unmounting
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
- Explicit reduced transparency and forced-color palettes select the opaque
  accessible fallback. Higher contrast keeps glass and strengthens readability.
  All backends share this distinction through `glass-preferences.ts`.

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

The homepage has no full-viewport atlas or animated scroll source. Five named
interaction tabs share the header's 896px maximum and gutters. Radix mounts one
panel at a time; a 420ms directional CSS entrance replaces scroll measurement.
Stages vary from 280px to 560px by component and viewport. Navigation/media
have wider local frames. Profile, Overlays and Details each show one lower
example at a time, releasing their content when outside the viewport.
Intro links use a tiny neutral source;
the fixed dock reads the native backdrop on supported Chromium versions and
falls back to local CSS blur elsewhere. Only the selected interaction mounts;
the same global optical budget governs all visible sections. Dynamic
music and elastic components load on demand, and audio is removed on departure.
The docs preview's refraction comparison changes displacement only. Landing
illustrations expose native component interactions without editing controls.
The six lower homepage examples use a plain, complete paper plane with one
centered trigger or card. Their frames are 400px high (420px on phones).
Overlays start closed; tooltip/hover-card triggers also support taps. No images,
file tables or asset-workspace DOM render in these homepage scenes. A source
mirror has just two authored source elements: its root and paper plane. The simple example family and
the richer docs/gallery workspace family load in separate dynamic chunks, only
when selected and visible. Closed overlays allocate no optical panel. The docs
inspector retains explicit pinning and its existing bounded file-scroll viewport.
There are no new renderers or background animation callbacks.
No idle RAF loop runs.
Clip the page's sampling margins so the bottom lens cannot extend scroll height.

The compact panel lens uses 0.35–8px blur and 1.04–1.12× source magnification,
with no source brightness boost. Its thin source-color band reuses the existing
cached rim PNG and bounded SourceGraphic through the existing colorBleed graph.
The narrow horizontal kernel preserves neighboring columns. The rim map's red
coordinate stays neutral while green projects its interior column to the rim.
Vertical diffusion is one sixth of the lens height, capped at 24px. This
enables the existing two-primitive coordinate/projection branch over the same
bounded SourceGraphic. Saturation and RGB gain remain at 1. Panels use a 1.6px
source-color band and 1.25px tonal bevel; tooltips retain their 1.1px shoulder
and also use interior column projection. Legacy surface callers keep their defaults. No
new map, source capture, CPU readback, whole-page mirror or idle animation is
added. Slider/switch and video maps omit the new geometry options.
Background softening stays inside the SVG transmission pass, before the colored
edge is composed; no outer blur softens the rim.
Compact panels choose `rimSource="displaced"`: their existing color graph reads
the already magnified, unblurred transmission rather than the unbent source.
This changes one existing primitive's input. Other panels keep their primitive
count; tooltips add the same two coordinate/projection primitives at their small
filter size. The thin
band uses 55% source coverage on tooltips and 80% on other panels. No dominant
hue is guessed, and a neutral plane remains neutral. Slider/switch, selection,
video and legacy scene renderers retain their previous inputs and parameters.
The optional non-refracting component family is deferred.

Toast uses this same compact panel field, with 8px blur and a 24px squircle.
Sonner retains timing, gestures, announcements and focus handling. The local
preview mounts one notification ID on demand, inherits its bounded scene and
dismisses it on unmount. Global notifications may pass an explicit scene ref;
the source bounds check remains mandatory. Native backdrop support and the
lightweight fallback remain distinct. All notification lenses use overlay
priority within the existing document cap.

Positioning-wrapper state changes and completed animations/transitions schedule
one coalesced geometry measurement. This fixes stale source coordinates after
popover/menu/notification entrance without a motion-polling loop. Dropdown
foreground viewports scroll independently; the outer lens is not clipped by a
second scroll container.

The default playground hides its map preview and advanced dials. The map image
is generated only while requested. Its main lens retains the same cache; moving
it does not regenerate geometry. The Scene tab loads on demand and has one
main lens, removing the independent minimize-button lens. The scene starts
paused and retains document/viewport suspension.

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
Compact panels use 1.5× map storage resolution on desktop and mobile; controls,
video and tooltips retain 2×. This allocates about 44% fewer pixels for the same
panel geometry, before dimension rounding. Symmetric body rays now use the
quarter-map path even for joined bubbles. Only the pointer's small neighborhood
recomputes its asymmetric surface and ray. Pixel writes and cached texture
channels are unchanged. Reduced-transparency surfaces skip map generation.

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
keep one selected glass pill. Explicit highlighted options use a 1200ms spring
with retained velocity. Travel opens the lens by up to 4px width / 24px height;
a 205ms release softens contraction after positional arrival, and the final
180ms closes with a zero-slope envelope. Its real shape is
computed on a half-pixel geometry grid with the existing quadrant generator.
Only shape changes request maps; translation reuses the field and SVG graph.
Decoded map, rounded contour and reflection are accepted together, never stretched.
The highlighted DOM retains native dimensions. One bounded travel callback ends
on arrival, hidden-document changes, cancellation or unmount; no idle loop runs.
Their persistent lens remains admitted until hidden/unmounted or deselected.
The homepage dock uses one stationary `GlassPanel` with a shallow compact
field: 0.03 scale, 12px depth, 1.05× zoom, 6px blur and 24px rounded corners.
Four native square placeholders stay sharp, with an appearance divider and without
hover lift or press scale. Resize/position events update geometry, without an
idle frame loop, whole-page capture or per-item optical layer. The native
backdrop route is Chromium-only; the accessible fallback blurs the true backdrop
and retains the cached contour glint. Existing explicit-target and scene-backed
dock consumers retain their renderers. The homepage still has one dock slot.
It appears last in DOM order while staying fixed at the viewport bottom.
Slider dragging follows its native value immediately. Elastic endpoint release
returns over 180ms; endpoint offsets
are coalesced to one update per input frame. Value/position/offset changes reuse
the map. Only pointer gestures request the endpoint frame; there is no idle loop.
Visible and optical rails share the same thumb-center inset, including both
endpoints. `GlassSliderSource` supplies the same 21/6× optical track in the
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

## Mobile eligibility and automatic darkening

Dark mode and `prefers-contrast: more` are not renderer kill switches. All seven
backends share `(prefers-reduced-transparency: reduce), (forced-colors: active)`
for the solid fallback. The ordinary higher-contrast query changes readability
coverage without destroying maps, disabling refraction or rebuilding renderers.
The phone cap remains three; active examples outrank static navigation chrome.

The theme provider defaults new visits to System and retains stored choices.
Its pre-paint script works even when localStorage is unavailable. Hydration
does not replace the device's initial palette with the server's light snapshot.
Authored `only light` / `only dark` schemes prevent Chrome Auto Dark from
recoloring DOM input separately from PNG displacement fields or WebGL output.
This preserves the app's own dark theme rather than adding an inversion pass.

`data-glass-fallback` records the selected fallback path on compact controls,
selection, panels and media. It differentiates resting controls, accessibility
preferences, admission, bounds and pending render resources. These attributes
are diagnostic metadata and add no timer or visible implementation UI. ARIA
labels/hidden optical layers are unchanged. The native SVG backdrop check is
independent of DOM SVG and WebGL; its browser restriction cannot gate top-level
slider/switch/selection/video examples.

Sources: [contrast preference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-contrast),
[transparency preference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-transparency),
[authored color schemes](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme),
[Aave's DOM/WebGL paths](https://aave.com/design/building-glass-for-the-web).

## Portals and source coverage

Overlay surfaces verify that their actual bounds fit inside their bounded scene.
A dropdown above the dock, for example, lies outside the dock's source. Such a
portal releases its SVG slot/mirror and uses ordinary CSS backdrop blur over the
real page. It must not report scene refraction while sampling an empty region or
leave unrefracted text visible through a transparent source. No whole-page DOM
capture is introduced. Bounds are observed on layout, scroll and position changes,
without an idle polling loop. Menus keep content scrolling in a separate viewport;
optical sampling margins never belong in that scrolling container.

The profile example now portals a native popover into its 640 × 400px bounded
scene (380px high on phones). A local 720px transparent WebP illustration is
displayed in a 168px circular avatar (160px on phones) over an opaque paper plane.
One compact DOM lens refracts that composition at 1.12× magnification and 4px
blur; foreground actions
remain sharp. No separate WebGL context, custom image-coordinate observer or
whole-document capture is needed. The two actions edit the name or copy a link.
The menu starts closed and prevents autofocus on opening. Closing, scrolling out or unmounting releases
its source/filter work under the same document budget.
The Surface playground preset retains its supplied 0.5px blur; the menu has a
local 4px override. The former checkbox rows and per-image alignment observer
were removed from the profile demonstration.

`GlassLensButton imageRef` retains the video's shader and a displayed-image ref.
Its ResizeObserver is event driven; the complete button scales through CSS and
keeps cached maps. The two-button example requests two lenses, so the homepage
with its intro/dock can request five; admission still caps this at five/fine
or three/coarse. Lower visible examples share this same document cap.
No document-wide filter or capture is added.
The main image scene opens its real preview from either the entire image or
Preview. Copy link uses the actual local asset URL. Its compact DOM dialog adds
one admitted lens while open, sharing the existing bounded image source.
Workspace image/collection tiles likewise open one controlled native dialog.
Selecting an asset inside a collection replaces its dialog content instead of
opening another modal. The selected content survives the closing animation;
focus returns to the original tile without scrolling. Dialogs use 6px local
blur and a dim overlay, replacing the former full-overlay 6px backdrop blur.
Example tabs perform one initial visibility read before paint, then use the
existing IntersectionObserver; this makes newly selected controls available to
Tab immediately. No focus trap or custom Tab-key interception is added.
Image-backed fallback buttons use transparent 1.5px blur, never an 80% solid
plane. The active photo material uses 1.12× zoom with zero blur and the video rim;
it has no white body fill. Reduced transparency retains the opaque fallback.
