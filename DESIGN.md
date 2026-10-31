# Liquid Glass design system

These rules apply to the homepage, component gallery, documentation, playground,
examples, and every new component. Read alongside [performance rules](docs/glass-performance.md).

## Material

- Use `GlassPanel` for the compact tooltip, card, menu and overlay family.
  `GlassSurface` remains the bounded scene/atlas material for larger compositions.
- Use `GlassButton`, `GlassInput`, `GlassTextarea`, `GlassSelect`, `GlassSwitch`,
  `GlassSlider`, and `GlassToggleGroup` for site controls. Keep Radix/shadcn semantics.
- Nested controls share the panel's glass finish. Do not create an independent
  SVG mirror for each field, label, icon, or button inside a panel.
- Compact `GlassPanel` controls outside a bounded `GlassScene` use native SVG
  backdrop filtering where supported, otherwise a lightweight finish. Never
  describe the lightweight fallback as independent DOM refraction.
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

- The homepage starts with its mark, heading and two glass links on pure white
  or black. Keep component examples below that header, sharing its max width and
  gutters within `max-w-4xl` (896px including page padding). Named tabs show
  Slider, Switch, Navigation, Buttons and Video, starting with Slider. Mount only
  the active tab. Give navigation, media, panels and small controls their own
  useful width and height. Below, use three spaced sections: Profile, Overlays
  (Popover/Menu/Drawer) and Details (Tooltip/Hover card/Card). Mount one example
  in each section, only while visible. Keep editing controls in the docs and
  playground. Do not bring a component catalogue into the hero. The dock is
  fixed above the viewport's bottom safe area and stays visible while scrolling.
  Use a plain control plate on the quiet lavender/dark grid; Video owns its flower
  footage. No autoplay or hidden live catalogue. Bubble, panel and menu examples
  use a quiet, opaque paper plane on the homepage. Center one View button,
  ellipsis menu, drawer trigger, tooltip trigger, hover-card trigger or standalone
  card. Start overlays closed and hover surfaces unpinned. No photos, file
  workspace or ornamental backdrop in these six homepage examples. Keep their
  frames stable at 400px (420px on phones). Tooltips and hover cards also support
  a tap. Richer asset-workspace examples remain in docs/gallery and load on
  demand, separately from the homepage's simple examples.
  Keep only the short Aave/Apple attribution below the
  hero heading; remove Controls and explanatory example subtext.
  The profile has a centered 168px circular avatar (160px on phones), containing
  the local illustration on a complete paper plane,
  and a menu lens with two actions: Edit profile and Share profile. The
  popover uses 1.08× actual DOM refraction so the portrait's colors and features
  visibly bend. It starts closed, opens without taking focus and retains a native edit dialog.
  The non-refracting component family is deferred; do not show normal-glass
  material choices in these previews.
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
| Page width             | Content `max-w-5xl` (1024px), centered; homepage header and examples share `max-w-4xl` (896px) with responsive gutters |
| Page gutters           | 20px phone, 32px larger screens                                                                                       |
| Section gap            | 48px, up to 64px between independent sections                                                                         |
| Single preview stage   | Docs compact: 420px/440px phone; homepage uses 280–560px by component, with wider local navigation and media frames      |
| Homepage canvas        | Identity, five interaction tabs, then Profile/Overlays/Details sections; fixed floating dock                            |
| Homepage controls      | No optical settings, standard navbar, or footer strip; dock links and theme controls only. No page has a site footer  |
| Responsive composition | Lower examples pair a short label with a preview; stack them on phones and preserve control sizes                      |
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
  chrome on one example and a separate footer on another. Homepage sections use
  named tabs and the shared detached source toolbar, without explanatory copy.
  Their example frames size to the component rather than sharing one height. Optical
  tuning and refraction comparison remain in the docs and playground.
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
- Tab follows actual controls in document order; the fixed dock comes last.
  Native tabs use arrow keys and automatic selection. Their panel wrapper adds
  no extra Tab stop. Keyboard example changes use a short fade without a lateral
  slide; pointer changes retain the gentle slide. Entire collection/image tiles
  open previews, including their glass caption. Keep content through dialog exit.
- Motion is brief and purposeful. Respect reduced motion/transparency and higher contrast.
- Higher contrast strengthens readability while keeping refraction. Only explicit
  reduced transparency or a forced-color palette selects the solid renderer.
  Keep this policy in `lib/glass-preferences.ts`, shared by every backend.
- The mobile three-lens cap prioritizes active controls (8) and media (7) ahead
  of the dock (2) and static glass buttons (1). Overlays remain priority 10;
  background cards use 0. Header chrome must not starve the selected example.
- New visits follow the system theme; preserve explicit Light/Dark choices.
  Declare authored schemes with `only light` / `only dark` so browser Auto Dark
  does not recolor DOM sources separately from optical maps or canvas output.
  Apply the same selection before paint and after hydration. Keep System in
  the appearance menu. ARIA and inert optical layers retain their semantics.

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
  uses a 44 × 22px solid resting thumb, a 64 × 32px active cap and a 6px track.
  Its explicit optical fill is 21/6× taller/wider across the track's short axis,
  matching the switch's 21px optical fill and curved shoulder response;
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
- Compact controls carry source color to the shoulder through displacement,
  rather than an estimated primary hue or a uniformly painted border. Keep
  purple and gray pixels from the actual explicit track. The separate bounded
  scene renderer retains its column-lighting path; do not confuse these paths.
  Slider completion projects one bounded area mixture around the full rim in
  both axes. Latch the pointer position at first reaching max; only a further
  14px of pointer travel returns to local columns (8px return hysteresis).
  Do not use a fixed colored perimeter, a second source capture, or continuous
  CPU pixel sampling. Keep the restrained neutral-gray diagonal glints.
  Image-backed buttons never add a solid plane-colored fallback or a white
  transmission wash. Their clear fallback blurs the actual image by 1.5px.
  Stronger refraction remains available as a deliberate playground adjustment.
- The homepage comparison changes only refraction strength. Keep the scene,
  geometry, blur, and optical finish unchanged so the difference is inspectable.
- Unitheme samples the background for readable ink. Duotheme pins the chosen ink
  while appearance changes the optical finish; contrast protection still runs.
  The homepage chooses black ink in light Duotheme and white ink in dark Duotheme,
  independent of the photo. Changing appearance must update this chosen ink.
- Larger `GlassSurface` commands retain their stronger background softening.
  Compact panels use 0.35px blur for tooltips, 4px for cards/hover cards, 6px for
  popovers/menus/dialogs and 8px for drawers. Shared dialogs use the
  same compact lens, with a dim overlay and no whole-viewport blur. Local blur
  overrides remain available. Pending image lenses keep the actual backdrop
  with a faint neutral reflection; do not flash an almost-white opaque panel.
  Image buttons use the video's actual WebGL finish over a displayed image.
  Compact-panel rim light reads the displaced, unblurred interior columns,
  including tooltips, so it reflects the same magnified content as the body.
  Keep source RGB unchanged, with 55% tooltip / 80% panel color coverage inside
  the existing 1.1px / 1.6px contour band. Plain sources remain neutral; never
  invent an accent-colored edge where that color is absent.
  The profile menu uses its bounded DOM lens with 4px softening and 1.12× zoom.
  Anchor its trigger at the portrait's upper-right and open below it, over the
  portrait. Keep two icon-and-label actions and the native edit dialog.
  Notifications use `GlassPanel kind="toast"`, 24px squircle corners and 8px
  softening. Use Sonner for announcements, timing and gestures; keep the icon,
  app label, title, body and optional action sharp. Reuse IDs for updates. The
  homepage's notification preview stays inside its own source and starts closed.
  Keep the image's own pixels and source-colored rim, without a white body fill.
  Its native actions and controls share one optical layer. Profile
  identity stays outside the image so it is not replaced with sampled text.
- The homepage's two intro links and floating dock use the shared compact field.
  A pressed control adds one compact target lens. The
  inspector keeps that slot while pinned. Navigation's selected glass pill
  retains one slot at rest and releases optical work when hidden or unmounted.
  Sources stay separately bounded; the same five/fine, three/coarse cap applies.

- The playground starts with one 320px-high control-lens preview and six useful
  shape/material controls. Hide the displacement map until requested, and put
  the seven remaining optical dials in a closed Advanced optics section. Do
  not generate a second map preview while hidden. Keep copy/reset alongside the
  shared detached toolbar. The Scene tab loads on demand and uses one main lens;
  its minimize action belongs in the toolbar rather than another glass button
  inside the source.

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
- The homepage has no artificial scroll runway or pinned scene. Reserve only the
  bottom clearance needed to keep content above the fixed dock. Clip optical
  sampling margins at the page boundary so the dock cannot create a phantom
  final scroll step. Keep a stable stage height while changing examples.
  No source animation or permanent frame loop runs on the homepage.

## Native-style details

- Draw control glyphs on the shared 24px grid with consistent stroke weight. Use
  the original `GlassIcon` set for the homepage. These are not Apple SF Symbols.
- Music transport buttons are bare glyphs in one glass panel. Do not add a glass
  circle behind each playback icon. Keep accessible labels and 44px targets.
- Sound and AirDrop use the same 20px rounded rectangle. They are not full capsules.
- The homepage dock has four blank 52px square placeholders (48px on phones) for
  future icons, with accessible action names, keyboard focus and tooltips. They
  share one stationary compact lens with 24px softly rounded corners; do not give
  each placeholder its own glass. No hover lift, translation or press scale on
  the dock items; only tooltips animate. The floating dock uses the real native
  backdrop where SVG backdrop filtering is supported, with a bounded CSS blur
  fallback elsewhere. Other docks can retain their app glyphs.
  Separate the appearance utility with one quiet vertical divider. Use the same
  compact, joined lens tooltip for dock hints. The dock's 1.6px
  source-colored edge projects actual interior background columns; it is not a
  painted accent border or an invented white source. Neutral glints retain
  its silhouette on light backgrounds. Its shallow field uses 1.05× zoom and
  6px background softening, rather than the stronger control-thumb optics.
  Preserve actual source RGB in compact color glints, without saturation or
  brightness gain. Image collection captions use a restrained 1.06× lens.
- Compact panels share a 1.25px tonal bevel in the existing cached reflection
  and transmission maps. Its coverage, normals, source-colored shoulder and
  squircle mask come from the same contour. Keep the neutral glint distinct from
  actual source colors. Tooltips and control/video presets retain their finish.
  Reveal overlays/cards once their initial finish is ready; resizing does not
  hide their labels again. Popover/hover-card width and foreground scrolling
  respect Radix's available local space. Keep optical margins outside scrollers.
- Action button groups use a capsule silhouette and individually rounded hit
  areas within one shared glass surface; do not inherit square shadcn group joins.
- `liquidOnHold` reveals a standalone lens after 180ms of pointer intent. Release,
  cancellation, lost pointer capture, blur, and disabling restore the idle state.
  Keyboard feedback is immediate; reduced motion removes the scale.
- Switches rest as solid, elongated capsules: 44 × 22px in a 74 × 28px track
  (small: 32 × 18px in 56 × 22px). The active cap expands to 64 × 32px (small:
  48 × 26px), projects past the track, and moves on a bounded spring. It remains
  liquid through travel, then contracts and returns to solid. All appearances
  of the slider also rest solid. Active screenshots must not become idle styling.
  Holding allows direct horizontal dragging; release commits the side beyond
  halfway once. Cancellation restores the checked state. Account for rendered
  presentation scale when converting pointer distance to travel. Allow up to
  8px resistant optical travel beyond either end without changing the state.
- Shared `GlassLens engaged` uses the same 220ms scale/material transition in
  both directions. Keep the cap visible until contraction completes, then hand
  back to the native thumb without another fade. Readiness gates the reveal.
  Cancellation, disabling and unmount clear work.
  Keyboard changes are instant; reduced motion removes travel and expansion.
- Single-selection tabs/groups keep one persistent glass selection indicator.
  Explicit targets use an interruptible 1200ms spring, preserving momentum when
  retargeted. Travel opens the cap by up to 4px width / 24px height; it closes
  delicately to normal dimensions while staying glass. A 205ms cap release and
  a smooth final 180ms contraction keep the expanded optics inspectable without
  a grow-before-slide delay. Generate its real curved
  shape on half-pixel geometry changes, never by stretching a tall bitmap.
  Pure translation reuses the field. The highlighted source retains its native
  size; a 46px navigation rail uses a 42px optical rail and 36px source items.
  Use one gesture-bounded frame callback; no idle animation or React frame loop.
  `GlassToggleGroup options` builds the native items and inert highlighted source
  from one list. Keep overflow headroom around the track.
  Native Radix controls remain mounted and retain focus and input state.
- Control targets paint their complete flat source plane, including the space
  around the track. `--glass-lens-plane` must match it. Transparent target gaps
  expose the unbent original and produce a false double track. An explicit
  target never captures arbitrary scene pixels underneath the control.
- Switch caps refract a centered source fill at 95% track width and 75% track
  height. The curved shoulder carries actual source pixels to the edge, while
  the surrounding panel becomes the inner crescent. Do not add an independent
  color-estimation border to normal controls. DOM and video share one field.
  The map's blue channel carries a restrained transmission response at the
  super edge; gray source colors must stay gray. There is no black shade texture
  or full-body tint. White crescents are displaced source pixels, not glow.
  Native focus outlines remain for keyboard input; pointer input must not add
  another outline around the native thumb. Photo popovers use the same field
  with explicit source zoom. Foreground menu labels stay sharp.
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

## Shared lens presets and buttons

`GlassPanel` shares the control field with tooltips, hover cards, popovers,
dropdowns, drawers, cards and `GlassButton variant="glass"`. Foreground content
stays outside the filter. Small tooltips are 26px high with 0.5px softening;
choose `variant="plain"` or `variant="beak"`. Radius and round/squircle shape
remain adjustable. A beak is a smooth union in the coverage, displacement and
reflection field, never an independently painted triangle or border. Its native
Radix arrow is invisible and only supplies placement/collision geometry.
The light finish uses 1.04× source brightness with no gray or black body tint;
the dark finish retains a small neutral reflection. Do not add a glow, shadow
or decorative gradient. Larger overlays progressively soften their backdrop.
Use a bounded scene for portable DOM refraction. Outside one, the shared
Chromium SVG-backdrop capability permits direct local refraction; other browsers
keep local CSS blur and contour glints. Never capture the whole document for a
floating dock or tooltip. Reduced transparency uses the opaque fallback.

Slider, switch, selection, surface and magnification are presets of the same
curved field. Keep their source composition and tuning separate; do not fork the
map generator. Slider edge refinements preserve its neutral center and value.
The surface preset uses the supplied .041 scale / 17 depth / 47 curvature /
1 splay / .27 chroma / .5 blur / 1 rim light / .46 edge / 53° settings.
The playground explains each parameter; Glow remains a compatibility alias only.

Lens buttons use `GlassLensButton` and an optional aligned visual target. Keep
labels outside the filter and scale the whole native action on press. Source refs
supply coordinates, never arbitrary DOM capture. Native menus animate their
lens and rows together from the trigger origin, using a fixed cached map.
