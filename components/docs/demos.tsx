"use client";

import { GlassDock, GlassDockItem } from "@/components/glass/glass-dock";
import { GalleryPreview } from "@/components/gallery/preview";
import { COMPONENT_CATALOGUE } from "@/components/gallery/catalogue";
import { DemoFrame } from "@/components/docs/demo-frame";
import { LiquidGlass } from "@/components/liquid-glass";
import { GlassSurface } from "@/components/glass/glass-surface";
import { GlassIcon, type GlassIconName } from "@/components/glass/glass-icons";
import { GlassInput } from "@/components/glass/glass-input";
import { GlassLens } from "@/components/glass/glass-target-lens";
import { GlassSlider } from "@/components/glass/glass-slider";
import { GlassVideoPlayer } from "@/components/glass/glass-video-player";
import { GlassToggleGroup } from "@/components/glass/glass-toggle";
import { LensButtonExample } from "@/components/lens-button-example";
import { useState } from "react";

function TargetLensDemo() {
  const [progress, setProgress] = useState(0.5);
  const track = (
    <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 overflow-hidden rounded-full bg-foreground/15">
      <div
        className="h-full bg-(--glass-action)"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
  return (
    <DemoFrame label="Original DOM · no source copy" backdrop="plain">
      <div className="flex w-full max-w-[320px] flex-col gap-8">
        <GlassLens
          lens={{ lensW: 90, lensH: 60, borderRadius: 30 }}
          x={progress}
          parameters={{ depth: 17, chroma: 0 }}
          className="h-24 w-full"
        >
          {track}
        </GlassLens>
        <label className="flex flex-col gap-3 text-xs">
          Lens position
          <GlassSlider
            aria-label="Lens position"
            value={[Math.round(progress * 100)]}
            onValueChange={([next]) => setProgress(next / 100)}
            tone="accent"
          />
        </label>
      </div>
    </DemoFrame>
  );
}

/** The docs and catalogue render the same maintained, interactive examples. */
export function ItemDemo({ name }: { name: string }) {
  if (name === "glass-lens-button") return <LensButtonExample />;
  if (name === "glass-toggle")
    return (
      <DemoFrame label="Persistent glass selection" backdrop="plain">
        <div className="rounded-full bg-muted p-1">
          <GlassToggleGroup
            liquid
            type="single"
            defaultValue="library"
            aria-label="Collection"
            spacing={0}
            options={[
              { value: "library", label: "Library" },
              { value: "recent", label: "Recent" },
              { value: "saved", label: "Saved" },
            ]}
            itemClassName="min-w-20 rounded-full"
          />
        </div>
      </DemoFrame>
    );
  if (name === "glass-video-player")
    return (
      <div className="flex flex-col gap-3">
        <GlassVideoPlayer
          src="/media/flowers.mp4"
          poster="/media/flowers.webp"
        />
        <a
          href="https://aave.com/design/building-glass-for-the-web"
          className="self-end text-xs text-muted-foreground hover:text-foreground"
        >
          Flower footage · Aave demo ↗
        </a>
      </div>
    );
  if (name === "glass-target-lens") return <TargetLensDemo />;
  if (name === "glass-dock")
    return (
      <DemoFrame label="Dock">
        <GlassDock aria-label="Example dock">
          {(["components", "sliders", "book"] as const).map((icon) => (
            <GlassDockItem
              key={icon}
              label={
                icon === "sliders"
                  ? "Playground"
                  : icon === "book"
                    ? "Documentation"
                    : "Components"
              }
              asChild
            >
              <a
                href={
                  icon === "sliders"
                    ? "/playground"
                    : icon === "book"
                      ? "/docs"
                      : "/components"
                }
              >
                <GlassIcon name={icon} className="size-6" />
              </a>
            </GlassDockItem>
          ))}
        </GlassDock>
      </DemoFrame>
    );
  if (name === "glass-icons")
    return (
      <div className="grid grid-cols-3 gap-x-6 gap-y-8 py-8 sm:grid-cols-5">
        {(
          [
            "power",
            "airdrop",
            "speaker",
            "play",
            "pause",
            "previous",
            "next",
            "moon",
            "sun",
            "heart",
            "plus",
            "check",
            "search",
            "drawer",
            "book",
          ] as GlassIconName[]
        ).map((icon) => (
          <div key={icon} className="flex flex-col items-center gap-3">
            <GlassIcon name={icon} className="size-6" />
            <span className="text-xs text-muted-foreground">{icon}</span>
          </div>
        ))}
      </div>
    );
  if (["glass-state-swap", "glass-state-button"].includes(name))
    return <GalleryPreview name="glass-button" />;
  if (COMPONENT_CATALOGUE.some((item) => item.id === name))
    return <GalleryPreview name={name} />;
  if (
    [
      "liquid-glass",
      "glass-components",
      "glass-surface",
      "glass-adaptive-ink",
      "glass-theme-provider",
    ].includes(name)
  ) {
    return <GalleryPreview name="glass-preferences" />;
  }
  if (name === "glass-lens")
    return (
      <DemoFrame label="The shared optical engine">
        <LiquidGlass className="w-full max-w-sm p-8">
          <p className="text-sm font-medium">A clearer view.</p>
          <p className="mt-2 text-xs">
            A living scene. Sharp, selectable content.
          </p>
        </LiquidGlass>
      </DemoFrame>
    );
  if (name === "glass-materials")
    return (
      <DemoFrame label="One clear material, different shapes">
        <div className="flex flex-wrap items-center justify-center gap-5">
          {[10, 20, 999].map((radius) => (
            <GlassSurface
              key={radius}
              radius={radius}
              className="grid size-24 place-items-center text-xs"
            >
              {radius === 999 ? "Circle" : `${radius}px`}
            </GlassSurface>
          ))}
        </div>
      </DemoFrame>
    );
  if (name === "glass-utilities")
    return (
      <DemoFrame label="Controls share their parent surface">
        <GlassSurface className="w-full max-w-sm flex flex-col gap-4 p-6">
          <span className="glass-chip inline-flex rounded-[10px] px-4 py-2 text-xs">
            Glass chip
          </span>
          <GlassInput
            aria-label="Example field"
            placeholder="A clear place to begin"
          />
          <div className="glass-inset h-3 w-2/3 rounded-full" />
        </GlassSurface>
      </DemoFrame>
    );
  return null;
}
