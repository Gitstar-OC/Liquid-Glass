# Performance and UI checks — 2026-10-25

## Environment and method

Local Next.js development server; this Mac’s in-app browser; 120 consecutive
animation intervals over a bounded DOM source with a moving marker. Local WebP
backdrops were loaded before measurements. No CPU throttling was applied.

The baseline was measured before the document-wide lens budget and geometry
no-op optimization. Its requested limit was ignored by the old renderer. Counts
are original lenses only: cloned lower panels are excluded from the active count.

These are individual diagnostic runs, not a statistically controlled GPU benchmark.
Frame intervals include browser scheduling, and filter refresh counts vary with
scheduling. Both versions already sustained approximately 60Hz here. The clear
improvement demonstrated below is bounded mirrors and DOM/filter work, not a
claim of universally improved frame rate.

## Desktop: 1280 × 720, requested limit 5

| Renderer | Mounted | Active / mirrors | Mirrored nodes | Filter refreshes | Median ms | P95 ms | Max ms | >25ms |
| -------- | ------: | ---------------: | -------------: | ---------------: | --------: | -----: | -----: | ----: |
| Before   |       3 |                3 |             24 |               83 |      16.7 |   16.8 |   17.6 |     0 |
| Before   |       5 |                5 |             40 |              124 |      16.7 |   16.8 |   17.7 |     0 |
| Before   |       8 |                8 |             64 |              248 |      16.7 |   16.8 |   17.7 |     0 |
| After    |       3 |                3 |             24 |               75 |      16.7 |   17.3 |   17.7 |     0 |
| After    |       5 |                5 |             40 |               96 |      16.7 |   17.3 |   17.7 |     0 |
| After    |       8 |                5 |             40 |               84 |      16.7 |   17.2 |   17.6 |     0 |

A live limit change initially exposed stale component state: reducing 5 to 3
kept old active flags. Registration now always publishes its initial state. A
regression test covers this case. Repeated browser checks after that fix:

| Viewport   | Mounted | Requested limit | Active / mirrors | Nodes | Refreshes | Median / P95 / max ms | >25ms |
| ---------- | ------: | --------------: | ---------------: | ----: | --------: | --------------------- | ----: |
| 1280 × 720 |       8 |               3 |                3 |    24 |        75 | 16.7 / 16.8 / 17.2    |     0 |
| 1280 × 720 |       8 |               5 |                5 |    40 |       102 | 16.7 / 16.8 / 17.3    |     0 |
| 390 × 844  |       8 |               3 |                3 |    24 |        89 | 16.7 / 17.1 / 17.7    |     0 |

The phone-sized run is a desktop viewport check with an explicit limit of three.
It does not emulate a phone GPU or coarse pointer. Unit tests separately cover
the coarse-pointer cap of three.

## Interaction and visual checks

- Homepage: save-draft confirmation, favorite pressed state, disabled button,
  profile editing/saving, preferences editing/saving, connectivity toggles.
- Power confirmation: independent `scene-svg` renderer, one captured lower glass
  panel, readable foreground, Cancel and Escape dismissal.
- Playground: numeric blur edits, quick blur selection, Lake/Dunes picker,
  keyboard lens movement, live source mirror.
- Homepage, gallery, and playground at phone width: no horizontal document overflow.
- Idle homepage lens: filter refresh counter stayed at 2 across separated checks;
  the offscreen lens had no mirror.
- Search: command input filters component results; power dialog Escape returns
  focus to its trigger.
- 320px layout: header overflow and clipped button states were found and fixed;
  the complete example fits the 560px phone stage.
- Shared registry: 45 items, 532 file installs resolved, no dangling imports.

The power-dialog check found a portal/context bug: dialogs inherited their
parent’s shared renderer. Overlay kinds now establish an independent optical
layer while inline controls continue to share. A composition test covers this.

## Remaining platform validation

Native Safari and Firefox, physical low-powered iOS/Android devices, and GPU
traces still need dedicated validation before promising platform-specific frame
rates. Reduced-transparency, high-contrast, cleanup, and visibility logic have
unit coverage; physical assistive-technology checks are a separate step.

## Automated checks

76 unit tests passed across nine files, with clean TypeScript and ESLint checks.
The optimized production build passed with `npm run build -- --webpack`.
Turbopack’s CSS compilation worker could not bind a local port in this execution
environment, including the elevated retry.

The outdated Playwright definitions were updated for the current homepage,
layered dialog, budget transitions, and phone overflow. The browser checks above
were performed through the app browser; the Playwright CLI suite was not run.

## 2026-10-26 — composed homepage and state transitions

The supplied wireframe replaces the single-example selector. The homepage now
shows a player, navigation, notification, buttons, song search, sound, sharing,
and a non-modal power panel together. They use five independent optical groups;
buttons, fields, sliders, and switches inside a group share its renderer.

Browser observations in the app browser:

| Check                                    | Observed result                                                                          |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1280 × 900 composition                   | 5 active lenses / 5 mirrors, 10 source nodes per mirror                                  |
| Separated idle snapshots after scrolling | Filter paint counts `[6, 6, 6, 6, 6]` stayed unchanged                                   |
| Drawer over the composition              | `scene-svg`; 2 captured lower glass layers; active count remained 5                      |
| 320 × 740 and 390 × 844 layouts          | No horizontal document overflow; readable controls retain their size                     |
| Phone drawer                             | Portal fits the visible canvas intersection; the stage itself does not scroll internally |
| Save, Like, Add pointer activation       | Interruptible 180ms transitions; blur limited to two tiny visual layers                  |
| Keyboard Like activation                 | `data-animate=false`, computed transition duration `0s`                                  |
| Source scrolling                         | Local photo planes change transform/opacity and appear inside the glass mirrors          |

Phone viewport checks used a desktop pointer. They do not measure a phone GPU
or establish physical-device performance; the coarse-pointer limit of three is
covered separately by the budget unit tests. No new FPS or GPU claim is made.

Functional checks covered player play/pause, song selection through the drawer
and command search, focus return to the actual drawer/search trigger, the power
preview's sleep/wake cycle, light/dark themes, and fixed/scrolling backdrops.
The speaker slider is connected to the HTML audio volume; its controlled-volume
behavior has a unit regression test. Photo planes include a neutral overlay to
help preserve text contrast in either theme.

85 unit tests passed across 12 files. TypeScript, ESLint, the optimized webpack
production build, and registry verification passed. The registry resolves
50 items and 606 file installs without dangling imports. Playwright definitions
were updated for the composed page; these browser checks used the app browser,
not the Playwright CLI. Native Safari/Firefox and physical touch-device motion
remain separate validation work.

## 2026-10-26 — full-screen individual surfaces

The homepage now has separate component silhouettes, a reusable dock, locally
hosted variable Manrope, and full-bleed background layers. There is no enclosing
glass preview frame, standard homepage header/footer, or optical settings strip.
The main panels receive priority 2; a deliberately held core button temporarily
uses priority 5, below modal priority 10. The document cap is unchanged.

Browser checks through the app browser:

| Check                       | Observed result                                                             |
| --------------------------- | --------------------------------------------------------------------------- |
| Desktop, 1280 × 900         | 5 live lenses, 5 mirrors, 10 source nodes per mirror                        |
| Idle after source scrolling | Filter paint counts `[7, 7, 7, 7, 7]` unchanged across separated reads      |
| Foreground stability        | Heading top stayed 265.47px at scroll positions 0 and 1440px                |
| Background source           | Full-bleed Lake/Dunes layers change; no rotated photo cards                 |
| Drawer over components      | `scene-svg`, 4 captured lower layers, 5 live independent lenses             |
| Sound shape                 | 20px radius; shared family with AirDrop                                     |
| Music controls              | Bare transport buttons; actual audio/track controls remain connected        |
| Dock                        | Documentation tooltip opens on keyboard focus; links have accessible labels |
| 320 × 740                   | Document width 305px including the reserved scrollbar; scroll width 305px   |
| 390 × 844                   | Document width 375px including the reserved scrollbar; scroll width 375px   |
| Phone drawer                | Bounds 12–293px horizontally, 456–728px vertically in a 320 × 740 viewport  |
| Power preview               | Shutdown shows Wake preview; wake restores the panel                        |

The narrowest layout initially exposed an 8px overflow from the lens sampling
pad. Horizontal `overflow: clip` on the scene stage fixes it without creating
an internal scrolling container. Button sizing also no longer inherits the
upstream icon-padding selector, which incorrectly matched the hidden optical SVG.

Count live lenses by excluding descendants of `[data-glass-mirror]`. Captured
lower layers retain their source diagnostic attributes; they are inert snapshots,
not additional registered renderers.

91 unit tests pass across 13 files. New regressions cover the hold threshold,
release, pointer cancellation, blur, lost capture, disabling, unmount cleanup,
instant keyboard states, bare playback buttons, shared segmented controls, and
priority admission without exceeding the device cap. TypeScript, ESLint, the
optimized webpack production build, and registry verification pass. The registry
contains 52 items and resolves 634 file installs without dangling imports.
The dock and icon set have installable entries and documentation. Development
registry reads refresh after generation, so newly added docs do not remain 404s.

Browser validation used desktop pointer input at phone-sized viewports; the
coarse-pointer cap is covered by unit tests. Native Safari/Firefox, physical
phones, and GPU timing remain separate platform validation. The Playwright
specifications were extended; this run used the app browser, not the CLI suite.

## 2026-10-26 — shared field, directional glints, and overlay isolation

The shared atlas uses the same SDF/Snell functions as the playground. The lab
now switches between independent and shared renderers without changing its
bounded DOM source. These 120-frame runs used this Mac’s app browser at
1280 × 720, after asset decode, without throttling:

| Backend     | Mounted | Requested limit | Active / mirrors | Source nodes | Refreshes | Median / P95 / max ms | >25ms |
| ----------- | ------: | --------------: | ---------------: | -----------: | --------: | --------------------- | ----: |
| Independent |       8 |               5 |                5 |           40 |        83 | 16.7 / 17.6 / 17.8    |     0 |
| Atlas       |       8 |               5 |                1 |            8 |        59 | 16.7 / 17.3 / 17.7    |     0 |
| Atlas       |       3 |               3 |                1 |            8 |        59 | 16.7 / 17.7 / 17.7    |     0 |
| Atlas       |       5 |               3 |                1 |            8 |        60 | 16.7 / 17.3 / 17.7    |     0 |
| Atlas       |       8 |               3 |                1 |            8 |        59 | 16.7 / 17.6 / 17.8    |     0 |
| Independent |       8 |               3 |                3 |           24 |        71 | 16.7 / 17.6 / 17.8    |     0 |

Both paths already met roughly 60Hz here. The demonstrated change is one mirror
covering every atlas shape, not a claimed frame-rate multiplier or phone GPU result.
The initial homepage field took about 38ms to generate at desktop size; maps are
bounded to 1.5M pixels and reused during source scrolling and finish changes.

The final homepage uses an atlas for the sibling silhouettes plus a small separate
elastic lens. A drawer adds one independent layer; the coarse-pointer cap remains
three. Hard CSS perimeter outlines were removed; directional optical reflections
remain. Slider/switch/segmented finishes use local CSS and add no mirrors.

A drawer regression was reproduced: Radix removed the scrollbar and applied
15px compensation, changing source width and rebuilding the atlas. With a stable
gutter and duplicate compensation removed, a repeat opening preserved the atlas
width at 1265px, heading top at 185.15625px, scroll at 0, and map build counter at

1. Escape restored focus to “Open library drawer”. The popover used 6px blur,
   kept the atlas map at 1, and its mute action changed the real speaker value to 0.

The theme path now updates the filter finish in place. Unitheme samples foreground
ink; Duotheme keeps the selected foreground while tint/blur change. This is a
readability behavior, not pixel access to cross-origin images without permission.

Physical phone GPUs, native Safari/Firefox, and GPU traces remain unmeasured.
The Playwright specifications were updated; interactive browser evidence uses
the app browser rather than a Playwright CLI run.

### Final interaction pass — capsule thumb and tooltip states

The switch track is a capsule, with a 28 × 22px elongated capsule thumb inside
52 × 28px bounds (small: 22 × 18px inside 42 × 22px). The local glass finish
expands 1.12× horizontally and 1.36× vertically during travel, extending about
1px beyond the track. It adds no independent renderer. Focus mode is connected
to the notification preview and supplies a second working switch example.

The old tooltip animation targeted `data-open`, which Radix Tooltip does not
emit. Browser inspection now confirms `data-state="instant-open"`, animation
`glass-tooltip-in`, duration 0.22s, and an actual `scene-svg` optical layer. Closing
uses 140ms; reduced motion removes transform and uses 80ms opacity feedback.
The slider thumb’s computed border width is 0px and the speaker thumb remains visible.

The homepage has 17 atlas silhouettes plus the small independent pull lens,
using two live renderers at rest. A tooltip temporarily adds the third. Foreground
updates do not allocate a separate mirror for a switch, slider, or segmented thumb.
The deliberate elastic release returns to rest over 420ms and stops its frame work.

103 tests pass across 16 files, including gesture cancellation, delayed liquid
travel, spring return cleanup, moving selection, and shared compositor cleanup.
TypeScript, ESLint, production webpack build, and registry verification pass.
The installable registry contains 53 items, resolving 795 file installs without
dangling imports. These checks do not replace native Safari/Firefox or physical
phone GPU validation.

## 2026-10-27 — squircle contours and interactive homepage

The lab now compares round and L4 squircle contours while holding source and blur
constant. The following runs used this Mac's app browser at **1131 × 858**, after
asset decode, with no CPU throttling. Each run measured 120 frame intervals.

| Backend     | Contour  | Mounted | Limit | Active / mirrors | Source nodes | Refreshes | Median / P95 / max ms | >25ms |
| ----------- | -------- | ------: | ----: | ---------------: | -----------: | --------: | --------------------- | ----: |
| Independent | Round    |       8 |     5 |                5 |           40 |        89 | 16.7 / 17.8 / 18.6    |     0 |
| Independent | Squircle |       8 |     5 |                5 |           40 |        83 | 16.7 / 16.9 / 18.4    |     0 |
| Atlas       | Squircle |       8 |     3 |                1 |            8 |        60 | 16.7 / 17.1 / 18.6    |     0 |
| Atlas       | Squircle |       8 |     5 |                1 |            8 |        60 | 16.7 / 16.8 / 18.4    |     0 |

The atlas setup measured 28.90ms in this run. These single runs show bounded
capture work, not a general frame-rate or GPU-performance advantage. Native
Safari/Firefox and physical phone GPUs remain unmeasured.

Browser checks through the app browser:

| Check                    | Observed result                                                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Refraction off/on        | Displacement scale changed 64 → 0 → 64; the same geometry map remained at build count 1 in the isolated comparison                                        |
| Homepage at rest         | 18 atlas silhouettes plus one small independent elastic lens; two live renderers                                                                          |
| Bell notification        | Visible photo notification; third live renderer; transparent toast host with 0px border                                                                   |
| Mini/full music          | Play expanded the mini player and started actual audio; minimize retained the same audio element; drawer selection loaded and expanded the selected track |
| Message image            | Photo opened in a titled, dismissible dialog with an independent scene renderer and 8px background blur                                                   |
| Component search         | “switch” opened `/docs/glass-switch`; “button group” opened the distinct formatting/document action example                                               |
| Docs dark search         | Dark semantic colors; search overlay computed native `backdrop-filter: blur(6px)`                                                                         |
| Plain backdrop           | Photo source hidden; glass background blur 0px                                                                                                            |
| Bookmark                 | Native shortcut shown; Copy link changed to Link copied after clipboard success; no fabricated browser-bookmark state                                     |
| 320px and 390px homepage | No horizontal document overflow                                                                                                                           |
| 320px docs               | Wrapped the two installation actions; document width/scroll width both 305px with the reserved gutter                                                     |
| 320px image dialog       | 273px wide, within the viewport                                                                                                                           |
| 320px drawer             | Bounds 12–293px horizontally and 560–832px vertically in a 320 × 844 viewport; selecting a song restored trigger focus                                    |

The wider switch thumb is 34 × 22px in a 58 × 28px track (small: 26 × 18px in
46 × 22px). Liquid travel preserves the capsule contour, extends beyond the track,
and adds no local backdrop blur or independent lens. Squircle clipping,
displacement normals, and reflection share the same contour. The classifier
checks only the bounded scene on mirror paints, with a 256-text-node ceiling and
no idle polling. Explicit blur overrides remain authoritative.

109 unit tests pass across 17 files. New coverage includes squircle normals/masks,
plain/photo/content classification, zero-displacement comparison without a map
rebuild, and audio identity across mini/full layouts. TypeScript and ESLint pass.
The optimized webpack production build passes. Registry verification resolves
53 items and 795 file installs with no dangling imports.
Browser checks above used desktop input, including phone-sized viewports; they
do not establish touch-device GPU performance. Playwright specifications were
updated for these interactions; the CLI suite was not run.

### Final layout and plain-finish pass

The shutdown preview remains alongside the leave-site example. Focus/refraction
controls moved into the right column, and a joined action group provides Copy
link, component search, and a glass more-actions popover. The composition uses
19 atlas silhouettes plus the small elastic lens: two live renderers at rest.
At 1131 × 858, measured sibling atlas bounds had **zero intersections**. The dock
was at y=782–850px, leaving an 8px bottom inset. At 1280 × 900, the expanded
player's column ended at 776.5px, above the dock's 824px top. Shorter than 850px
viewports use document flow so the full expanded player remains reachable.

Secondary Documentation/Cancel/Stay here buttons computed `background-image:
none` and `backdrop-filter: none`, and had no independent lens. Primary actions
are flat blue. Decorative material/dock gradients were removed; switch travel
and moving/hovered tab highlights are transparent. The renderer's directional
reflections and actual displacement remain intact.

After the observer exclusion fix, a repeat 120-frame atlas/squircle run at
1131 × 858 with 8 mounted surfaces and limit 3 reported 1 active renderer/mirror,
8 mirrored nodes, 60 filter refreshes, median 16.7ms, P95 16.8ms, maximum 17.1ms,
and zero intervals over 25ms. Setup was 54.30ms in this run; setup timing varies
with browser load and cache state. No platform-wide speed claim follows from
these individual runs. The observer fix has a regression for mixed batches of
internal mirror updates and unrelated upper-wrapper attributes.

The shutdown/wake cycle, more-actions popover, and action-group search were
checked through the app browser. Updated homepage checks at 320 × 844 and
390 × 844 had no horizontal overflow. **110 unit tests** pass across 17 files,
with clean TypeScript and ESLint checks.

Both appearances were checked after the theme resolved. Secondary actions had
no background image or backdrop filter in either mode; every glass skin had
`background-image: none`. During a Recent-tab pointer transition, the moving
selection computed a fully transparent background and no background image.
The switch thumb also had no background image, local blur, or tinted base layer;
only its white rest layer fades during travel. The production build and registry
verification pass after these shared-style changes.
In the isolated final homepage tab, two separated idle reads both reported source
versions `[35, 35]`, atlas map count 1, and two live renderers. No browser console
errors were recorded in that pass.

## 2026-10-27 — contour alignment and shared-layer correction

This pass fixes three concrete rendering discrepancies: the diagnostic outline
was a CSS rounded rectangle over an L4 squircle; independent lens geometry used
integer client sizes while the atlas snapped to half pixels; and an expanded
player could retain its old independent light texture after rejoining the atlas.
Outlines now share the clipping contour, physical sizes retain their fractions,
and atlas placement uses CSS's 1/64px grid. A composited member mounts no local
filter housing, blur wrapper, mirror, or independent reflection. Nested surfaces
inherit their parent without another material layer. A denied atlas also avoids
one fallback backdrop filter per member.

The atlas now precomposes the independent lens's reflection and optical shade
into its existing light texture. Pixel tests compare both renderers' displacement
and composed lighting; no new optical pass was added. Static ink sampling ignores
loads from mirror images and observes actual lens movement instead of polling.
The playground's motion source and 300ms minimize morph are bounded to 30fps and
stop when hidden/offscreen or complete.

### Repeatable lab runs

This Mac's app browser, no CPU throttling, 120 frame intervals per run. Both
backends use the same bounded DOM scene and fixed blur. Phone-sized viewport
checks still use a desktop pointer/GPU; they do not emulate a physical phone.

| Backend     | Viewport   | Contour  | Mounted / limit | Active / mirrors | Nodes | Refreshes | Median / P95 / max ms | >25ms |
| ----------- | ---------- | -------- | --------------- | ---------------: | ----: | --------: | --------------------- | ----: |
| Independent | 1280 × 720 | Squircle | 8 / 3           |                3 |    24 |        74 | 16.7 / 17.6 / 32.4    |     1 |
| Atlas       | 1280 × 720 | Squircle | 8 / 3           |                1 |     8 |        58 | 16.7 / 17.6 / 17.7    |     0 |
| Atlas       | 390 × 844  | Squircle | 8 / 3           |                1 |     8 |        60 | 16.7 / 17.6 / 17.7    |     0 |

Atlas setup measured 30.40ms and 23.40ms respectively. These individual runs
demonstrate bounded capture work; they do not establish a universal GPU/FPS gain.

### Browser checks

- At 1280 × 720, scrolling to the exact maximum 1152px preserved heading top
  240.40625px and dock top 644px. The map build count stayed 3 before/after scrolling
  following a player expand/collapse cycle.
- Short desktop layouts also stayed fixed at the exact scroll end: 1280 × 640
  preserved heading y=198.40625px and dock y=564px at scroll 1024px; 1280 × 687
  preserved heading y=221.90625px and dock y=611px at scroll 1099px. All examples
  remained above the dock, without smaller text or touch targets.
- The expanded player used an independent `scene-svg` lens with 8px blur and
  three live renderers total. Library stayed at y=165.5px and Shutdown at y=317.5px.
  After collapse, the player had zero independent reflections; all atlas members
  had zero local blur wrappers.
- Every checked homepage squircle outline used the exact same point sequence as
  its clip, including fractional widths 274.03125px and 295.96875px. The standalone
  playground lens also matched at radius 80px, with no CSS outline.
- Homepage and playground at 320 × 844 and 390 × 844 had no horizontal document
  overflow. The 320px playground lens retained a 10px inset inside the stage.
- Playground button pointer state, circle keyboard state, reset, and editable
  background text were checked through the app browser.

119 unit tests pass across 18 files. New regressions cover fractional geometry,
pixel parity, contour parity, stale independent layers, inherited material,
cheap denied-atlas fallback, and event-driven ink sampling. Browser checks use
the app browser; updated Playwright definitions were not run through the CLI.
Physical Safari/Firefox and low-powered phones remain separate validation work.

The desktop heading veil is a bounded source layer, ending before the glass
field. Its gradient uses relative stops inside that layer, so the ink sampler
and rendered photo agree about where the mask ends. A regression checks that a
left-side veil cannot darken the sample of a lens outside its bounds. In the
Ocean scene, upper controls choose dark ink over the bright sky while the lower
confirmations choose light ink over water. This was checked in Unitheme.

## 2026-10-27 — soft content and source-colored rim light

The starting material now uses 28px displacement, 4px background blur, glint 55,
and a shallow interior bowl (0.18). Color bleed (0.75) diffuses the existing
mirrored source and screens it through the cached optical reflection map.
It adds no mirrored DOM, CPU pixel sampling or per-frame displacement encoding.
Zero color bleed omits the new diffusion/composite branch entirely. Both the
independent lens and atlas use that same filter path and interior field; texture
cache keys exclude the color-bleed control.

With adaptive content enabled, background text/UI becomes an 8px-or-higher blur
with zero displacement. Explicit component blur remains authoritative. The
playground exposes Adapt to content plus Interior lensing and Color bleed, so
manual optical studies remain available. This approximates ambient color light;
it does not reproduce or make performance claims about Apple's private engine.
Apple's public [Meet Liquid Glass talk](https://developer.apple.com/videos/play/wwdc2025/219/)
describes adaptive legibility and colorful content spilling light onto larger surfaces.

### App browser measurements

Same Mac and in-app browser, no CPU throttling, eight squircle surfaces, requested
limit three, fixed 4px blur, 120 frame intervals over the same moving DOM source:

| Backend     | Viewport   | Color bleed | Active / mirrors | Nodes | Refreshes | Median / P95 / max ms | >25ms |
| ----------- | ---------- | ----------: | ---------------: | ----: | --------: | --------------------- | ----: |
| Atlas       | 1280 × 720 |           0 |            1 / 1 |     8 |        60 | 16.7 / 16.8 / 17.6    |     0 |
| Atlas       | 1280 × 720 |        0.75 |            1 / 1 |     8 |        60 | 16.7 / 16.8 / 17.5    |     0 |
| Independent | 1280 × 720 |        0.75 |            3 / 3 |    24 |        82 | 16.7 / 16.8 / 17.6    |     0 |
| Atlas       | 390 × 844  |        0.75 |            1 / 1 |     8 |        58 | 16.7 / 17.6 / 17.8    |     0 |

The desktop atlas setup was 59.50ms; phone-width setup was 18.70ms. These are
individual runs on one desktop GPU, including a phone-sized viewport. They do
not certify physical phones, Safari/Firefox or a universal frame-rate guarantee.

In the playground, moving the lens over the heading selected content mode,
8px blur and displacement scale 0, retaining source-colored light. Disabling
Adapt to content restored 4px blur and scale 28; Reset restored adaptive mode.
The five scene actions shared y=602.828125px and height 40px in the checked
1036px-wide app window. The playground contains no footer.

The updated homepage kept heading y=240.40625px and dock y=644px at scroll 0
and the exact maximum 1152px (1280 × 720); atlas map count remained 1. Expanding
the player over lower controls selected content mode, depth 0 and blur 8px,
with three live independent renderers total; collapsing removed its local blur
and reflection layers. Both homepage and playground at 320px width had
`clientWidth=scrollWidth=305px`, with 40px toolbar controls wrapping locally.
Light/dark glass and foreground contrast were inspected over Dunes and Ice.

123 unit tests pass across 18 files. Regressions cover the continuous interior,
legacy flat-center option, content/manual policy, source-color filter branch,
zero-cost omission of that branch, renderer parity, and color-independent map
caches. The updated end-to-end definition records toolbar alignment and content
policy; browser checks above were executed in the app browser, not the
Playwright CLI.

A final contour pass tapers the interior bowl to zero at the actual round/L4
boundary, including curved corners, while leaving the stronger bevel intact.
The final atlas repeat (same desktop setup) measured 53.70ms setup, 60 refreshes,
16.7ms median / 16.8ms P95 / 17.3ms maximum, zero intervals above 25ms, one active
renderer/mirror and eight mirrored nodes. Idle playground source versions stayed
`[14,14]` across separated reads. Theme ink changes immediately with its mask;
background and state transitions retain their soft timing.

## Left-anchored landing composition — 2026-10-27

The intro now starts at the left gutter (63.25px at a 1280px viewport), with a
vector ring and two 44px glass navigation links. Its source mask is opaque white
or black through the text and links; photos remain visible behind the examples.
Below desktop width, the opaque area sits above the examples. All site footers
have been removed; photo credits remain reachable through the dock menu.

Browser checks covered 320 × 740, 390 × 844, 768 × 1024, 1024 × 640 and
1280 × 720. The narrowest view had no horizontal overflow and both links shared
y=211.1875px. The 1024 × 640 layout leaves 17px between the examples and dock.
The fixed composition remained stationary at the maximum scroll position.
Both light and dark appearances were inspected. Documentation navigation works,
and the docs and components pages expose no site footer.

The two intro links deliberately use small independent SVG lenses so their neutral
tint remains visible against the plain background. The homepage has four active
renderers on the checked fine-pointer desktop: atlas, two links, elastic example.
The existing five/fine and three/coarse caps still apply; the decorative ring
allocates no renderer. This is composition evidence, not a new frame-rate
benchmark or a physical mobile-device measurement. The renderer itself is unchanged.

Validation: 123 tests, lint, TypeScript, production build (63 routes), registry
verification (53 items / 795 installs), and diff whitespace checks pass.

## Column light, search and control motion — 2026-10-28

The rim texture now packs a neutral horizontal coordinate and a vertical source
coordinate in RGB, while alpha remains the shared SDF's thin edge mask. One
additional SVG displacement pass projects a lens's central source column to its
upper and lower arcs. The source is softly resolved over a 1px × 24px kernel;
neighboring columns stay separate. Atlas members use their own centers, including
stacked members. White specular energy is reduced when source color is present.
There is no additional texture, DOM mirror, raster capture, CPU pixel readback,
or idle loop relative to the previous rim-mask implementation. Color bleed zero
omits the projection pass. This is center-weighted column light, rather than an
exact full-column dominant-color histogram or Apple's private renderer.

The lab source now includes a blue diagnostic object. Desktop comparisons below
used the original full-height moving blue strip. The final phone repeat used a
48px object, allowing color to reach an edge even when the object itself is
inside the lens. All runs used eight squircle members, requested limit three,
4px content blur, and 120 measured frame intervals in the app browser on the same
Mac, without CPU throttling:

| Backend               | Viewport   | Color bleed | Active / mirrors | Refreshes | Median / P95 / max ms | >25ms |
| --------------------- | ---------- | ----------: | ---------------: | --------: | --------------------- | ----: |
| Atlas                 | 1280 × 720 |           0 |            1 / 1 |        60 | 16.7 / 16.8 / 17.5    |     0 |
| Atlas                 | 1280 × 720 |        0.75 |            1 / 1 |        60 | 16.7 / 16.8 / 17.5    |     0 |
| Independent           | 1280 × 720 |        0.75 |            3 / 3 |        88 | 16.7 / 17.1 / 17.5    |     0 |
| Atlas, settled repeat | 390 × 844  |        0.75 |            1 / 1 |        59 | 16.7 / 16.8 / 17.7    |     0 |

Atlas setup was 58.50ms on desktop and 31.00ms for the final phone-width run.
An earlier phone-width run during the editing session had one 150ms interval
(16.7ms median, 16.8ms P95); it is not discarded as evidence of possible stalls.
The settled repeat above was taken after compilation. These are individual
measurements on a desktop GPU, not physical-phone, Safari or Firefox certification.

Continue, Save and Search own small independent optical layers, so their clips,
backgrounds and labels all receive the same press scale. Tint-only intro links
now share the atlas, preserving five active renderers on the inspected desktop.
Other atlas controls no longer scale their labels over a stationary material.
Switch travel transitions CSS `translate` and `scale`; the 1.3 uniform expansion
preserves the elongated capsule. Cached SDF reflection/shade textures retain a
visible optical edge during the 300ms travel, without a separate mirror or blur.
Keyboard interaction remains immediate.

Docs and showcase search share a 640px command palette with 24px surface blur,
a blurred scrim, 64px input, 44px results and keyboard footer. Filtering, Enter
navigation, Escape/focus return, both appearances, and mobile navigation were
checked in the app browser. At 320 × 740 the search dialog was x=16px, width=273px,
y=103.59px, height=480px; it remained inside the viewport. At 390px, the mobile
navigation was x=52px, y=62px, 192 × 152px. The separate navigation-menu example
now opens at y=428px below its trigger, with a consistent 224px panel width.
Optical filter installation runs before paint to avoid exposing an unfiltered
copy while an overlay appears.

Validation: 127 unit tests, TypeScript, lint, production build with Next's webpack
compiler (63 routes), registry verification (53 items / 795 file installs), and
tracked diff whitespace checks pass. Browser interaction checks were performed
in the app browser; the Playwright CLI suite was not run.

## Original DOM and explicit targets — 2026-10-29

`GlassLens` now filters original DOM children by default. A small positioned map
is composed over an exactly neutral field. Its coverage mask confines blur to
the lens and restores original pixels outside the contour. Buttons, inputs and
links keep their original nodes and handlers. An optional `refractionTarget`
keeps compact track filters lens-sized, using an inert presentational copy.
Neither path takes a screenshot, reads pixels on the CPU, or clones a scene.
The source graphic remains bounded: 1.5 million CSS pixels and 4096px per axis.

Maps compute one quadrant of geometry and mirror signed displacement vectors.
Motion repositions cached images, while each source paint gets a fresh SVG filter
ID; each housing retains at most two definitions. Layout paints drain pending
source mutations so the same update cannot request a second observer paint.
Unchanged target positions do not start another travel loop. Direct-DOM press
growth updates map, coverage and glint on the same frame clock, avoiding a
CSS-scale/map timing mismatch; a regression checks intermediate alignment and
confirms no texture regeneration. Input, scroll,
hover/focus, image/font loading and active CSS animations invalidate original
DOM; a static lens has no idle frame loop. This is not a WebGL video renderer,
and arbitrary canvas drawing is not detected by DOM observers.

The slider's optional visible lens uses an elongated 58 × 30px capsule, 32px
transmission displacement and a curved interior that magnifies its blue fill.
Compact hold-only sliders retain the gentler 6px map. Switches use a transient
34 × 22px target, 12px displacement and 1.3 press scale. Single-selection tabs
filter their original labels with one moving lens. Keyboard changes are immediate;
the ordinary thumb/selection remains available when reduced transparency or the
budget prevents optics. The five/fine and three/coarse cap is unchanged.

### Frame measurements

These 120-frame runs used the app's Chromium browser on this Mac, development
server, no CPU throttling. `/lab` moves a 90 × 60px lens over a small track in
each 112px-high source cell. Phone sizes below are desktop viewport emulation.
All runs had **zero map revisions during motion, zero mirrors and zero mirrored
DOM nodes**. The eight-mounted cases admitted exactly three filters.

| Renderer                             | Viewport   | Mounted / limit | Active | Filter paints | Median / P95 / max ms | >25ms |
| ------------------------------------ | ---------- | --------------: | -----: | ------------: | --------------------- | ----: |
| Original DOM, first run              | 1280 × 720 |           3 / 5 |      3 |           363 | 16.7 / 16.8 / 100     |     1 |
| Original DOM, settled repeat         | 1280 × 720 |           3 / 5 |      3 |           363 | 16.7 / 17.0 / 17.6    |     0 |
| Original DOM                         | 1280 × 720 |           8 / 3 |      3 |           360 | 16.7 / 16.8 / 17.6    |     0 |
| Original DOM                         | 390 × 844  |           8 / 3 |      3 |           363 | 16.7 / 16.8 / 17.3    |     0 |
| Explicit target                      | 1280 × 720 |           8 / 3 |      3 |           363 | 16.7 / 16.9 / 17.5    |     0 |
| Explicit target                      | 390 × 844  |           8 / 3 |      3 |           363 | 16.7 / 17.0 / 17.7    |     0 |
| Original DOM, final alignment repeat | 1280 × 720 |           8 / 3 |      3 |           363 | 16.7 / 17.6 / 17.7    |     0 |

The first-run 100ms stall is retained above. The settled results do not establish
performance on physical phones, native Safari or Firefox, and RAF intervals are
not a GPU profile. Native-browser/media-specific validation remains necessary
before making compatibility or low-power-device guarantees.

### Homepage and interactions

The homepage now mounts one selected example from a 15-item catalogue. Its
previous viewport-sized atlas and simultaneous examples are gone. The default
original-DOM example uses a 520 × 392px source, two tiny neutral mirrors, three
active renderers, four mirrored nodes and 171 total body nodes on the inspected
1280 × 720 page. The prior all-at-once page had nine mirror trees and 773 body
nodes. The two-link atlas is 260.8 × 44px; one measured setup was 6.5ms, compared
with 60.1ms for the former 1265 × 720 atlas. These setup/node counts are individual
composition measurements, not a statistically controlled load-time benchmark.
Visible-lens slider/tab examples can use a fourth renderer within the same cap.

Keyboard lens movement changed filter paints from three to five while its map
revision counter stayed at two (development Strict Mode). The paint count then
stayed at five while idle. The source link opened its documentation normally.
Unit checks preserve an edited input's value and DOM identity through lens travel
and deactivation, constrain blur/neutral-map composition, and verify map caching,
fresh filter IDs, admission, cleanup and settled-travel behavior.

Browser checks covered Save, slider keyboard input, the held switch and disabled
sharing options, tab selection, player expansion and audio removal, component
search/filtering, Escape/focus return, drawer geometry/focus, photo dialog,
shutdown/wake, leave-site cancellation, action popover, bookmark instructions,
photo notification and elastic hold. Drawer opening preserved the intro atlas's
260.8px width and position. All 15 examples fit inside their stable 324px phone
stage at 320px width. Homepage, components, playground, performance docs and lens
docs were checked at narrow widths; no horizontal overflow or site footer was
present. Light and dark screenshots were inspected. At 1280px width and heights
640/720/900px, document height exactly matched the viewport and the dock ended
16px above its bottom, without an optical scroll tail. Playground toolbar actions
all measured 40px high on the same row.

Validation: 141 unit tests across 19 files, lint, TypeScript, registry verification
(54 items / 852 file installs) and diff whitespace checks pass. Production build
with Next's webpack compiler passes (64 routes). Browser checks use the app browser; the Playwright
CLI suite was updated but was not run.

## 2026-10-29 — corrected compact cap and states

This supersedes the earlier compact-lens appearance. Broad painted white
reflections and the uniform gray body overlay were removed. The interior
magnifies the source; the shoulder samples the surrounding source plane. The
explicit slider/switch targets include that plane and ray-excursion padding,
preventing an unbent duplicate track or clipped samples. `rimStrength` controls
source-colored rim energy; legacy `parameters.glow` maps to that energy and never
creates emissive caps. Switch rims mix the bounded source; sliders retain columns.

Normal thumbs rest solid and allocate no target filter. A press opens the cap,
then releases it after the bounded exit. The homepage has only Slider, Switch
and Navigation; one mounts at a time. Inspect active state intentionally keeps
one cap admitted. The two compact renderers still use the five/fine, three/coarse
runtime cap and cached quarter maps.

### Measured after removing the painted caps

In-app Chromium, development server, 120 frame intervals per run. Source-column
rim enabled and default compact chroma/blur. Each row mounted eight bounded
sources, requested a limit of three, and admitted exactly three.

| Renderer        | Viewport   | Median |    P95 |    Max | Frames >25ms | Map revisions | Mirrors |
| --------------- | ---------- | -----: | -----: | -----: | -----------: | ------------: | ------: |
| Explicit target | 1280 × 900 | 16.7ms | 17.6ms | 17.7ms |            0 |             0 |       0 |
| Original DOM    | 1280 × 900 | 16.7ms | 17.2ms | 17.6ms |            0 |             0 |       0 |
| Original DOM    | 390 × 844  | 16.7ms | 17.5ms | 17.6ms |            0 |             0 |       0 |
| Explicit target | 390 × 844  | 16.7ms | 16.8ms | 17.7ms |            0 |             0 |       0 |

Each run recorded 363 filter paints across its three admitted lenses. Settled
homepage controls had zero target filters. These are desktop-browser viewport
measurements, not physical-phone or native-Safari certification. RAF intervals
are not a full GPU profile, and the small bounded source differs from a whole page.

### Verification

- 153 unit tests across 20 files passed, including neutral maps, quadrant signs,
  actual shoulder sampling, absence of emissive cap pixels, source-weighted rims,
  alignment, map reuse, budget cleanup and transient state release.
- Typecheck, ESLint and the webpack production build passed. The shadcn registry
  verified 54 items / 887 file installs without dangling imports.
- Manual browser checks covered light/dark switch states, theme selection and
  focus return, solid keyboard switching, the control tuner, the retained scene
  playground and aligned backdrop selection. Menus use a separate content
  viewport so optical sampling margins cannot become scrollbars. A portal outside
  its bounded scene releases the SVG mirror and uses actual CSS backdrop blur,
  instead of filtering an empty portion of the source and leaving text unblurred.
- At 320px, homepage, playground, components, docs and performance docs had no
  horizontal overflow and no footer. Desktop homepage scroll height equaled
  viewport height at 640, 720 and 900px.
- Playwright regression sources were updated; their CLI suite was not run in
  this session. Native Safari/Firefox and physical low-powered devices remain
  unverified. The renderer does not supply a WebGL backend for Safari video.

## 2026-10-29 — source hue and reversible switch contraction

The compact rim now weights source chroma instead of inverse luminance. This
prevents a dark neutral control plane from dominating the primary track color.
The computation stays in the bounded `SourceGraphic` filter: no new DOM capture,
pixel readback, animated map generation or idle loop. It adds channel reduction
passes to the color calculation. The unused black shade PNG allocation, encoding,
decode and composited DOM layer were removed from compact controls.

The switch keeps its existing dimensions. Expansion and contraction share one
220ms scale/material transition; the filter survives until contraction completes,
then hands back to the solid native thumb without another opacity animation.
Position still uses the existing cached map and bounded 400ms spring.

The user requested no further tests. No tests, benchmark suite, typecheck, lint or
production build were run for this revision. Earlier measurements above describe
the earlier filter graph and do not establish this revision's frame cost.

### Reference appearance refinement

The switch rim now concentrates a denser source hue at the edge instead of
spreading a pale tint across the shoulder. The curved map leaves more room for
the surrounding source plane before interior magnification; its white/dark
crescents remain real source pixels. Switch blur is 0.45px. The homepage example
is displayed at 2× inside a 300 × 184px plain plate for visual comparison.

These are cached-map/profile and existing filter-transfer changes: no extra
filter pass, texture, source capture or animation loop was added. No tests or
performance benchmarks were run for this refinement, as requested.

## 2026-10-29 — inspected Aave source geometry and displacement

This supersedes the earlier appearance tuning above. Inspection of the live
[Aave demo](https://aave.com/design/building-glass-for-the-web) showed:

- A 74 × 28px visible track, with a separate 74 × 21px optical fill. The fill
  also transforms: approximately 0.943 × 0.943 during the captured active return.
- A displacement texture with a neutral center and inward edge vectors. Its
  blue channel drives a multiplicative optical mask. It has no source-color
  histogram or fixed purple outline in that switch filter.
- A separate active layer does contain an inset shadow (`0 -4px 10px` at 12%
  black), plus a small outside shadow. The white regions still come from the
  refracted source layout; shadow is not what creates them.

The local switch now refracts a 95%-width, 75%-height fill, keeps the central map
neutral, and bends inward in the curved shoulder. A small transmission profile
uses the existing map's blue channel instead of an added black layer. The former
full-perimeter color estimate is disabled for switches. The shared map change
also corrects the direction used by the playground and other compact lenses.

Manual DOM inspection of the local active switch recorded 10 filter primitives,
`data-lens-rim="none"`, and a 68.4 × 21px optical fill inside the 72 × 28px track.
Source/map caches, bounded sources and the 3–5 lens budget are unchanged. There
is no new texture, readback or idle loop; the switch drops the color-estimation
graph and adds two blue-channel transmission primitives. Light-mode refraction
on/off was reviewed against the same source and geometry.

No tests, typecheck, lint, production build or performance benchmark was run for
this revision, following the user's instruction. Prior frame timings describe
older graphs and are not evidence for this revision's rendering cost.

## 2026-10-29 — magnified slider, source-dependent rim height and live video

- The slider's lens appearance uses a 3.2× optical fill across the track's short
  axis. It enlarges the explicit source instead of a dense displacement gradient,
  preserving a smooth rounded fill endpoint. Its source rail spans Radix's thumb
  centers so the fill boundary and lens agree across the range. The visible rail
  remains 8px; the approved switch retains its neutral center and smaller fill.
- The column-light filter now projects chromatic energy before alpha
  normalization. That energy selects a broad 3.4px rim field versus the thin
  neutral 1.1px field. Height varies with the actual source column; the change is
  not a uniform opacity increase. It adds bounded filter primitives, no CPU
  readback, new scene capture or animated texture encoding.
- Navigation shows five sections with one spring-driven, expanded selection
  lens over a highlighted source. Labels use zero transmitted blur and zero
  chromatic dispersion. Only the active example is mounted.
- The flower player has one native video, one WebGL compositor and four cached
  lens maps for the three playback buttons and seek bar. Canvas admission uses
  the same runtime budget as other glass. Native play/pause, 15-second skips and
  seeking remain available without the optical layer. Uniform locations and
  geometry arrays are cached. Frame updates stop on pause; hidden media pauses.
- The reference flower clip was encoded to a silent, fast-start, 960px-wide,
  30fps file: 6,575,219 bytes became 1,597,102 bytes. This reduces both transfer
  size and decoded-frame dimensions. Only selecting Video requests the clip.

Manual browser review covered the magnified slider, navigation selection, live
flower refraction, playback and native seek controls. A metadata timing issue
that could leave seek controls disabled was corrected. This revision rebuilds
55 registry items including the video component and its shader source.
The media inspector reported 960 × 540, 35.133333 seconds, a composited canvas
and one map revision during playback. Forward skip plus a native ArrowRight seek
reached 15.1 seconds. These are functional/structural observations, not a frame
timing benchmark.

No tests were added or run. No typecheck, lint, production build or frame
benchmark was run; prior frame timing tables do not measure this new graph.
Native Safari and physical low-powered devices remain unmeasured.

## 2026-10-29 — taller colored edges and elastic control motion

This revision replaces the compact rim's exponential falloff with a band whose
height is 5% of the lens's short axis, with a 1.4px minimum and a short
antialiased taper. At the default sizes this is 2.6px for the slider and 1.8px
for the switch (before the homepage's 2× presentation scale). Neutral light
keeps a separate subpixel profile packed into the existing rim texture's blue
channel. It adds no texture or source capture. Directional dark attenuation is
narrower and weaker, to avoid an inset-shadow appearance.

The switch now enables the bounded column-light graph alongside its preserved
inward displacement and smaller optical fill. Its former 10-primitive filter
measurement no longer applies. No new CPU sampling or scene mirror is involved.

Slider position follows over 100ms; endpoint pull is saturated at 12px and
returns over 180ms while the optical cap contracts. Radix still owns the value
and limits. Pull updates are coalesced into one input-frame callback, skipped
when unchanged, and cleared on cancellation, disabling, blur and unmount.
The native thumb stays hidden until the retained cap has finished contracting.
Navigation caps grow 12px wider / 26px taller than their item, use the site's
ease-in-out token over 560ms, then reverse the same 220ms scale/material opening.
Pressing the selected item also reveals the lens; internal focus changes do not
cancel travel. Keyboard changes and reduced motion retain instant positioning.

The compact renderer now translates its viewport and inverse source with
transforms instead of animating layout offsets. Original-DOM map coordinates
still follow the same pose, and Safari's fresh-filter-ID repaint is retained.
Moving position or elastic offset does not change the geometry/map cache key.
The existing 3–5 independent-lens cap is unchanged.

Evidence here is limited to source/geometry review. The browser tool rejected
the local preview URL under its URL policy, so this revision has no new visual
or device timing evidence. No tests, typecheck, lint, production build or frame
benchmark were run, following the user's instruction. Registry packaging was
regenerated separately; earlier timing tables do not measure this revision.

## 2026-10-30 — direct slider input and persistent spring selection

Supersedes the percentage rim and timed selection cycle above.

### Structural review

- Slider input uses zero positional animation while held. The old 100ms
  animation restarted on every value update; it is removed. Only elastic
  endpoint release retains a 180ms return. Source/children React node identity
  no longer restarts a lens's positional effect.
- Translation and press scaling now live on separate outer/inner nodes. The
  old CSS `scale` and `transform: translate(...)` on one node scaled the travel
  offset itself. Optical roots now sit above the local track, ignore pointer
  events, and preserve the native keyboard focus indicator.
- Source-colored edge height is bounded to 4 CSS pixels; neutral edges use
  1.75px. Both cap further on tiny lenses. Gray-source density no longer falls
  below a practically invisible alpha after weighting; neutral energy is
  excluded from the wide-band decision. No additional source/map is allocated.
- Navigation holds one selected glass pill at rest, at a constant height. Its
  500ms damped spring carries bounded velocity through interruptions. Hold,
  release and settle timers and the grow/slide/collapse cycle were removed.
  It retains one admitted slot at rest; viewport visibility and the 3–5 device
  budget still control actual optical work. No idle frame loop is added.
- `GlassToggleGroup options` builds native items and their inert highlighted
  source from one list. The homepage no longer maintains a second label layout;
  the docs demo and API describe the same persistent selection behavior.
- Chromium/Firefox retain one live SVG filter definition rather than cloning
  the graph on every paint. WebKit retains the fresh-ID workaround, including
  iOS browsers, and caps the housing at two definitions. Position changes still
  reuse the same maps. This is a source-level allocation reduction, not measured
  frame timing on a device.

### Limits

No tests, typecheck, lint, production build or benchmark were run, following the
user's instruction. Browser review remains unavailable after the browser tool's
earlier denial of the local preview URL; no alternate browser path was used.
Native Safari, Firefox and physical mobile performance remain unmeasured.
Registry packaging is regenerated separately. Older frame tables do not measure
this revision's filter lifecycle or source-light graph.

## 2026-10-30 — source mixture, aligned slider and draggable switch

### Source-level evidence

- Removed compact DOM transmission multiplication and rim RGB darkening. Both
  could turn gray source pixels into a black-looking edge. Explicit controls
  now weight contrast to their actual flat source plane, blending the original
  gray/accent/plane colors. The difference field affects contribution only;
  it is not painted. It replaces four chroma-analysis primitives with two
  plane-contrast primitives. No CPU readback, extra source or texture is added.
- The rim retains its 4px/1.75px bounds, with a constant band and only 0.7px edge
  antialiasing. No CSS shadow, brand-color outline or broad white caps were added.
  The video backend still uses its separate transmission path.
- Visible and explicit optical slider rails now use identical native
  thumb-center insets. The previous optical-only crop and later full-width
  rail both separated the fill boundary from the thumb near endpoints. Both
  rails now put the boundary under the lens. At maximum the single lens thumb
  uses an area-mixed rim, returning to source columns beyond 0.75px elastic
  pull. Mode changes reuse geometry and source; ordinary motion still uses
  direct positioning and cached maps.
- `GlassSliderSource` supplies the control-lens playground's magnified track.
  Its visible rail/text remain normal DOM; the explicit optical copy alone
  enlarges the short axis. The displayed map uses magnification 1 to avoid
  applying that zoom twice.
- Switches capture one pointer, account for rendered presentation scale, and
  follow a held horizontal drag directly. Release commits the side beyond
  halfway once and suppresses the following click. Cancellation/blur/disable
  clear the gesture. No idle gesture loop is introduced.
- The new profile menu loads only when selected. It shares one bounded local
  image scene between the trigger and native portaled menu/dialog. The previous
  example unmounts first; overlay priority and the 5/fine, 3/coarse limit remain.

### Limits

No tests were added or run. No typecheck, lint, production build or timing
benchmark was run. The browser tool previously denied the local preview URL;
no alternative browser path was used. These are implementation/source-level
observations, not new visual or device-performance measurements. Registry
packaging is rebuilt separately; earlier timing tables do not measure this
revision. Native Safari, Firefox and physical mobile behavior remain unmeasured.

### Follow-up — narrower rim, settling selection and original-DOM menu

Supersedes this revision's 4px/1.75px band and scene-surface profile menu.

- Compact DOM rim bounds are now 2.75px colored / 1.25px neutral. The cached
  reflection map supplies two neutral-gray glints on opposing diagonal
  shoulders, instead of a continuous dark edge. The video shader consumes only
  the displacement texture; its R/G vectors and B transmission field are
  unchanged, as are the video player and compositor source files.
- The slider plate reserves 36px horizontal padding (32px on phones) for the
  16px cap extension plus 12px elastic pull. The stage clips optical overscan,
  and the five-example selector wraps within its available width. This is
  containment by source/layout geometry, not a measured visual result.
- Persistent explicit selection uses one scale envelope in its existing 500ms
  travel frame. It grows during motion and returns to the selected item's
  dimensions, remaining glass. Inverse source scaling keeps label dimensions
  stable. The same maximum-size cached map is reused throughout, with no
  per-frame texture encoding, added timer or second frame loop.
- The profile menu now uses the compact original-DOM lens at 1.2px blur, rather
  than a 10px-blurred scene surface. Native Radix content uses external material
  so it adds no second lens/mirror. Source geometry follows the positioning
  wrapper, excluding entrance scale, through resize/style/scroll events only.
  The ordinary trigger and edit dialog retain their shared scene/fallback path.

No tests, typecheck, lint, production build, browser review or timing benchmark
were run for this follow-up. The earlier browser URL-policy restriction remains;
no workaround was used. Registry packaging was rebuilt successfully (55 items,
66 source files). These source-level changes require live/device review before
claiming visual parity or a frame-rate improvement.

## 2026-10-30 — bounded DOM field and complete endpoint reflection

Supersedes the thicker 2.75px edge, the folding DOM transfer curve and the
elastic-offset completion threshold above.

### Implementation evidence

- The DOM field now limits shoulder amplitude by width, source magnification
  and corner radius. Its radial smoothstep contribution is capped below the
  source coordinate slope, avoiding the old foldback across a sharp color
  transition. Depth/scale/curvature still tune amplitude; splay tunes shoulder
  width. DOM generation no longer computes the unused media Snell-ray passes.
  Maps remain cached, event driven and independent of pointer position.
- `media` is an explicit profile in map generation/metrics. Video opts into the
  same previous amplitude, padding, R/G field and blue-channel transmission.
  Its fragment shader, player settings and source footage were not altered.
  The photo menu uses this same field with explicit 1.18× source zoom, 0.5px
  blur and a gentler depth. The actual profile DOM is filtered; labels stay sharp.
- Source light is limited to 1.1 CSS pixels (0.65px neutral), with the cached
  diagonal glints and a faint neutral 6% surface reflection. Dark control planes
  are neutral #111115. There is no accent-colored body overlay, CSS border,
  CSS shadow or black transmission multiply on DOM lenses.
- The rim texture now packs the X coordinate as well as Y. Area mode projects
  the same center sample of the bounded area estimate to the whole perimeter,
  rather than retaining a different horizontal sample at each point. Column
  mode neutralizes X and keeps neighboring columns. No extra texture, capture,
  readback or frame loop is introduced.
- Slider completion records the pointer coordinate at first reaching max. The
  complete rim remains until a further 14px of pointer movement; 8px return
  hysteresis avoids finish flicker. This works after a large initial jump beyond
  max, unlike the old 0.75px elastic-offset check. Native value/commit semantics
  and the bounded 12px optical pull remain unchanged.
- Pointer input no longer draws a second keyboard outline around the solid
  thumb/track. Keyboard focus keeps a distinct outline, including first Tab
  focus. The cap also drops its redundant CSS clip-path, retaining one rounded
  overflow clip and the optical contour.
- A menu lens reveals only after measuring its current native menu node.
  External menu content fades without independent zoom. Measurements follow
  native wrapper position/resize/scroll events and ignore entrance scaling.
  The same five/fine, three/coarse budget applies.

### Evidence limits

No tests, typecheck, lint, production build or timing benchmark were run. Existing
Next dev logs showed automatic compilation and a Fast Refresh dependency-layout
warning while the renderer API was edited. The renderer now uses Next's documented
`@refresh reset` directive so its disposable SVG graph, decoded map and hooks
restart together on development edits. This does not change production state.

The local browser preview remains denied by tool URL policy; no alternate path
was used. A current screenshot was requested for visual comparison. These are
source-level and existing-log observations, not visual parity or measured device
performance. Registry packaging is regenerated separately. Earlier frame timing
tables do not measure this revision.

Packaging completed successfully with 55 registry items / 66 source files.
After the development reset change, the existing log recorded further automatic
compilations (87ms, 283ms, 170ms and 222ms) without another entry for that hook
warning in the reviewed tail. These are compile durations, not interaction frame
times or a substitute for visual review.

## 2026-10-30 — reference control cleanup

Restore point: `c1e340c`, pushed to `origin/main` before any deletions.

Reference evidence is recorded in [aave-reference.md](aave-reference.md): live
computed geometry, explicit source dimensions and the public SVG graph were
inspected, alongside the supplied resting/active screenshots.

Changes and structural cost evidence:

- Removed 43 component files and two supporting hooks unreachable from every
  Next app route and installable registry source root. Public glass entries and
  other routes remain. The snapshot preserves all removed source.
  The subsequent dependency inventory covered 146 source files and reported no
  remaining unreachable files or unresolved local imports. This was source
  analysis, not a runtime test or typecheck.
- Normal slider/switch/navigation filters no longer include the multi-channel
  contrast, weighting, color projection and variable rim-height graph. Current
  explicit-target defaults contain six SVG primitives for the held slider,
  ten for the chromatic switch, and five for selection. Filter-function children
  are excluded from these counts. Completion adds seven primitives only.
- At the default active 64 × 32px geometry, slider maps use a 96 × 64px padded
  source at up to 2× resolution (24,576 storage pixels). The switch uses
  100 × 68px (27,200 storage pixels). These are geometry-derived allocation
  figures, not measured GPU cost or frame-rate claims.
- Translation, drag progress and press scale remain outside the map cache key.
  Native range motion is immediate; endpoint pull stays bounded to 12px. The
  selected navigation cap returns to normal height with its existing travel
  frame, including compact items. A hidden-document travel tick settles at its
  destination instead of leaving a partial pose. No new continuous loop or page-wide source was introduced.
- The approved video's shader, four controls and displacement response remain;
  DOM and video now call the same map implementation without a profile fork.
- `npm run registry:build` repackaged 55 entries and 66 shared source files.
  No tests, lint, typecheck, production build or benchmark was run.

Existing Next dev logs reported successful automatic compiles after these edits
(352ms, 148ms and 135ms at the time reviewed). These are development compilation
times, not rendering timings. Browser policy still prevents local visual/frame
inspection, so pixel accuracy, interaction feel and physical-device performance
remain unverified. No claim of a perfect visual copy is made.


## 2026-10-30 — surface presets, menu entrance and lens buttons

The backup (`c1e340c`) and cleanup (`4d05ef1`) were pushed before this follow-up.

- Switch optics and dimensions are unchanged. Captured input adds a saturating
  `8 * tanh(excess / 24)` CSS-pixel offset, with the native state clamped. Release
  reuses the existing spring and retained cap. No new timer or frame loop.
- The slider's 6px visible / 17px optical source and neutral center stay unchanged.
  Depth 5.5 raises only the curved shoulder response so source color reaches its
  upper/lower rim. Its padded map is now 100 × 68px, 27,200 storage pixels at 2×,
  rather than the preceding 96 × 64px allocation. No color-projection pass is
  added for these arcs.
- Selection/surface/button/magnification use presets of one map implementation.
  The supplied surface tuning is documented in aave-reference.md and exposed
  with parameter descriptions. Navigation keeps zero chroma and sharp labels.
- The menu moves its own lens-sized explicit target and foreground rows together
  through CSS transforms. Original profile DOM is no longer filtered during its
  opening. Radix layout bounds exclude visual animation scale. Map generation
  depends on final geometry, not every animation frame.
- Each lens button observes its own/source bounds and uses native input events.
  Press scale includes both labels and optical layer. The photo target is aligned
  presentational DOM, not a screenshot or arbitrary DOM clone. Image data is reused
  by the browser. Two buttons plus intro/dock request four lenses; the same is
  true for trigger/menu plus intro/dock. Admission remains five/fine or three/coarse.
- The selected homepage example is still the only mounted example. The approved
  video renderer, shader and source parameters remain unchanged.

No tests, lint, typecheck, production build or benchmark were run. Registry
packaging is recorded below after regeneration. Local visual parity and frame
rate remain unverified because development-URL browser access is blocked.

Packaging completed with 56 registry entries and 67 shared source files. The
read-only dependency inventory covered 148 source files with no unreachable
files or unresolved local imports. This does not establish runtime behavior,
pixel parity, or a frame-rate result.

## 2026-10-30 — slider source color, clear photo buttons and menu blur

- Slider depth now matches the switch at 17, and its explicit short-axis source
  grows from 17px to 21px. This changes cached vectors/source layout, not the
  filter graph: six normal SVG primitives, with the existing optional seven at
  completion. Its amplitude remains capped at 13.6px for a 64 × 32px lens;
  the padded map stays 100 × 68px / 27,200 storage pixels at 2× resolution.
  Native value tracking, source endpoints and the switch preset are unchanged.
- Photo-button fallbacks are transparent with 1.5px backdrop blur. They no longer
  insert the old 80% solid plane while a map decodes or admission is unavailable.
  Active button optics use 1.06× zoom, 0.35px blur and weaker neutral edge glints.
  No new capture, readback or source-color synthesis is introduced.
- Profile-menu blur increases from 0.5px to 12px, while chroma becomes zero.
  The explicit menu graph therefore drops from ten to six primitives. Stronger
  blur increases padding and GPU work; this count is not a timing measurement.
  At its 232px width the optical parameters reserve 58px padding on each side;
  height comes from native menu layout. Allocation retains the 1.5M-pixel cap.
  Two native checkbox rows reuse this menu's lens; no nested lenses are added.
- Navigation uses uniform 20% expansion instead of adding 8px horizontally and
  28px vertically. Expansion follows actual spring distance in the existing
  travel callback and returns to normal size at arrival. No additional timer,
  frame loop, map generation per frame or independent filter is added.
- The shared renderer's budgets remain five/fine and three/coarse. The video
  renderer and its parameters are unchanged. Surface tuning remains separate
  from the stronger popover preset.

No tests, lint, typecheck, production build or benchmark were run, as requested.
Local browser inspection remains unavailable under the existing development-URL
policy restriction; appearance, interaction feel and frame timings are unverified.
Registry packaging completed: 56 entries and 67 shared source files.
