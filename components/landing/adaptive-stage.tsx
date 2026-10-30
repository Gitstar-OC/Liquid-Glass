"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";
import {
  AdaptiveText,
  useAdaptiveContrast,
} from "@/components/adaptive-contrast";
import { GlassButton } from "@/components/glass";
import { CanvasField } from "@/components/landing/canvas-field";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { LiquidGlass } from "@/components/liquid-glass";

const PALETTE = ["#ffb347", "#4ade80", "#60a5fa", "#f472b6", "#c084fc"];

const NOTES = [
  ["Pixel-accurate", "Reads real canvas pixels and composited CSS paints."],
  ["Translucency aware", "Every translucent layer is alpha-composited first."],
  [
    "Motion friendly",
    "Re-measures per frame, so drifting light never breaks it.",
  ],
] as const;

export function AdaptiveStage() {
  const [paused, setPaused] = React.useState(false);
  const probeRef = React.useRef<HTMLDivElement | null>(null);
  const sample = useAdaptiveContrast(probeRef, { live: true, interval: 90 });

  const ratio = sample.contrast.toFixed(1);
  const passes = sample.contrast >= 4.5;

  return (
    <section
      id="adaptive"
      className="relative scroll-mt-24 px-6 py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-5xl">
        <SectionHeading
          eyebrow="Adaptive ink"
          title="Text that reads itself."
          lede="The ink samples what is behind it — canvas or CSS — composites every translucent layer, then flips between light and dark to hold contrast. No manual colour pairs."
        />

        <Reveal delay={100}>
          <div className="relative mt-12 aspect-[16/10] overflow-hidden rounded-[var(--surface-radius)] border border-foreground/8 sm:aspect-[21/8]">
            <CanvasField
              palette={PALETTE}
              base="#08080c"
              speed={1.2}
              paused={paused}
            />

            <div
              ref={probeRef}
              className="absolute inset-0 grid place-items-center px-8"
            >
              <AdaptiveText
                as="p"
                live
                interval={70}
                className="max-w-2xl text-center text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl"
              >
                Ink that reads itself
              </AdaptiveText>
            </div>

            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 sm:inset-x-6 sm:bottom-6">
              <LiquidGlass preset="clear" radius={999} pad={48} className="p-1">
                <GlassButton
                  variant="glass"
                  size="icon-sm"
                  aria-label={paused ? "Play animation" : "Pause animation"}
                  onClick={() => setPaused((p) => !p)}
                >
                  {paused ? (
                    <Play className="size-3.5" />
                  ) : (
                    <Pause className="size-3.5" />
                  )}
                </GlassButton>
              </LiquidGlass>

              <LiquidGlass
                preset="clear"
                radius={999}
                pad={48}
                className="px-3.5 py-2"
              >
                <div className="flex items-center gap-2.5 font-mono text-[11px] tabular-nums text-foreground/80">
                  <span>L {sample.luminance.toFixed(3)}</span>
                  <span className="h-3 w-px bg-foreground/15" />
                  <span>{sample.tone === "light" ? "white" : "black"} ink</span>
                  <span className="h-3 w-px bg-foreground/15" />
                  <span
                    className={passes ? "text-emerald-400" : "text-amber-400"}
                  >
                    {ratio}:1
                  </span>
                </div>
              </LiquidGlass>
            </div>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <dl className="mt-8 grid grid-cols-1 gap-x-10 gap-y-6 border-t border-foreground/8 pt-8 sm:grid-cols-3">
            {NOTES.map(([title, body]) => (
              <div key={title}>
                <dt className="text-[13px] font-medium text-foreground">
                  {title}
                </dt>
                <dd className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {body}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
