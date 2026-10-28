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
- Use the lens’s directional reflection for its edge. Do not add a drawn border,
  masked perimeter outline, or stacked ring around refracting glass. Keep focus rings.
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

- The homepage is a full-screen split composition with a dock. The optical ring,
  heading and two glass links sit near the left gutter on pure white or black.
  A fully opaque source mask covers that copy before fading into the right-hand
  examples. Below desktop width, the copy sits above the examples with a vertical mask. Appearance
  is changed through a labelled theme control. Light mode starts on Dunes; dark
  mode starts on Ice with a dark source wash. Scrolling reveals Ocean and the
  alternate scene behind stationary desktop controls. Do not use tilted photo cards.
  Optical settings belong in the playground, not below the homepage.
- Dunes remains the playground/gallery default. The curated photos use local responsive WebP assets.
- Use `SceneBackdrop`; do not add a new remote photo for each example.
- Preserve image credits. Keep the 640px and 1280px variants.
- Use `object-cover` and the same centered crop throughout a preview. Avoid busy,
  high-frequency images behind dense forms. Check both light and dark areas of each supplied backdrop.
- Reserve the stage's dimensions before image load. Only the first main backdrop
  gets eager loading/high priority; lower previews load lazily.

## Layout and dimensions

| Item | Rule |
| --- | --- |
| Page width | Content `max-w-5xl` (1024px), centered; homepage spans the viewport with a 40–96px left gutter and 32px right inset |
| Page gutters | 20px phone, 32px larger screens |
| Section gap | 48px, up to 64px between independent sections |
| Single preview stage | 480px high; 560px on phones; center the example |
| Homepage canvas | Full viewport on desktop; component field at the right edge, heading anchored at the left gutter, dock below |
| Homepage controls | No optical settings, standard navbar, or footer strip; dock links and theme controls only. No page has a site footer |
| Responsive composition | Two columns on tablets; one readable column on phones; preserve control sizes |
| Preview radius | 20px single previews; no enclosing frame around the homepage |
| Panel radius/padding | 26px panels, 28px dialogs/drawers; 20px compact Sound/AirDrop widgets, 24px forms |
| Standard control | 40px high; capsule by default; 12px radius for explicit rectangular variants |
| Circular control | 40px minimum; circle radius; 44px target where practical |
| Control groups | 12px between controls; 24px between groups |
| Form fields | Full available width; 8px label gap; 20px field gap |
| Type | Locally hosted variable Manrope; 14px actions; 12–13px compact controls; 13px compact headings, 18–20px form headings |

- Use flex/grid and `gap`. Use `FieldGroup` + `Field` for forms, `TabsList` +
  `TabsTrigger` for tabbed examples, `ToggleGroup` for option sets, and the
  appropriate Group inside Select/Command/menu primitives.
- A preview has exactly one stage and one detached toolbar (`PreviewToolbar`).
  Controls above and below it stay separate from the photo. No attached browser
  chrome on one example and a separate footer on another. The homepage has no preview toolbar. Its curated examples remain visible
  together as individual silhouettes, without a common glass wrapper.
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
  Keep the speaker thumb visible at rest. A deliberate hold expands it only 14%,
  with a 60ms intent delay and a 260ms transition, without a border.
- Group a sound menu into its title, slider, and output radio choices. Group sharing
  into its switch and visibility radio choices. Disabled sharing preserves the choice.
- Connectivity capsules stack icon and label in narrow containers; do not shrink
  labels or allow them to overflow. Use container queries so installed components adapt.
- Dialogs use left-aligned titles, a clear cancel action, and a blue confirmation.
  Drawers are floating sheets with a consistent inset. Preserve focus return.
- Homepage glass uses the playground’s rounded SDF and Snell refraction model.
  Both start from `GLASS_DEFAULT_PARAMS`: depth 28, splay 10, feather 20, curve 2.2,
  blur 4px, glint 55. A shallow interior bowl (0.18) avoids a perfectly flat center;
  source color bleed (0.75) contributes to the same optical rim. A scene atlas batches
  the separate, non-overlapping silhouettes into one optical pass. All members
  keep real, sharp, selectable DOM in front.
- Independent surfaces classify their bounded backdrop on paint: plain uses 0px
  blur, photos use the configured blur (4px by default), and text/controls or lower glass use at least 8px
  with zero displacement, so background letters soften without splitting.
  Explicit local blur overrides and playground controls take precedence. The
  homepage's Plain backdrop also sets its shared atlas blur to zero.
- Carry nearby source colors into the glint through the existing bounded mirror.
  Diffuse narrow vertical source columns into a cached contour mask, retaining
  separate colors along the top and bottom. Blur transmitted content before the
  colored rim is composed so its light stays crisp on white and black backgrounds.
  Do not use a fixed colored perimeter, a second source capture, or continuous
  CPU pixel sampling. Keep the small white optical reflection for neutral light.
  Stronger refraction remains available as a deliberate playground adjustment.
- The homepage comparison changes only refraction strength. Keep the scene,
  geometry, blur, and optical finish unchanged so the difference is inspectable.
- Unitheme samples the background for readable ink. Duotheme pins the chosen ink
  while appearance changes the optical finish; contrast protection still runs.
- A drawer/dialog/command uses at least 8px blur by default, menus/popovers 6px,
  tooltips 4px. Local blur overrides remain available. Higher layers soften the
  lower content they capture. Reveal overlays after admission/texture readiness
  to avoid a bright CSS fallback flashing before the actual glass.
- The homepage uses one atlas, two small independent glass navigation links on the
  plain intro, and one deliberately elastic lens. The ring mark is vector artwork
  and allocates no renderer. These count
  against the unchanged five-renderer ceiling (three on coarse pointers).
  Explicit per-surface optics and overlapping overlays stay independent.
  Never raise the budget to render a large catalogue.

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
- At widths of at least 1024px and heights of at least 640px the composition
  stays fixed through the final scroll position while full-bleed backgrounds change.
  Between 640px and 719px tall, tighten gaps and confirmation padding while
  preserving text sizes and touch targets.
  The expanded player is a separate higher optical layer in a reserved mini-player
  slot, so it cannot push siblings or the dock. Shorter viewports use ordinary
  scrolling so every control stays reachable.
  Reduced motion uses a still backdrop. Only scroll/resize events schedule work;
  there is no permanent animation loop and controls never drift with the background.

## Native-style details

- Draw control glyphs on the shared 24px grid with consistent stroke weight. Use
  the original `GlassIcon` set for the homepage. These are not Apple SF Symbols.
- Music transport buttons are bare glyphs in one glass panel. Do not add a glass
  circle behind each playback icon. Keep accessible labels and 44px targets.
- Sound and AirDrop use the same 20px rounded rectangle. They are not full capsules.
- The homepage dock uses labelled 44px links, a single 34px squircle glass slab,
  keyboard focus, and tooltips. Other docks can use 44px app glyphs.
- Action button groups use a capsule silhouette and individually rounded hit
  areas within one shared glass surface; do not inherit square shadcn group joins.
- `liquidOnHold` reveals a standalone lens after 180ms of pointer intent. Release,
  cancellation, lost pointer capture, blur, and disabling restore the idle state.
  Keyboard feedback is immediate; reduced motion removes the scale.
- Switch tracks are full capsules. The thumb is an elongated capsule (34 × 22px
  in a 58 × 28px track; small: 26 × 18px in 46 × 22px), not a circle or square. It grows about 1px beyond the
  track while liquid and moving. The thumb
  becomes translucent through its 300ms travel, then settles to white. Single
  selection groups/tabs use one moving glass highlight. Keyboard changes are
  instant; cancellation and reduced motion remove the travel. These local finishes
  share their panel’s optical layer; they do not each allocate a lens or local backdrop blur.
- The homepage player starts mini and expands on Play without remounting audio.
  Component search opens component documentation. Bell notifications, image
  messages, and leave-site actions must perform their named interaction.
- Keep the shutdown preview and the leave-site example as separate surfaces.
  Focus/refraction controls live with the right-hand examples. Maintain at least
  16px between sibling panels and preserve the dock's separate bottom space.
- During switch travel, retain a subtle translucent specular finish beneath the
  fading white rest layer so the elongated thumb remains visible. This small
  control finish adds no border, blur or independent scene capture.
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
