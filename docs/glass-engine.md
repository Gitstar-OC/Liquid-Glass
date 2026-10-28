# Glass engine

The playground at `/playground` exercises one adjustable lens over a complete,
interactive DOM scene. This is a web renderer inspired by curved glass; Apple's
private compositor and shaders are not available here.

## Full-scene source

```tsx
<GlassScene content={<YourInteractiveScene />} className="relative h-[560px]">
  <LiquidGlass
    radius={26}
    config={{ depth: 60, splay: 2, feather: 24, curve: 2, blur: 0, chroma: 0 }}
    className="absolute left-24 top-32 h-44 w-60"
  >
    <YourSharpInteractiveContent />
  </LiquidGlass>
</GlassScene>
```

`GlassScene` provides the complete bounded backdrop. An existing container can
instead be supplied with `sceneRef={containerRef}`. Every lens sharing that
container uses one scene observer and computed-style snapshot.

The engine creates an inert visual mirror of the whole source subtree, including
text, images, cards, form values, SVG, open shadow content, nested scrolling,
canvas frames, and playable video frames. It removes glass surfaces, scripts,
embedded browsing contexts, and elements marked `data-glass-ignore`. It scopes
mirrored IDs and references, removes form names and event attributes, and freezes
animations at their sampled presentation values. The real source stays interactive.

The browser paints the complete mirror into the SVG filter's `SourceGraphic`
image. This captures the DOM together with its background photo; it is not an
image-only backdrop, and does not serialize a page into `foreignObject` or an
asynchronous screenshot. A padded, lens-sized paint viewport bounds filter work.
The mirror offset tracks the lens, source container, window scroll, and resize.

DOM changes, input/change events, nested scrolling, media playback, font loading,
ancestor theme changes, and hover/focus presentation trigger synchronization.
Running CSS animations are sampled on the main thread. For imperative canvas or
WAAPI updates, call `invalidateGlassScene(source, { target, immediate: true })`
after updating the original. Immediate mode keeps a JS animation and mirror in
the same paint, subject to the source frame-rate limit.

## Filter and optical layers

1. A PNG displacement map encodes the rounded surface's refraction normals.
2. `filter: url(#id)` displaces the full painted source image. It does not rely
   on SVG `backdrop-filter`, which is unavailable in WebKit.
3. A separate parent wrapper applies adjustable blur and color correction.
4. Tint and directional reflection/shade textures sit above the source.
5. An inner `clip-path: inset(0 round radius)` clips all optical layers in WebKit,
   while the outer surface retains its shadow. Foreground children stay sharp.

A fresh filter node and ID are installed whenever the scene beneath the lens or
its geometry changes. This addresses Safari's cached filter output. The housing
retains at most two definitions for handoff. PNGs are decoded before map swaps;
outdated asynchronous results are discarded. See the supporting
[Aave implementation notes](https://aave.com/design/building-glass-for-the-web).

Zero chromatic aberration uses one displacement pass. Optional chromatic
aberration uses two passes, red and cyan, instead of three RGB passes. The
playground starts at zero. Tint defaults to multiply blending, with an explicit
`tintBlendMode` override.

The optical model uses an analytic rounded-box normal and Snell refraction over
an elliptical bevel. PNG byte 128 maps to exactly 0.5 in the SVG transfer function,
so the flat center stays neutral. Geometry/refraction is computed once per
quadrant; reflection is lit separately for each mirrored normal. Optical controls
include index, thickness, light angle, and roughness. `depth` is a CSS-pixel
filter displacement scale, not physical thickness in millimeters.

## Scheduling and limits

- Static scenes stop scheduling frames. Mutations are coalesced, while updates
  outside a lens's sampling region avoid unnecessary filter invalidation.
- Hidden/offscreen lenses suspend capture. The default source limit is 60 fps
  on desktop and 30 fps for coarse pointers; set `frameRate` to lower it.
- Movement repositions the existing mirror and refreshes its filter ID without
  regenerating displacement maps. Only geometry/optical changes rebuild textures.
- Each texture is capped at 1.5 million pixels. Geometry textures and decode
  promises have bounded caches of 24 entries. Public numeric inputs are clamped.
- Reduced transparency or increased contrast uses an opaque surface.

Use a deliberately bounded container. Automatic whole-document virtualization,
large-page caching, and arbitrary transformed coordinate spaces are not
implemented. A source with perspective or rotated ancestors requires an explicit
untransformed capture container. Closed shadow roots, iframes, browser-native
popups, protected video, and CSS content outside the supplied source cannot be
reconstructed. Pixel sampling of cross-origin media still obeys browser security.
Programmatic form-value changes that emit no events need explicit invalidation.

The legacy `backdropRef` image source and Chromium native-backdrop fallback remain
available for existing consumers. Prefer `GlassScene`/`sceneRef` for full DOM.
GlassSurface now uses adaptive ink by default, with optional per-surface protection.
It reads the original source DOM, so inert sources and pointer-events:none layers
remain sampleable. Color tokens are scoped to the surface and inherited by shadcn
children. Sampling pauses offscreen, accounts for group opacity and lens color
controls, and uses a conservative fallback for unavailable media and CSS URL paints.
It is an estimator: it does not read the final filtered GPU image and cannot
guarantee contrast for every possible background. See README for controls and limits.

## Verification

Unit coverage includes optical geometry, map caching, exact neutral encoding,
filter lifecycle/pass counts, scene cloning, input/scroll synchronization, SVG
reference isolation, static scheduling, and shared-scene cleanup. Browser review
covers editable source text, sharp foreground interaction, dragging, and lens
collapse/expansion. A production build passes. Safari and Firefox visual parity
still need a native-browser pass; cross-browser architecture is not a claim of
verified pixel parity with Apple's native renderer.
