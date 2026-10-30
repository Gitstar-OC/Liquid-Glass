# Control lens

`GlassLens` bends the actual painted pixels of its bounded DOM children. Text stays
selectable, links stay clickable, and input state survives motion. It uses no
screenshot, scene clone or CPU pixel readback. An explicit `refractionTarget` can
instead keep a frequently moving control's filter source lens-sized.

```tsx
<GlassLens
  lens={{ lensW: 96, lensH: 57, borderRadius: 28 }}
  x={position.x}
  y={position.y}
  parameters={{ depth: 17, blur: 1, chroma: 0 }}
  rim="column"
  className="h-64 w-full"
>
  <YourContent />
</GlassLens>
```

`x`/`y` are normalized across the available travel. The cached rounded-rectangle
map uses a low-slope shoulder for sharp DOM fills. Its amplitude is bounded
against shoulder width, corner radius and source magnification so a source
boundary does not fold back into a second contour. White regions are source
pixels, not painted highlight bands. Compact DOM lenses do not darken those
pixels with a transmission multiply. The blue map channel remains available to
the separate video backend. There is no black texture or CSS border. Outside
coverage, the original-DOM source stays unchanged.

## Rest and active states

A control's resting thumb is solid. A pointer press reveals an expanded optical
cap; release reverses the same 220ms scale and material transition. The optical
cap stays mounted through contraction, returning to the solid material before
handing back to the native thumb. It does not fade away halfway through shrinking. This is not a
permanently transparent thumb. The reference screenshots of large glass handles
represent the active state.

- `GlassSlider appearance="lens"`: 64 × 34px resting thumb, 96 × 52px active cap,
  8px visible track. The explicit optical target enlarges that track's short
  axis by 3.2×, preserving the value position and smooth rounded fill endpoint.
  The visible and optical rails both span the thumb's center-to-center travel,
  so the fill endpoint stays under the lens near the start and end.
  `lensParameters.magnification` adjusts this source zoom (1–5). The map center
  stays neutral for this control. Other slider appearances keep their compact dimensions. Only the
  manipulated thumb becomes liquid. Alignment is preserved at both endpoints,
  with multiple thumbs, vertical orientation, inversion and RTL.
  Pointer travel follows the native value directly, without delayed optical
  follow. Pulling beyond an endpoint adds up to 12px of
  resistant optical travel; the native value stays clamped. Release returns the
  cap over 180ms while it contracts. Keyboard changes remain immediate.
  At the maximum, a single lens-appearance thumb uses the bounded source mixture
  around its complete rim, using one area-mixed source sample projected over
  both axes. Completion is latched at the pointer position where max is first
  reached. A further 14px of pointer travel returns to local column highlights;
  returning within 8px restores the full rim. Large input jumps cannot skip the
  complete state. No fixed purple outline is painted.
- `GlassSwitch`: 72 × 28px track, 42 × 22px resting thumb, 68 × 36px active cap.
  The small variant uses 56 × 22px / 32 × 18px / 50 × 28px respectively. Pointer
  travel uses a bounded spring; it remains liquid through settling, then rests.
  Its optical target uses a centered fill at full track width and 75% track height,
  on the actual control plane. The visible track keeps its original dimensions.
  Gentle inward displacement preserves one source boundary. `rim="column"`
  extends the source-colored edge up to 1.1 CSS pixels where a column contains
  color. A stronger neutral response preserves the edge when switched off.
  It does not paint the whole perimeter with the primary color.
  Hold and drag horizontally to change sides. Drag motion is direct; release
  commits the side beyond halfway once, then settles. A cancelled drag restores
  the checked state. Click and keyboard activation remain native Radix actions.
- Single-selection tabs/groups keep the selected indicator glass after travel.
  An explicit target uses a pill 8px wider and 16px taller than its item and a
  500ms spring that preserves momentum when interrupted. It grows during travel
  and returns to the item's normal dimensions while staying glass. Source
  counter-scaling keeps the highlighted labels at their original size. Keyboard
  and reduced-motion changes use normal dimensions immediately.
- `opticalIdle` on a slider/switch pins the active material for an inspector.
  It defaults to false and consumes an optical budget slot while enabled.
- `lensParameters` on either control adjusts the same shared optical model.

For a custom explicit-target control, use `engaged` and `restScale`. Rest scale
also accepts independent `{ x, y }` dimensions:

```tsx
<GlassLens
  lens={{ lensW: 96, lensH: 52, borderRadius: 26 }}
  x={handlePosition}
  engaged={pressed}
  restScale={0.65}
  refractionTarget={<TrackFill progress={progress} />}
>
  <SliderTrack />
</GlassLens>
```

Keep handlers, IDs and native semantics on the original controls. The target is
inert and hidden from assistive technology. Paint the complete control plane in
that target (including its background), so an unbent track cannot show through
transparent gaps. Set `--glass-lens-plane` to the actual flat control plane color.
This target does not capture an arbitrary photo or the surrounding document.

For ordinary navigation, supply one options list. The component builds the inert
highlighted copy and keeps the original Radix buttons interactive:

```tsx
<GlassToggleGroup
  liquid
  type="single"
  options={[{ value: "library", label: "Library" }, { value: "recent", label: "Recent" }]}
  value={section}
  onValueChange={(next) => next && setSection(next)}
  aria-label="Section"
/>
```

Each option also accepts an `icon` node and `disabled`. `itemClassName` is shared
by the native item and its visual copy. Existing children and explicit
`refractionTarget` composition remain supported.

## Optical controls

These are local renderer units, using the supplied reference values as a starting
point. They are not a claim of equivalence to Aave's private implementation.
Geometry is in CSS pixels; radius is bounded to half the smaller dimension.

| Parameter               |      Default | Range                                        |
| ----------------------- | -----------: | -------------------------------------------- |
| Width / height / radius | 96 / 57 / 28 | Geometry                                     |
| `scale`                 |        0.089 | 0–0.3                                        |
| `depth`                 |           17 | 0–40                                         |
| `curvature`             |           58 | 1–100                                        |
| `splay`                 |         0.89 | 0.2–2                                        |
| `chroma`                |         0.38 | 0–1                                          |
| `blur`                  |            1 | 0–5px                                        |
| `rimStrength`           |         0.61 | 0–1.5, source-colored rim energy             |
| `edgeHighlight`         |         0.39 | 0–1                                          |
| `specularAngle`         |           45 | −180–180°                                    |
| `magnification`         |            1 | 1–5, interior source zoom; slider preset 3.2 |

Supply these in `parameters`. Slider, switch and selection presets share the
model, with a gentler slider and zero slider chroma. The switch uses 0.45px
transmitted blur to keep the source-plane crescents distinct. `chroma` is a normalized
control mapped to a restrained red/cyan dispersion; it adds a displacement pass.
The playground exposes geometry/optical controls (Source rim strength replaces
the misleading Glow label) and the actual map.
Its selectable-text preview uses `GlassSliderSource` for the same explicit
3.2× track optics as the slider, with an unscaled visible rail and selectable
original text. Magnification changes the optical source's short axis; the map
preview shows the neutral-center map actually used, without applying zoom twice.
Its Scene glass tab retains the separate bounded-scene renderer.

`rim="column"` keeps neighboring source columns separate for sliders/navigation.
`rim="dominant"` is an optional full-area color estimate for custom lenses.
Explicit targets weight each pixel's contrast to their actual flat source plane.
This preserves gray tracks as well as colored tracks, instead of weighting only
saturation or letting the surrounding black/white space overwhelm them. Original
source RGB is mixed; the contrast field controls contribution, never the output
hue. Original-DOM mode, which has no known flat plane, retains chroma weighting.
The crisp color pass is composed after transmitted blur with no RGB darkening.
This is a bounded weighted estimate, not an exact color
histogram or Aave's private switch implementation. Use `rim="none"` to omit the
extra source-light passes while retaining inward displacement.
Column mode projects both source hue and its unnormalized contribution.
That energy chooses rim height: content-bearing columns occupy a band bounded to 1.1 CSS
pixels; the neutral plane retains a 0.65px profile. These widths cap further on tiny
lenses. They do not grow with a drawer's or panel's height. A neutral density floor
keeps gray/off-state sources visible; it is excluded when deciding to widen the band.
The source-color band has a constant profile and a 0.7px antialiased edge, rather
than the long falloff that resembled an inset shadow. It is not a uniform-opacity
brand-color ring. Generic lenses can opt into map-based interior magnification;
the switch retains the default neutral center.

Two restrained neutral-gray glints follow the same cached contour, strongest
on the upper-left and lower-right shoulders. They keep the lens visible on a
plain white or black plane. A 6% neutral surface reflection gives the clear body
some presence on dark planes. There is no CSS border or shadow, and pointer
gestures do not show the solid thumb's keyboard focus outline inside the lens.

`opticalProfile="media"` selects the same stronger displacement field used by
the video shader. The photo popover uses this with 1.18× source magnification and
0.5px blur; its foreground labels remain outside the filtered DOM. The video
compositor keeps its existing profile, transmission, settings and shader.

Legacy `strength`, `blur`, `chroma`, `curvature`, `splay`, `feather` and
`optics.lightAngle` inputs remain mapped for compatibility; prefer `parameters`.
The old `parameters.glow` name maps to `rimStrength` for compatibility; it never
adds white light. Other `GlassOptics` fields belong to `GlassSurface` and do not tune this compact
model. `glint` still scales the reflection layer. `duration` (0–600ms), `motion`
(spring/ease/smooth) and `scale` (1–1.4) control travel and press presentation.
Spring travel preserves current velocity when interrupted. `smooth` remains an
optional easing for custom lenses. `offsetX`/`offsetY` add bounded
elastic travel in CSS pixels (−48–48) without changing the source, normalized
value or cached map. Reduced motion suppresses those offsets.

`settledScale={{x, y}}` lets a persistent explicit-target lens return to smaller
dimensions after moving, staying glass. Travel and scale share one bounded
animation frame; source coordinates counter-scale to preserve label size. The
geometry/map is reused throughout; there is no timed material release.

## Rendering and bounds

- One quadrant is computed and signed vectors are mirrored. Small maps use up
  to 2× resolution with a 1.5M-pixel allocation cap and a 12-bundle LRU cache.
- Position, progress, source mutations and press scale reuse maps. Geometry or
  optical-parameter changes regenerate them. Chromium/Firefox update one live
  filter graph; WebKit paints use a fresh ID, retaining at most two definitions.
- A translated outer frame carries a separately scaled optical cap. Position and
  inverse-source transforms stay synchronized; scaling cannot shift the thumb's
  position. Source-node identity changes do not restart positional animation.
- Give the wrapper explicit dimensions. Original-DOM sources are limited to
  1.5 million CSS pixels and 4096px per axis; larger content stays unfiltered.
  The browser filters the entire bounded source, so keep its DOM small.
- Both modes share the five/fine or three/coarse budget. Idle controls release
  their source/filter when the 220ms contraction ends (260ms safety timeout).
  Persistent selected navigation retains one admitted slot at rest.
  `active={false}` releases immediately
  without unmounting original children. No idle animation loop runs.
- Reduced transparency/high contrast retain the solid control. Reduced motion
  removes spring travel and scaling. Disabled/cancelled controls stop gestures.
- Live video filtering differs in Safari. This component does not provide a
  WebGL video/canvas backend. DOM observers cannot detect arbitrary canvas draws.
- `/lab` measures Original DOM/Target lens source size, map reuse, frame intervals
  and budget behavior. Desktop viewport emulation is not a physical phone test.

The architecture follows [Aave's original-DOM, explicit-target and cached-map
principles](https://aave.com/design/building-glass-for-the-web). The renderer and
optical model are local code.
