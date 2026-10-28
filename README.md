# Liquid Glass

React components built with Tailwind, shadcn/ui, Radix, and a bounded DOM-refraction engine.

## Run the site

```sh
npm install
npm run dev -- --webpack
```

- `/` — independent component previews
- `/components` — 37 interactive examples with a shared glass inspector
- `/playground` — lens and scene controls
- `/docs` — component source and registry commands
- `/credits` — photography and audio credits

## Components

Install individual items from the registry served by this app:

```sh
npx shadcn@latest add http://localhost:3000/r/glass-music-player.json
npx shadcn@latest add http://localhost:3000/r/glass-control-center.json
npx shadcn@latest add http://localhost:3000/r/glass-spotlight.json
npx shadcn@latest add http://localhost:3000/r/glass-power.json
```

The library also includes buttons, button groups, forms, inputs, comboboxes,
navbars, sidebars, tabs, dialogs, drawers, tooltips, switches, toasts, and accordions.
Each item declares its internal and upstream shadcn dependencies. The default
registry origin is `http://localhost:3000`. To build for a deployed registry, set
`REGISTRY_ORIGIN` to that site's URL for both the registry and Next.js builds.

## Use a component with full-scene refraction

```tsx
import { GlassThemeProvider } from "@/components/glass/glass-theme-provider";
import { GlassScene } from "@/components/glass-scene";
import { GlassMusicPlayer } from "@/components/glass/glass-music-player";

export function MusicExample() {
  return (
    <GlassThemeProvider>
      <GlassScene
        appearance="light"
        className="relative flex h-96 items-center justify-center"
        content={
          <img
            src="/your-backdrop.jpg"
            alt=""
            className="size-full object-cover"
          />
        }
      >
        <GlassMusicPlayer
          tracks={[
            { title: "Your track", artist: "Artist", src: "/your-audio.mp3" },
          ]}
        />
      </GlassScene>
    </GlassThemeProvider>
  );
}
```

The music player owns its playback state. The control center supports controlled
or uncontrolled values. Spotlight exports both an inline panel and a dialog.
Power controls call application callbacks and confirm shutdown with an alert dialog.
They do not perform operating-system actions.

`GlassScene` mirrors the complete bounded background DOM into the filter source,
including text, images, live controls, and scroll positions. Foreground content
stays interactive and selectable. Overlapping sibling glass surfaces in the same
scene capture the rendered lower surfaces, including their optical filters and
live content. The target lens and foreground layers are excluded to prevent
feedback. Keep overlays within the scene bounds; arbitrary cross-scene and
complex transformed stacking contexts are not a whole-page capture guarantee.
Small controls inside a glass panel use its
material instead of adding another refraction layer. See
[the engine notes](docs/glass-engine.md) for capture limits and browser status.

## Build the registry

```sh
npm run registry:build
npm run registry:verify
npm run typecheck
npm run build -- --webpack
```

The registry build writes `registry.json` and `public/r/*.json`. Verification
checks dependency closure; it does not perform an online shadcn installation.

Photography is loaded from Unsplash in the preview site and credited at `/credits`.
The short audio previews are original synthesized ambient studies. These demo
assets are not required by the installed UI components; supply your own media.

### Shared glass appearance

`GLASS_DEFAULT_PARAMS` in `lib/glass.ts` is the shared starting point for the
playground and the `clear` surface used by every component family. It keeps the
36px depth, narrow bevel and neutral color, with 0.75px blur. Components
inherit these settings with a 3% tint rather than opaque fills or heavy frosting.
Override individual values with `config`, for example `config={{ blur: 3 }}` on
`GlassSurface`, the music player, control center, power menu or Spotlight panel.
The homepage showcase switches between five independent components and uses the
same scene settings. Its blur slider and the playground blur controls both run
through the refraction renderer. `GlassScene config={...}` supplies shared optical
settings to every descendant; explicit component config values take precedence.
Text and icons now adapt to the original scene automatically. Optical parameters
and readability protection are independent: blur only affects the backdrop.

## Use glass with standard shadcn components

The project is already initialized with shadcn, Radix, Tailwind 4, and CSS-variable
colors. Keep the upstream components' behavior and compose the optical surface
onto their root:

```tsx
import { GlassSurface } from "@/components/glass/glass-surface";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Inside GlassThemeProvider and GlassScene (see the complete example above).
<GlassSurface asChild config={{ blur: 1 }}>
  <Card>
    <CardContent className="space-y-3">
      <Input aria-label="Project name" placeholder="Your next idea" />
      <Button onClick={save}>Save changes</Button>
    </CardContent>
  </Card>
</GlassSurface>;
```

`asChild` keeps one root, forwards refs/events, and leaves editable children sharp.
Use a single component that forwards its props, ref, and children. Remove an
explicit opaque background (e.g. `className="bg-transparent"` on a popover).
Void elements such as inputs cannot contain optical layers: put them **inside**
a surface instead. Radix portaled content retains the React scene context; a
custom portal should stay inside that context or pass `sceneRef` explicitly.
Keep the portal within the source bounds if full-scene refraction is required.

`GlassSurface` scopes shadcn's foreground, card, primary, secondary, popover,
sidebar, border, and focus tokens. Text/icons using these tokens update together.
Hard-coded colors on custom children remain the application's responsibility.
The reusable `GlassPreferences` example accepts an async `onSave` callback and
handles pending, success, and error states. The homepage saves only preview state.

### Adaptive ink

- `ink="auto"` (default) samples on load, resize, scroll, and source changes.
  Set `live` on `GlassScene` for a continuously changing backdrop (300ms polling
  while visible). Nested controls inherit the panel’s ink. Sampling pauses
  offscreen/hidden.
- Readable source pixels, CSS colors, gradients, opacity, and lens color controls
  inform the choice. Both light and dark ink are evaluated against the probe grid.
- A neutral overlay is added only when needed at the sampled points. Set
  `contrastProtection={false}` for unprotected optics; set `ink="light"` or
  `ink="dark"` for manually chosen text and no automatic protection.
- `appearance`/`mode` supplies the initial/fallback appearance. Unavailable pixels
  use conservative protection instead of assuming the page underneath is correct.
- For photo sampling, use an `<img crossOrigin="anonymous">` with a CORS-enabled
  source, or a same-origin image. CSS `url()` backgrounds, protected/tainted media,
  and unsupported paints use the fallback. They still render through the lens.

Sampling estimates the source, not the final filtered GPU image. Fine text in the
background, complex CSS stacking, blend modes, pseudo-elements, and refraction
can differ from the estimate. Review your actual content; this is not a guarantee
of WCAG compliance for arbitrary scenes. The [shadcn token convention](https://ui.shadcn.com/docs/theming)
and [Radix composition model](https://www.radix-ui.com/primitives/docs/guides/composition)
remain intact.

## One setup across your interface

Wrap any collection of scenes or portaled components in `GlassSettingsProvider`:

```tsx
import { GlassSettingsProvider, GlassScene } from "@/components/glass-scene";

<GlassSettingsProvider
  config={{ blur: 1, depth: 36, glint: 45 }}
  optics={{
    refractiveIndex: 1.45,
    thickness: 0.7,
    lightAngle: -45,
    roughness: 0.18,
  }}
  radius={20}
  ink="auto"
  contrastProtection
>
  <GlassScene content={<YourBackground />}>
    <YourComponents />
  </GlassScene>
</GlassSettingsProvider>;
```

Providers add no DOM and can nest. Local scene/component config values take
precedence. Explicit shape radii stay circular: `GlassButton shape="circle"`
or `shape="pill"` uses the same refraction engine as panels. Default controls
inside a panel share its optics, keeping nested controls sharp and inexpensive.
The switch uses a 58×28 capsule track and a 34×22 elongated thumb that briefly
becomes clear and extends beyond the track during pointer travel;
controlled, disabled, form, and keyboard behavior comes from Radix.

`GlassSurface shape="squircle"` uses matching contours for its clip, displacement,
and glint. Independent surfaces adapt background blur on scene paints: zero for
plain content, up to 2px over photos, and at least 8px over text, controls, or lower
glass. Set a local `config={{ blur: 2 }}` to keep an explicit blur value.
`GlassSettingsProvider refraction={false}` preserves the map, source, and finish
while setting displacement to zero for comparison.

`GlassMusicPlayer expandable` starts mini and expands on Play. Optional
`expanded`, `onExpandedChange`, and `trackIndex` props control layout/selection
without remounting the audio element. Route a notification to a named
`GlassToaster id="preview"` with `glassToast("Saved", { toasterId: "preview" })`.

The component gallery and documentation share `GalleryPreview` and
`GalleryExample`, so the same interactive examples are maintained in one place.
The gallery includes all lens and optical parameters, text appearance, contrast
protection, three photo backdrops, reset, and a copyable provider setup. The
website navigation links to this dedicated catalogue.

## Site structure

Shared page headers, preview controls, code panels, and search live in `components/site/`. Documentation uses one persistent layout, dark mode, and grouped navigation. The gallery and playground share settings controls with direct numeric editing. The homepage keeps optical editing in the playground; its dock offers theme, backdrop, and optional edge inspection.

The UI patterns and base button/slider adaptations follow the official shadcn/ui source. See [source notes and attribution](docs/shadcn-source.md).

## Design and performance

Follow [DESIGN.md](DESIGN.md) for material, dimensions, backdrops, and content rules.
Read the [performance guidelines](docs/glass-performance.md) before composing
multiple lenses. The runtime caps independent visible lenses at five on fine
pointers and three on coarse pointers; nested controls share their panel.
Use `/lab` for repeatable measurements. Recorded checks and platform limitations
are in [performance-results.md](docs/performance-results.md).
