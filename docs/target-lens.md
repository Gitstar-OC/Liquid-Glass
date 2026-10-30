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

`x`/`y` are normalized across available travel. Position changes move the
filter window and its source together, without rebuilding a map. The lens stays
at those coordinates until the caller changes them; hover does not move it.

One curved displacement field serves DOM and video. It bends the track's actual
purple or gray pixels toward the edge and reveals the surrounding panel just
inside that edge. Those white crescents are transmitted source pixels. A thin
map-encoded transmission response and two diagonal neutral glints define the
shoulder; there is no painted white cap, CSS border or broad gray surface wash.
Outside coverage, the original DOM remains unchanged.

## Rest and active states

A control's resting thumb is solid. A pointer press reveals an expanded optical
cap; release reverses the same 220ms scale and material transition. The optical
cap stays mounted through contraction, returning to the solid material before
handing back to the native thumb. It does not fade away halfway through shrinking. This is not a
permanently transparent thumb. The reference screenshots of large glass handles
represent the active state.

- `GlassSlider appearance="lens"`: 44 × 22px resting thumb, 64 × 32px active cap,
  6px visible track. The explicit optical target enlarges that track's short
  axis to 17px (17/6×), preserving the value position and smooth rounded fill endpoint.
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
- `GlassSwitch`: 74 × 28px track, 44 × 22px resting thumb, 64 × 32px active cap.
  The small variant uses 56 × 22px / 32 × 18px / 48 × 26px respectively. Pointer
  travel uses a bounded spring; it remains liquid through settling, then rests.
  Its optical target is 95% of track width and 75% of track height on the
  actual panel. The source color mixes continuously during a drag. The visible
  track keeps its original dimensions. Normal source-colored arcs come directly
  from displacement, with no separate color-estimation filter.
  Hold and drag horizontally to change sides. Drag motion is direct; release
  commits the side beyond halfway once, then settles. A cancelled drag restores
  the checked state. Dragging past either end adds up to 8px of resistant lens
  travel; the state stays clamped. Release springs the cap back before contraction.
  Click and keyboard activation remain native Radix actions.
- Single-selection tabs/groups keep the selected indicator glass after travel.
  An explicit target uses a pill 8px wider and 28px taller than its item and a
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
  lens={{ lensW: 64, lensH: 32, borderRadius: 16 }}
  x={handlePosition}
  engaged={pressed}
  restScale={{ x: 44 / 64, y: 22 / 32 }}
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
| `rimStrength`           |         0.61 | 0–1.5, rim light / completion reflection             |
| `edgeHighlight`         |         0.39 | 0–1                                          |
| `specularAngle`         |           45 | −180–180°                                    |
| `magnification`         |            1 | 1–5, interior source zoom; slider preset 17/6 |

Supply these in `parameters`. Slider, switch and selection presets share the
model, with a gentler slider and zero slider chroma. The switch uses 0.45px
transmitted blur to keep the source-plane crescents distinct. `chroma` is a normalized
control mapped to a restrained red/cyan dispersion; it adds a displacement pass.
The playground exposes geometry/optical controls (Rim light replaces
the misleading Glow label) and the actual map.
Its selectable-text preview uses `GlassSliderSource` for the same explicit
17/6× track optics as the slider, with an unscaled visible rail and selectable
original text. Magnification changes the optical source's short axis; the map
preview shows the neutral-center map actually used, without applying zoom twice.
Its Scene glass tab retains the separate bounded-scene renderer.

`rim="column"` uses the source-colored shoulder produced by displacement. It
adds no color-extraction graph. `rim="dominant"` adds a small optional area-mixture
pass, used by the completed slider. Its 1.1px mask projects original source RGB
around the lens, including neutral pixels. It does not estimate a brand hue or
replace gray with black. `rim="none"` skips this optional completion treatment.

The photo popover uses a small aligned visual target inside the native menu,
with 1.12× source magnification and 0.5px blur. The lens and labels enter together
from Radix's trigger origin and close toward that origin. Foreground labels stay
sharp. Native menu scale never changes the map geometry. The video keeps its
shader, source, controls and map response.

### Presets and optical controls

The playground offers Slider, Switch, Surface and Magnify presets with a short
explanation under every control. Surface starts at 70 × 60px, radius 22, with the
provided scale .041, depth 17, curvature 47, splay 1, chroma .27, blur .5, rim
light 1, edge highlight .46 and angle 53. This is a local tuning preset, not a
claim that identical parameter units reproduce a private implementation.

Magnify enlarges the original source by 1.25× with a gentler shoulder. Surface
uses 1.12× zoom; track presets enlarge their explicit fill instead. They all use
one map generator. Scale/depth/curvature/splay shape the bend, chroma separates
channels, blur softens source pixels, rim light and edge highlight finish the
edge, and angle rotates its neutral glints. No preset creates an emissive glow.

### Lens buttons

`GlassLensButton` uses this same field, native button semantics and sharp labels.
The entire control scales on press. Its optional source alignment is geometry
only; it never captures or clones the provided element:

```tsx
<div ref={source}>
  <Backdrop />
  <GlassLensButton sourceRef={source} refractionTarget={<Backdrop />} onClick={save}>
    Save changes
  </GlassLensButton>
</div>
```

Keep that source bounded. The default button uses its own local fill when no
explicit target is provided. Each ready button counts against the shared budget.
The homepage mounts only the selected example, including the new two-button scene.

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
