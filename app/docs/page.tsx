import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { InstallCommand } from "@/components/landing/install-command";
import { CodeBlock } from "@/components/site/code-block";
import { GlassButton as Button } from "@/components/glass/glass-button";
import { installCommand } from "@/lib/registry";
import { COMPONENT_CATALOGUE } from "@/components/gallery/catalogue";
export const metadata: Metadata = {
  title: "Documentation — Liquid Glass",
  description:
    "Install, compose, and customize liquid glass components with shadcn/ui.",
};
const STARTER = `import { GlassThemeProvider } from "@/components/glass/glass-theme-provider"
import { GlassScene } from "@/components/glass-scene"
import { GlassSurface } from "@/components/glass/glass-surface"
import { GlassButton } from "@/components/glass/glass-button"

export function Example() {
  return (
    <GlassThemeProvider>
      <GlassScene
        className="grid min-h-96 place-items-center p-6"
        content={<img src="/backdrop.jpg" alt=""
          className="size-full object-cover" />}
      >
        <GlassSurface className="w-full max-w-sm p-6">
          <h2 className="text-lg font-medium">Preferences</h2>
          <GlassButton className="mt-4">Save changes</GlassButton>
        </GlassSurface>
      </GlassScene>
    </GlassThemeProvider>
  )
}`;
export default function DocsIndexPage() {
  return (
    <article>
      <div className="pb-8">
        <p className="text-xs font-medium text-muted-foreground">
          Documentation
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Getting started
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
          Composable glass components for React. Built on shadcn/ui and Radix,
          with an optical engine you can customize.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/components">
              Browse components <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/playground">
              Try the playground <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </div>
      <section className="mt-8 flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Installation</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Start with a React project configured for Tailwind and shadcn/ui. The
          registry installs the component source and its dependencies into your
          project.
        </p>
        <InstallCommand command={installCommand("glass-surface")} />
        <p className="text-xs leading-5 text-muted-foreground">
          The command uses this registry’s configured origin. For local
          development, keep this site running while installing.
        </p>
      </section>
      <section className="mt-10 flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Create a scene</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Wrap your interface in GlassThemeProvider. GlassScene defines the
          background. GlassSurface refracts it and keeps your interactive
          content sharp. Put images, text, and live controls in the scene’s
          content.
        </p>
        <CodeBlock code={STARTER} title="components/example.tsx" />
      </section>
      <section className="mt-10 flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Choose your components
        </h2>
        <p className="text-sm text-muted-foreground">
          Each component has a live preview, an install command, and its source.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {COMPONENT_CATALOGUE.filter((item) =>
            [
              "glass-button",
              "glass-dialog",
              "glass-form",
              "glass-control-center",
              "glass-music-player",
              "glass-preferences",
            ].includes(item.id),
          ).map((item) => (
            <Link
              key={item.id}
              href={`/docs/${item.id}`}
              className="glass-chip group rounded-xl p-4 transition-colors hover:bg-foreground/5"
            >
              <div className="flex items-center justify-between text-sm font-medium">
                {item.title}
                <ArrowUpRight className="size-3.5 text-muted-foreground/80 group-hover:text-foreground" />
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-10 flex flex-col gap-3 pt-8">
        <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          The engine mirrors a bounded DOM scene and refracts that image through
          an SVG displacement filter. Keep portaled overlays within the scene
          bounds. Same-origin images and CORS-enabled photos support adaptive
          ink sampling.
        </p>
        <Link
          href="/docs/performance"
          className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4"
        >
          Read the performance guidelines <ArrowRight className="size-3.5" />
        </Link>
      </section>
    </article>
  );
}
