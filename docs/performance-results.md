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
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Before | 3 | 3 | 24 | 83 | 16.7 | 16.8 | 17.6 | 0 |
| Before | 5 | 5 | 40 | 124 | 16.7 | 16.8 | 17.7 | 0 |
| Before | 8 | 8 | 64 | 248 | 16.7 | 16.8 | 17.7 | 0 |
| After | 3 | 3 | 24 | 75 | 16.7 | 17.3 | 17.7 | 0 |
| After | 5 | 5 | 40 | 96 | 16.7 | 17.3 | 17.7 | 0 |
| After | 8 | 5 | 40 | 84 | 16.7 | 17.2 | 17.6 | 0 |

A live limit change initially exposed stale component state: reducing 5 to 3
kept old active flags. Registration now always publishes its initial state. A
regression test covers this case. Repeated browser checks after that fix:

| Viewport | Mounted | Requested limit | Active / mirrors | Nodes | Refreshes | Median / P95 / max ms | >25ms |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: |
| 1280 × 720 | 8 | 3 | 3 | 24 | 75 | 16.7 / 16.8 / 17.2 | 0 |
| 1280 × 720 | 8 | 5 | 5 | 40 | 102 | 16.7 / 16.8 / 17.3 | 0 |
| 390 × 844 | 8 | 3 | 3 | 24 | 89 | 16.7 / 17.1 / 17.7 | 0 |

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

| Check | Observed result |
| --- | --- |
| 1280 × 900 composition | 5 active lenses / 5 mirrors, 10 source nodes per mirror |
| Separated idle snapshots after scrolling | Filter paint counts `[6, 6, 6, 6, 6]` stayed unchanged |
| Drawer over the composition | `scene-svg`; 2 captured lower glass layers; active count remained 5 |
| 320 × 740 and 390 × 844 layouts | No horizontal document overflow; readable controls retain their size |
| Phone drawer | Portal fits the visible canvas intersection; the stage itself does not scroll internally |
| Save, Like, Add pointer activation | Interruptible 180ms transitions; blur limited to two tiny visual layers |
| Keyboard Like activation | `data-animate=false`, computed transition duration `0s` |
| Source scrolling | Local photo planes change transform/opacity and appear inside the glass mirrors |

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

| Check | Observed result |
| --- | --- |
| Desktop, 1280 × 900 | 5 live lenses, 5 mirrors, 10 source nodes per mirror |
| Idle after source scrolling | Filter paint counts `[7, 7, 7, 7, 7]` unchanged across separated reads |
| Foreground stability | Heading top stayed 265.47px at scroll positions 0 and 1440px |
| Background source | Full-bleed Lake/Dunes layers change; no rotated photo cards |
| Drawer over components | `scene-svg`, 4 captured lower layers, 5 live independent lenses |
| Sound shape | 20px radius; shared family with AirDrop |
| Music controls | Bare transport buttons; actual audio/track controls remain connected |
| Dock | Documentation tooltip opens on keyboard focus; links have accessible labels |
| 320 × 740 | Document width 305px including the reserved scrollbar; scroll width 305px |
| 390 × 844 | Document width 375px including the reserved scrollbar; scroll width 375px |
| Phone drawer | Bounds 12–293px horizontally, 456–728px vertically in a 320 × 740 viewport |
| Power preview | Shutdown shows Wake preview; wake restores the panel |

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

| Backend | Mounted | Requested limit | Active / mirrors | Source nodes | Refreshes | Median / P95 / max ms | >25ms |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: |
| Independent | 8 | 5 | 5 | 40 | 83 | 16.7 / 17.6 / 17.8 | 0 |
| Atlas | 8 | 5 | 1 | 8 | 59 | 16.7 / 17.3 / 17.7 | 0 |
| Atlas | 3 | 3 | 1 | 8 | 59 | 16.7 / 17.7 / 17.7 | 0 |
| Atlas | 5 | 3 | 1 | 8 | 60 | 16.7 / 17.3 / 17.7 | 0 |
| Atlas | 8 | 3 | 1 | 8 | 59 | 16.7 / 17.6 / 17.8 | 0 |
| Independent | 8 | 3 | 3 | 24 | 71 | 16.7 / 17.6 / 17.8 | 0 |

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

| Backend | Contour | Mounted | Limit | Active / mirrors | Source nodes | Refreshes | Median / P95 / max ms | >25ms |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | ---: |
| Independent | Round | 8 | 5 | 5 | 40 | 89 | 16.7 / 17.8 / 18.6 | 0 |
| Independent | Squircle | 8 | 5 | 5 | 40 | 83 | 16.7 / 16.9 / 18.4 | 0 |
| Atlas | Squircle | 8 | 3 | 1 | 8 | 60 | 16.7 / 17.1 / 18.6 | 0 |
| Atlas | Squircle | 8 | 5 | 1 | 8 | 60 | 16.7 / 16.8 / 18.4 | 0 |

The atlas setup measured 28.90ms in this run. These single runs show bounded
capture work, not a general frame-rate or GPU-performance advantage. Native
Safari/Firefox and physical phone GPUs remain unmeasured.

Browser checks through the app browser:

| Check | Observed result |
| --- | --- |
| Refraction off/on | Displacement scale changed 64 → 0 → 64; the same geometry map remained at build count 1 in the isolated comparison |
| Homepage at rest | 18 atlas silhouettes plus one small independent elastic lens; two live renderers |
| Bell notification | Visible photo notification; third live renderer; transparent toast host with 0px border |
| Mini/full music | Play expanded the mini player and started actual audio; minimize retained the same audio element; drawer selection loaded and expanded the selected track |
| Message image | Photo opened in a titled, dismissible dialog with an independent scene renderer and 8px background blur |
| Component search | “switch” opened `/docs/glass-switch`; “button group” opened the distinct formatting/document action example |
| Docs dark search | Dark semantic colors; search overlay computed native `backdrop-filter: blur(6px)` |
| Plain backdrop | Photo source hidden; glass background blur 0px |
| Bookmark | Native shortcut shown; Copy link changed to Link copied after clipboard success; no fabricated browser-bookmark state |
| 320px and 390px homepage | No horizontal document overflow |
| 320px docs | Wrapped the two installation actions; document width/scroll width both 305px with the reserved gutter |
| 320px image dialog | 273px wide, within the viewport |
| 320px drawer | Bounds 12–293px horizontally and 560–832px vertically in a 320 × 844 viewport; selecting a song restored trigger focus |

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

| Backend | Viewport | Contour | Mounted / limit | Active / mirrors | Nodes | Refreshes | Median / P95 / max ms | >25ms |
| --- | --- | --- | --- | ---: | ---: | ---: | --- | ---: |
| Independent | 1280 × 720 | Squircle | 8 / 3 | 3 | 24 | 74 | 16.7 / 17.6 / 32.4 | 1 |
| Atlas | 1280 × 720 | Squircle | 8 / 3 | 1 | 8 | 58 | 16.7 / 17.6 / 17.7 | 0 |
| Atlas | 390 × 844 | Squircle | 8 / 3 | 1 | 8 | 60 | 16.7 / 17.6 / 17.7 | 0 |

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

| Backend | Viewport | Color bleed | Active / mirrors | Nodes | Refreshes | Median / P95 / max ms | >25ms |
| --- | --- | ---: | ---: | ---: | ---: | --- | ---: |
| Atlas | 1280 × 720 | 0 | 1 / 1 | 8 | 60 | 16.7 / 16.8 / 17.6 | 0 |
| Atlas | 1280 × 720 | 0.75 | 1 / 1 | 8 | 60 | 16.7 / 16.8 / 17.5 | 0 |
| Independent | 1280 × 720 | 0.75 | 3 / 3 | 24 | 82 | 16.7 / 16.8 / 17.6 | 0 |
| Atlas | 390 × 844 | 0.75 | 1 / 1 | 8 | 58 | 16.7 / 17.6 / 17.8 | 0 |

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
