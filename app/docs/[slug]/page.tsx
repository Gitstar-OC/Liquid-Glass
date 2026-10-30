import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CodeBlock } from "@/components/site/code-block";
import { Reveal } from "@/components/landing/reveal";
import { InstallCommand } from "@/components/landing/install-command";
import { ComponentApi } from "@/components/docs/component-api";
import { ItemDemo } from "@/components/docs/demos";
import {
  getItem,
  getItems,
  humanize,
  installCommand,
  ORIGIN,
  primarySource,
} from "@/lib/registry";

export const dynamicParams = false;

interface ItemPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getItems().map((item) => ({ slug: item.name }));
}

export async function generateMetadata({
  params,
}: ItemPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) return { title: "Not found — Liquid Glass" };

  return {
    title: `${item.title ?? humanize(item.name)} — Liquid Glass`,
    description: item.description,
    alternates: { canonical: `${ORIGIN}/docs/${item.name}` },
  };
}

export default async function RegistryItemPage({ params }: ItemPageProps) {
  const { slug } = await params;
  const item = getItem(slug);
  if (!item) notFound();

  const source = primarySource(item);

  return (
    <article>
      <Link
        href="/docs"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        All components
      </Link>

      <Reveal className="mt-6 border-b pb-7">
        <p className="text-xs font-medium text-muted-foreground">
          {"Components"}
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {item.title ?? humanize(item.name)}
        </h1>
        {item.description ? (
          <p className="mt-4 text-pretty text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
        ) : null}
      </Reveal>

      <Reveal delay={60} className="mt-8">
        <InstallCommand command={installCommand(item.name)} />
      </Reveal>

      <Reveal delay={100} className="mt-6">
        <ItemDemo name={item.name} />
      </Reveal>

      {[
        "glass-surface",
        "glass-card",
        "glass-preferences",
        "liquid-glass",
      ].includes(item.name) && (
        <section className="mt-12 flex flex-col gap-4 text-sm leading-6">
          <h2 className="text-lg font-medium tracking-tight">
            Your components, on glass.
          </h2>
          <p className="text-muted-foreground">
            Put the original background in GlassScene and your interface in its
            children. GlassSurface uses the same optics as the playground. Its
            foreground, focus, card and control colors adapt to the source
            beneath it.
          </p>
          <CodeBlock
            code={`<GlassThemeProvider>
  <GlassScene
    className="grid min-h-96 place-items-center p-6"
    config={{ blur: 1 }}
    content={<img src="/backdrop.jpg" alt=""
      className="size-full object-cover" />}
  >
    <GlassSurface asChild className="w-full max-w-sm">
      <Card>
        <CardContent className="flex flex-col gap-3">
          <Input aria-label="Project name" />
          <Button onClick={save}>Save changes</Button>
        </CardContent>
      </Card>
    </GlassSurface>
  </GlassScene>
</GlassThemeProvider>`}
            title="components/example.tsx"
          />
          <p className="text-muted-foreground">
            Import Card, CardContent, Input and Button from your existing shadcn
            components. Use asChild with a component that forwards props, ref
            and children. Place inputs inside the surface; remove explicit
            opaque fills from custom roots. Portaled components retain the scene
            context, but must overlap its bounds to refract that source.
          </p>
          <p className="text-muted-foreground">
            Automatic ink is on by default. Use ink=&quot;light&quot; or
            ink=&quot;dark&quot; for a fixed color, or
            contrastProtection=&#123;false&#125; to remove the adaptive overlay.
            Sampling estimates accessible source pixels; it cannot guarantee
            contrast on every image. Cross-origin photos need CORS permission.
            Unsupported paints use a protected fallback.
          </p>
        </section>
      )}

      {[
        "glass-surface",
        "glass-button",
        "glass-slider",
        "glass-music-player",
      ].includes(item.name) && (
        <section className="mt-12 flex flex-col gap-4 text-sm leading-6">
          <h2 className="text-lg font-medium">One optical layer per group</h2>
          <p className="text-muted-foreground">
            A player, form, or menu usually needs one glass surface. Nested
            buttons share it. Slider and switch thumbs use a tiny, temporary
            lens over an explicit track copy during pointer input, without
            capturing the panel again. Playback icons can use
            variant=&quot;ghost&quot; to remain bare.
          </p>
          <p className="text-muted-foreground">
            Place a control outside the panel when it needs its own silhouette
            and independent refraction. Deeply nested lenses distort text
            repeatedly, compete for contrast, and increase capture cost. This is
            a composition and performance choice in this library, not a claim
            that native Apple interfaces never layer glass.
          </p>
          <p className="text-muted-foreground">
            Independent controls still respect the document limit: five active
            lenses on fine pointers, three on coarse pointers. Additional
            controls retain their glass finish. The hold example temporarily
            prioritizes its lens; it does not increase that limit.
          </p>
        </section>
      )}
      {item.name === "glass-target-lens" && (
        <section className="mt-10 flex flex-col gap-4 text-sm leading-6">
          <h2 className="text-lg font-medium">Bend the original DOM</h2>
          <CodeBlock
            title="components/track.tsx"
            code={`<GlassLens
  lens={{ lensW: 90, lensH: 60, borderRadius: 30 }}
  x={handlePosition}
  className="h-24 w-full"
>
  <SliderTrack />
</GlassLens>`}
          />
          <p className="text-muted-foreground">
            Position ranges from 0 to 1. The filter bends the original children;
            links, text selection and controls retain their normal behavior. The
            small map moves over a neutral field, and blur is limited to the
            lens. Keep this source bounded to 1.5 million CSS pixels.
          </p>
          <p className="text-muted-foreground">
            For a compact track, optionally pass refractionTarget. This uses a
            small inert visual copy and a lens-sized filter. Both paths cache
            their map during motion. Setting active to false releases the filter
            and budget slot. Use Original DOM or Target lens in the performance
            lab.
          </p>
        </section>
      )}
      {item.name === "glass-button" && (
        <section className="mt-10 flex flex-col gap-4 text-sm leading-6">
          <h2 className="text-lg font-medium">Action hierarchy</h2>
          <CodeBlock
            title="components/actions.tsx"
            code={`<GlassButton variant="core">Continue</GlassButton>
<GlassButton variant="primary">Save changes</GlassButton>
<GlassButton variant="secondary">Cancel</GlassButton>
<GlassButton liquidOnHold>Hold for glass</GlassButton>`}
          />
          <p className="text-muted-foreground">
            Use blue for the main confirmation, neutral for an alternative, and
            core for a clear glass action. Keep the hold effect on an
            exploratory control with an explicit label; ordinary actions
            activate on click.
          </p>
        </section>
      )}
      <ComponentApi name={item.name} />

      {item.dependencies?.length ? (
        <section className="mt-12">
          <h2 className="text-sm font-medium">Dependencies</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {item.dependencies.map((dep) => (
              <li
                key={dep}
                className="rounded-full border border-foreground/10 px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
              >
                {dep}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {source ? (
        <section className="mt-12">
          <h2 className="text-sm font-medium">Source</h2>
          <div className="mt-3">
            <CodeBlock code={source} title={`${item.name}.tsx`} />
          </div>
        </section>
      ) : null}
    </article>
  );
}
