import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/site/code-block";

export const metadata: Metadata = { title: "Performance — Liquid Glass" };
export default function PerformancePage() {
  return (
    <article className="flex flex-col gap-8 text-sm leading-6">
      <header>
        <p className="text-xs text-muted-foreground">Foundation</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Performance
        </h1>
        <p className="mt-4 text-muted-foreground">
          Use one shared scene and a small number of independent glass panels.
        </p>
      </header>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-medium">Keep a surface budget</h2>
        <p>
          Target one to three visible panels. The engine allows at most five
          independent lenses on fine-pointer devices and three on coarse-pointer
          devices. Offscreen panels release their scene mirrors. Additional
          surfaces retain a lightweight translucent finish and remain
          interactive.
        </p>
        <p>
          Buttons, fields, and toggles inside a panel share its glass. Dialogs
          and menus take priority when the budget is full.
        </p>
        <CodeBlock
          title="components/providers.tsx"
          code={`<GlassSettingsProvider performance={{ maxActiveSurfaces: 3, frameRate: 30 }}>
  {children}
</GlassSettingsProvider>`}
        />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-medium">
          Avoid repeated glass inside glass
        </h2>
        <p>
          A player, menu, or form should usually have one optical surface. Its
          buttons and slider thumbs use a local finish on that surface. Bare
          transport icons use the ghost button variant. Refracting each nested
          control again can distort text and increase capture cost.
        </p>
        <p>
          Use sibling surfaces for separate silhouettes. The homepage does this
          while keeping the same document cap. Its hold button temporarily
          borrows an optical slot; slider and switch thumb feedback remains
          local CSS glass. These are this library’s composition choices, not a
          claim that Apple never layers glass.
        </p>
        <Link
          className="w-fit underline underline-offset-4"
          href="/docs/glass-button"
        >
          Button variants and press behavior
        </Link>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-medium">Bound the source</h2>
        <ul className="list-disc pl-5">
          <li>
            Use one GlassScene for related panels; keep unrelated sections
            outside it.
          </li>
          <li>
            Mount the selected example, rather than hiding many live panels.
          </li>
          <li>
            Prefer small, local responsive images. Start with chromatic
            aberration at zero.
          </li>
          <li>
            Avoid deeply overlapping lenses and large animated DOM sources.
          </li>
          <li>
            Enable the scene’s live option only for continuously animated or
            video backgrounds.
          </li>
        </ul>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-medium">Measure on your target devices</h2>
        <p>
          The lab compares 3, 5, and 8 mounted surfaces over the same moving
          source. It reports active lenses, mirrored nodes, filter refreshes,
          and frame intervals. Test scrolling, dialogs, keyboard controls,
          reduced transparency, and physical phones as well.
        </p>
        <p>
          A desktop viewport check does not establish mobile GPU performance.
          Source complexity and panel size matter as much as panel count.
        </p>
        <Link className="w-fit underline underline-offset-4" href="/lab">
          Open the performance lab
        </Link>
      </section>
    </article>
  );
}
