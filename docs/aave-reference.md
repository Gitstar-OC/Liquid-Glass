# Aave control reference, 2026-10-30

Source: [Building Glass for the Web](https://aave.com/design/building-glass-for-the-web).
Inspected the live switch, slider and navigation DOM, computed styles, visible
states and SVG filter graph. The attached screenshots show expanded interaction
states as well as the compact white resting thumb.

## Measured geometry

| Surface | Rest | Expanded | Context |
| --- | --- | --- | --- |
| Switch | 74 × 28px track; 44 × 22px thumb | approximately 64 × 32px cap, with spring overshoot | 158 × 82px white panel, 25px corners |
| Slider | 6px rail; 44 × 22px thumb | approximately 64 × 32px cap | supplied screenshot: 324 × 76px panel; 240px rail |
| Navigation | 46px rail; approximately 40px selected pill | taller traveling lens | 100px panel; label widths vary |

The live article adapts its slider width to the viewport; the inspected narrow
viewport used a 200px rail. Navigation also adapts its visible options. These
are CSS pixel measurements, not dimensions inferred from a scaled screenshot.

## What produces the appearance

- The switch filters a separate fill on the actual panel color. During the
  inspected transition its source approached 95% of track width and the full
  21px source height. Its resting source is smaller and hidden by the solid thumb.
- The slider's optical source is taller than the 6px visible rail (17px before
  its interaction transform). The value remains backed by a native range input.
- The white crescent is panel content displaced inside the lens. It is not an
  emissive white gradient painted on top.
- The published DOM graph displaces source RGB, applies map-encoded transmission,
  and restores the original content outside the lens. It contains no primary-color
  histogram or column-color extraction graph. The colored edge can arise from
  the same track pixels that form the body.
- The reference also has a small dark transmission overlay and interaction
  shadows. This implementation uses source transmission and restrained neutral
  glints; it does not recreate a broad inset shadow as the colored rim.

## Local implementation boundary

The DOM and video controls share the local curved map generator. A normal
switch, slider or selected tab has no extra color-estimation graph. The optional
complete-slider reflection is a small source-mixture pass. Position and value
changes reuse geometry textures. Pointer hover does not change lens position;
sliders move on native input, switches on activation/drag, and navigation on
selection. The playground lens moves only while captured or by arrow keys.

The approved video's shader and media controls retain their existing rendering.
Other routes and installable glass registry entries remain in place. Only files
unreachable from all app routes and registry source roots were removed.

This is an independently implemented model based on public reference behavior.
Local visual comparison and physical-device timing remain unmeasured because
browser access to the development URL was denied. No tests were written or run.

## Follow-up: supplied surface tuning

Surface and Magnify are now exposed as presets of the shared map generator.
Surface uses the supplied 70 × 60px / 22px radius geometry and .041 / 17 / 47 /
1 / .27 / .5 / 1 / .46 / 53° controls. Its 1.12× interior zoom and the gentler
1.25× Magnify preset can be explored over the original image/text source.
Every playground field includes a description. Switch geometry/optics remain
unchanged; only an 8px resistant endpoint offset was added. Slider depth changes
from 4.5 to 5.5 solely to bring its existing 17px source into the top/bottom
shoulder. The neutral center, visible rail and native value travel stay the same.

The menu uses an aligned explicit profile target so that lens and native rows
can share the trigger-origin entrance/exit transform. This replaces filtering
the profile in place beneath independently appearing menu labels. New lens
buttons use that same explicit-source model over the existing image assets.
