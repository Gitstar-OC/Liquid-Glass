# Liquid Glass design system

These rules apply to the homepage, component gallery, documentation, playground,
examples, and every new component. Read alongside [performance rules](docs/glass-performance.md).

## Material

- Use `GlassSurface` for independent panels and overlays.
- Use `GlassButton`, `GlassInput`, `GlassTextarea`, `GlassSelect`, `GlassSwitch`,
  `GlassSlider`, and `GlassToggleGroup` for site controls. Keep Radix/shadcn semantics.
- Nested controls share the panel's glass finish. Do not create an independent
  SVG mirror for each field, label, icon, or button inside a panel.
- Standalone controls without a bounded `GlassScene` use the lightweight glass
  finish. Never describe this fallback as independent DOM refraction.
- No drop shadows, floating-card shadows, text shadows, glow, or stacked rings.
  Optical reflection and shade produced by the lens belong to its material.
  The solid resting slider thumb has one restrained 2px/8px lift shadow so it
  remains visible on a white control plane; the active lens has no CSS shadow.
- Use the lens’s directional reflection for its edge. Do not add a drawn border,
  masked perimeter outline, or stacked ring around refracting glass. Keep focus rings.
  Compact DOM glass has restrained neutral-gray glints on the upper-left and
  lower-right shoulders, from its cached contour. Keep source-colored rim light
  separate from these neutral highlights. The video finish remains unchanged.
  Use a faint neutral surface reflection for presence on dark planes; do not
  fill the glass body with the accent color. Avoid duplicate CSS clip masks.
- Keep foreground text and controls sharp. Blur belongs to the background layer.
- Use a plain tint and the renderer's optical glint. Do not add decorative CSS
  gradients to the glass skin, secondary actions, links, or dock icons. Primary
  actions are flat blue; secondary actions are flat neutral controls with no lens.
- Use `shape="squircle"` for compact panels, message previews, and overlays.
  Its L4 corner contour drives clipping, refraction, and glints together. Use
  capsules for buttons, segmented controls, and switch tracks.
- Nested surfaces inherit the parent without another tint, blur wrapper, or
  reflection. Composited atlas members never retain an independent reflection.
- Diagnostic outlines use the same SVG contour as the physical mask. Do not use
  CSS rounded-rectangle outlines on squircle lenses. Keep fractional CSS sizes
  throughout the optical geometry; only the PNG storage grid is rounded.

## Backdrops

- The homepage is a single-screen split composition with a dock. Its mark,
  heading and two glass links sit on pure white or black. The right side shows
  one focused reference: Slider, Switch, Navigation, Video or Popover. Mount only that
  example. Use a plain control plate on the quiet lavender/dark grid; the Video
  example owns its flower footage. No autoplay, optical settings or hidden live
  catalogue. Keep removed examples in
  the component gallery; do not bring the old menu catalogue back to the hero.
  The profile popover is one small bounded scene, with a local image, native
  menu actions and an edit dialog; it loads only when selected. Its menu uses
  the compact lens on original DOM, with sharp foreground action labels.
  A small active-state inspector pins the expanded material for comparison.
  Slider/switch thumbs start solid; navigation keeps its selected glass pill.
  Phones stack identity above the preview in flow.
- Dunes remains the playground/gallery default. The curated photos use local responsive WebP assets.
- Use `SceneBackdrop`; do not add a new remote photo for each example.
- Preserve image credits. Keep the 640px and 1280px variants.
- Use `object-cover` and the same centered crop throughout a preview. Avoid busy,
  high-frequency images behind dense forms. Check both light and dark areas of each supplied backdrop.
- Reserve the stage's dimensions before image load. Only the first main backdrop
  gets eager loading/high priority; lower previews load lazily.

## Layout and dimensions

| Item                   | Rule                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Page width             | Content `max-w-5xl` (1024px), centered; homepage uses a spacious split layout with a 48–112px gutter                  |
| Page gutters           | 20px phone, 32px larger screens                                                                                       |
| Section gap            | 48px, up to 64px between independent sections                                                                         |
| Single preview stage   | 480px high; 560px on phones; center the example                                                                       |
| Homepage canvas        | Full viewport on desktop; one bounded example at right, heading at left, dock below                                   |
| Homepage controls      | No optical settings, standard navbar, or footer strip; dock links and theme controls only. No page has a site footer  |
| Responsive composition | Two columns on tablets; one readable column on phones; preserve control sizes                                         |
| Preview radius         | 20px single previews; no enclosing frame around the homepage                                                          |
| Panel radius/padding   | 26px panels, 28px dialogs/drawers; 20px compact Sound/AirDrop widgets, 24px forms                                     |
| Standard control       | 40px high; capsule by default; 12px radius for explicit rectangular variants                                          |
| Circular control       | 40px minimum; circle radius; 44px target where practical                                                              |
| Control groups         | 12px between controls; 24px between groups                                                                            |
| Form fields            | Full available width; 8px label gap; 20px field gap                                                                   |
| Type                   | Locally hosted variable Manrope; 14px actions; 12–13px compact controls; 13px compact headings, 18–20px form headings |

- Use flex/grid and `gap`. Use `FieldGroup` + `Field` for forms, `TabsList` +
  `TabsTrigger` for tabbed examples, `ToggleGroup` for option sets, and the
  appropriate Group inside Select/Command/menu primitives.
- A preview has exactly one stage and one detached toolbar (`PreviewToolbar`).
  Controls above and below it stay separate from the photo. No attached browser
  chrome on one example and a separate footer on another. The homepage uses a compact example selector and refraction comparison below its single stage; optical tuning remains in the playground.
- Every control uses the same family styling in all contexts. Core actions use clear glass, primary actions use blue, and secondary actions
  use a subdued neutral finish. Bare transport icons use the ghost variant.
- On phones, wrap toolbars and controls; preserve the example's usable size.
  Do not shrink text, compress touch targets, or introduce horizontal page scroll.

## Content and interaction

- Name the component and the action. A button example must clearly show labelled
  actions, icon buttons, and enabled/disabled/selected states.
- Use short functional text: “Buttons”, “Save draft”, “Preferences”, “Source”.
- Remove decorative marketing strips, redundant descriptions, gratitude, invented
  benefit claims, filler CTAs, and the previous “Start with the source” section.
- Keep only information that explains a control, state, installation, or constraint.
- Do not use `select-none` or `user-select: none` in authored styles.
- Preserve visible keyboard focus, labels, pressed/checked state, disabled behavior,
  validation, Escape dismissal, and focus return. Dialogs require titles.
- Motion is brief and purposeful. Respect reduced motion/transparency and higher contrast.

## Change checklist

1. Follow the dimensions/material tokens above instead of per-example styling.
2. Check Ice, Ocean, and Dunes, phone and desktop widths, and keyboard operation.
3. Check active renderer count, idle behavior, and the performance lab.
4. Run relevant unit checks, typecheck, lint, production build, and registry verification.
5. Record measured results and limitations; do not claim all-device smoothness from one machine.

## Compact control language

- Use the supplied native-control references for proportions and behavior, not an
  imitation desktop. Components remain independent and reusable.
- Use `core` for clear glass actions, `primary` blue for the main confirmation,
  and `secondary` for an alternative. Preserve the legacy aliases.
- Fine sliders use a 4px track, a small rounded thumb, and a generous pointer target.
  Keep the speaker thumb visible at rest. A pointer hold reveals an explicit track lens with a compact curved cap, without a drawn border. The dedicated lens appearance
  uses a 64 × 34px solid resting thumb, a 96 × 52px active cap and an 8px track.
  Its explicit optical fill is 3.2× taller/wider across the track's short axis;
  preserve the progress position and rounded endpoint. The visible rail and its
  optical copy both span the native thumb's center-to-center travel; never crop
  only one of them. Do not zoom the
  visible rail or the switch. `lensParameters.magnification` tunes this fill zoom.
- Group a sound menu into its title, slider, and output radio choices. Group sharing
  into its switch and visibility radio choices. Disabled sharing preserves the choice.
- Connectivity capsules stack icon and label in narrow containers; do not shrink
  labels or allow them to overflow. Use container queries so installed components adapt.
- Dialogs use left-aligned titles, a clear cancel action, and a blue confirmation.
  Drawers are floating sheets with a consistent inset. Preserve focus return.
- Homepage control thumbs use the shared compact `GlassLens` curved-cap model,
  with original DOM or a small explicit source target. `GlassSurface` panels and
  scene-glass playground examples retain the bounded scene/atlas renderer and
  `GLASS_DEFAULT_PARAMS`. These are distinct source paths; do not claim the
  panel classifier or surface bevel parameters tune the compact control lens.
- Independent surfaces classify their bounded backdrop on paint: plain uses 0px
  blur, photos use the configured blur (4px by default), and text/controls or lower glass use at least 8px
  with zero displacement, so background letters soften without splitting.
  Explicit local blur overrides and playground controls take precedence.
- Carry nearby source colors into the glint through the existing bounded mirror.
  Resolve a narrow vertical source column, then project each lens's central
  column color to both arcs with coordinates packed in its cached rim texture.
  Keep neighboring columns separate. Blur transmitted content before the
  colored rim is composed so its light stays crisp on white and black backgrounds.
  Source-bearing columns occupy a band bounded to 1.1 CSS pixels; the neutral plane keeps
  a separate 0.65px profile, including the off switch. Very small lenses cap
  these widths further to preserve their interior. Keep a short antialiased
  taper, without a dark inset falloff. Do not implement this by increasing opacity uniformly.
  Compact explicit tracks weight source contrast against their actual flat
  plane, rather than saturation alone. Gray/off tracks contribute alongside
  accent colors; the resolved mixture retains the source RGB without darkening.
  Slider completion projects one bounded area mixture around the full rim in
  both axes. Latch the pointer position at first reaching max; only a further
  14px of pointer travel returns to local columns (8px return hysteresis).
  Do not use a fixed colored perimeter, a second source capture, or continuous
  CPU pixel sampling. Keep the small white optical reflection for neutral light.
  Stronger refraction remains available as a deliberate playground adjustment.
- The homepage comparison changes only refraction strength. Keep the scene,
  geometry, blur, and optical finish unchanged so the difference is inspectable.
- Unitheme samples the background for readable ink. Duotheme pins the chosen ink
  while appearance changes the optical finish; contrast protection still runs.
  The homepage chooses black ink in light Duotheme and white ink in dark Duotheme,
  independent of the photo. Changing appearance must update this chosen ink.
- A drawer/dialog/command uses at least 8px blur by default, menus/popovers 6px,
  tooltips 4px. Local blur overrides remain available. Higher layers soften the
  lower content they capture. Reveal overlays after admission/texture readiness
  to avoid a bright CSS fallback flashing before the actual glass.
- The homepage has one tiny intro-link atlas and one dock lens at rest. A pressed
  control adds one compact target lens, for three typical active lenses. The
  inspector keeps that slot while pinned. Navigation's selected glass pill
  retains one slot at rest and releases optical work when hidden or unmounted.
  Sources stay separately bounded; the same five/fine, three/coarse cap applies.

## State changes and scroll

- Follow the attached Animate and Emil design engineering guidance. Animate only
  changing state/icon content (Save, Like, Add, theme, playback, notification state).
- `GlassStateSwap` uses two stable layers with a 180ms strong ease-out transition.
  A 2px blur bridges the crossfade, as specifically requested. Do not blur a whole
  control or add transitions to every label. Keep control geometry stable.
- Use CSS transitions so rapid actions reverse from their current state. Never
  queue timers or remount icons to restart a keyframe. Keyboard activation is instant.
- Reduced motion removes the transform and blur, retaining a 100ms opacity fade.
  Hover movement is allowed only for a fine pointer with hover capability.
- The homepage has no artificial scroll runway or pinned scene. Clip optical
  sampling margins at the page boundary so the dock cannot create a phantom
  final scroll step. Keep a stable stage height while changing examples.
  No source animation or permanent frame loop runs on the homepage.

## Native-style details

- Draw control glyphs on the shared 24px grid with consistent stroke weight. Use
  the original `GlassIcon` set for the homepage. These are not Apple SF Symbols.
- Music transport buttons are bare glyphs in one glass panel. Do not add a glass
  circle behind each playback icon. Keep accessible labels and 44px targets.
- Sound and AirDrop use the same 20px rounded rectangle. They are not full capsules.
- The homepage dock uses labelled 44px links, a single softly rounded 22px glass slab,
  keyboard focus, and tooltips. Other docks can use 44px app glyphs.
- Action button groups use a capsule silhouette and individually rounded hit
  areas within one shared glass surface; do not inherit square shadcn group joins.
- `liquidOnHold` reveals a standalone lens after 180ms of pointer intent. Release,
  cancellation, lost pointer capture, blur, and disabling restore the idle state.
  Keyboard feedback is immediate; reduced motion removes the scale.
- Switches rest as solid, elongated capsules: 42 × 22px in a 72 × 28px track
  (small: 32 × 18px in 56 × 22px). The active cap expands to 68 × 36px (small:
  50 × 28px), projects past the track, and moves on a bounded spring. It remains
  liquid through travel, then contracts and returns to solid. All appearances
  of the slider also rest solid. Active screenshots must not become idle styling.
  Holding allows direct horizontal dragging; release commits the side beyond
  halfway once. Cancellation restores the checked state. Account for rendered
  presentation scale when converting pointer distance to travel.
- Shared `GlassLens engaged` uses the same 220ms scale/material transition in
  both directions. Keep the cap visible until contraction completes, then hand
  back to the native thumb without another fade. Readiness gates the reveal.
  Cancellation, disabling and unmount clear work.
  Keyboard changes are instant; reduced motion removes travel and expansion.
- Single-selection tabs/groups keep one persistent glass selection indicator.
  Move it on an interruptible 500ms spring, preserving momentum when retargeted.
  Explicit targets reserve 8px width and 16px height for travel. The pill grows
  while moving and returns to the selected item's normal dimensions, staying
  glass. Counter-scale its source so the highlighted labels retain their size.
  Use the existing travel frame, not another timer or map per animation frame.
  `GlassToggleGroup options` builds the native items and inert highlighted source
  from one list. Keep overflow headroom around the track.
  Native Radix controls remain mounted and retain focus and input state.
- Control targets paint their complete flat source plane, including the space
  around the track. `--glass-lens-plane` must match it. Transparent target gaps
  expose the unbent original and produce a false double track. An explicit
  target never captures arbitrary scene pixels underneath the control.
- Switch caps refract a centered source fill at full track width and 75% track
  height. Keep the map center neutral and use a low-slope inward shoulder.
  Bound the amplitude so a sharp purple/gray boundary stays one contour rather
  than folding back across itself. Keep this field with the source edge (`rim=column`);
  never replace the body with a colored perimeter estimate. Directional
  transmission in the video backend uses the map's blue channel. Compact DOM
  lenses omit that attenuation; it made gray source colors appear black.
  Switches, sliders and navigation retain separate source columns.
  Explicit source pixels distinct from the actual plane have more weight than
  surrounding space. Their original colors still mix. Never paint a black shade
  layer over that resolved hue. This is not an
  exact dominant-color histogram.
  The thin optical rim is composited after transmitted blur, without a CSS border.
  White caps must be displaced/magnified source pixels. Never paint broad white
  highlight bands or a gray body over the control. `rimStrength` adjusts source
  energy only; the legacy glow name does not create an emissive overlay.
  Native focus outlines remain for keyboard input; pointer input must not add
  a second outline around the solid thumb or the track inside the active cap.
  Photo popovers can select the video's media field with explicit source zoom,
  while sharp controls use the bounded DOM field. Native menu labels stay sharp.
- Slider dragging follows the native value directly, with no positional easing
  while held. Only elastic endpoint release eases back over 180ms. Keep the
  translated frame separate from its scaling cap: scale must never multiply
  the thumb's travel offset. Optical roots ignore pointer events and sit above
  the track within the control's own stacking context.
- The gallery player starts mini and expands on Play without remounting audio.
  Component search opens component documentation. Bell notifications, image
  messages, and leave-site actions must perform their named interaction.
- Video controls share one WebGL canvas and video texture, including playback,
  two skip controls and the seek bar. Reuse the compact displacement maps; keep
  native HTML controls above the refracted pixels. Pause updates when playback
  stops and pause the media when hidden. No extra DOM captures per video control.
- In the gallery, keep the shutdown preview and the leave-site example as separate surfaces.
  Focus/refraction controls live with the right-hand examples. Maintain at least
  16px between sibling panels and preserve the dock's separate bottom space.
- During switch travel, retain a subtle translucent specular finish beneath the
  fading white rest layer so the elongated thumb remains visible. This small
  control finish uses a cached SDF map to refract the real track fill and a matching
  optical reflection. It adds no drawn border or independent scene capture; local transmitted blur
  belongs inside the filter. Broad white caps and gray body fills are prohibited.
  Moving tab highlights and tab hover have no added gradient,
  sheen, or fill. Keep selected labels and keyboard focus distinguishable.
- Browser bookmarks require browser UI or an extension. Show the native shortcut
  and a working Copy link action; never display a fake saved-bookmark state.
- Nested glass is a library composition choice: repeated distortion competes with
  readability and adds source captures. Use one panel with shared local controls,
  or separate sibling surfaces when independent silhouettes are needed.

## Deliberate optical deformation

`GlassElasticButton` holds a small independent lens; a 160ms hold enables a
bounded pointer pull. Its smooth displacement envelope bends the clear center
while leaving the perimeter anchored. Movement is limited to 48px of input and
12px of visual travel. It restores on release, cancellation, focus loss, and
unmount. This is an optical deformation example, not a simulation of fabric or
Apple’s private rendering system. Do not run it across a full page or animate
large displacement maps continuously.

Tooltips use Radix’s actual `delayed-open` / `instant-open` / `closed` states.
Use a 220ms entrance and 140ms exit with only 3px travel and a 2% scale change.
Keep the optical layer hidden until ready; do not crossfade a white placeholder
into glass. Reduced motion uses an 80ms fade without travel or scaling. The elastic
example returns its optical deformation to rest over a bounded 420ms gesture
animation, then stops all frame work. Focus mode is a second working switch
example, connected to the notification preview.

## Search and navigation overlays

- Use the same `GlassSpotlight` command palette for site search and examples.
  Keep a 48px input, 44px result rows, group headings, separators and a 44px
  keyboard footer inside one frosted surface. The dialog defaults to 24px blur.
- Component search results use bare right arrows, without boxed/grid glyphs.
- Keep the palette at a stable top inset; filtering must not re-center it vertically.
  Limit width to 640px and result height to 50dvh/380px. Respect phone gutters.
- Navigation triggers share a 40px height. Align their viewport to the menu's
  leading edge; popovers use a 16px collision inset and remain inside the viewport.
- Install optical filters in a layout effect before revealing mirrored content.
  Focus enters the input, arrow keys select, Enter opens, and Escape restores focus.

## Original DOM and explicit target controls

Use `GlassLens` to bend original, bounded DOM children with a small moving map.
The source remains selectable and interactive. Outside the contour, pixels stay
unchanged; local blur is confined by the cached coverage mask. Its `lens` and
`x`/`y` props describe shape and position. For small controls, optionally supply
`refractionTarget`; keep normal DOM controls outside this inert visual copy. A moving lens reuses its map; only
geometry changes regenerate textures. An active target counts against the same
five/three budget. Dormant controls keep their ordinary thumb and no SVG filter.
No gradient or CSS blur stands in for the track's refraction. See
[the target lens guide](docs/target-lens.md) for API and performance boundaries.

Overlay portals outside a bounded source use real CSS backdrop blur and release
their scene mirror. Do not stretch a tiny dock source across a page or describe
this fallback as DOM refraction. Keep menu rows and their scrolling viewport
separate from the optical layer.
