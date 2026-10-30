"use client";

import * as React from "react";
import { LiquidGlass } from "@/components/liquid-glass";
import {
  GLASS_SURFACES,
  SURFACE_LABELS,
  type GlassSurface as GlassSurfaceKind,
} from "@/lib/glass-theme";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";

const SURFACE_COPY: Record<GlassSurfaceKind, string> = {
  transparent: "A clear pane with just the edge of a lens.",
  clear: "Bright highlights with a little softness.",
  regular: "A balanced everyday material.",
  frosted: "A quieter surface for busy scenes.",
  thick: "More body, deeper tint, softer light.",
};

export function SurfaceLab() {
  const [selected, setSelected] = React.useState<GlassSurfaceKind>("regular");

  return (
    <section
      id="surfaces"
      className="relative scroll-mt-24 px-6 py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="Materials"
          title="One lens. Five expressions."
          lede="Change the material on one live surface and see how the same scene moves through it."
        />

        <Reveal delay={80} className="mt-12">
          <div className="material-stage relative overflow-hidden rounded-[var(--surface-radius)] border border-foreground/10 p-5 sm:p-8">
            <div aria-hidden="true" className="material-stage-light" />
            <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-[calc(var(--surface-radius)-8px)] border border-white/[0.07] px-4 py-10 sm:min-h-[310px]">
              <div aria-hidden="true" className="material-stage-ribbons" />
              <LiquidGlass
                preset={selected}
                radius={24}
                pad={56}
                className="relative w-full max-w-[26rem] border border-white/[0.18] shadow-[0_24px_70px_rgba(0,0,0,.38)]"
              >
                <div className="p-6 text-left sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">
                      Material preview
                    </p>
                    <span className="font-mono text-[10px] text-white/40">
                      0{GLASS_SURFACES.indexOf(selected) + 1} / 05
                    </span>
                  </div>
                  <h3 className="mt-5 text-[22px] font-medium tracking-[-0.045em] text-white sm:text-[26px]">
                    {SURFACE_LABELS[selected]}
                  </h3>
                  <p className="mt-2 max-w-[19rem] text-[13px] leading-6 text-white/70">
                    {SURFACE_COPY[selected]}
                  </p>
                  <div className="mt-7 flex items-center gap-2.5 border-t border-white/15 pt-4">
                    <span className="size-2 rounded-full bg-sky-200/90 shadow-[0_0_14px_rgba(186,230,253,.8)]" />
                    <span className="text-[11px] text-white/60">
                      Light bends at the rim
                    </span>
                  </div>
                </div>
              </LiquidGlass>
            </div>

            <div className="relative mt-5 grid grid-cols-5 gap-1 rounded-2xl border border-white/[0.08] bg-black/15 p-1.5 sm:mt-6 sm:gap-2 sm:p-2">
              {GLASS_SURFACES.map((surface, index) => {
                const active = selected === surface;
                return (
                  <button
                    key={surface}
                    type="button"
                    onClick={() => setSelected(surface)}
                    aria-pressed={active}
                    className={cn(
                      "relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:min-h-14 sm:px-2",
                      active
                        ? "bg-white/[0.11] text-white"
                        : "text-white/50 hover:bg-white/[0.05] hover:text-white/80",
                    )}
                  >
                    <span className="font-mono text-[9px] text-current/45">
                      0{index + 1}
                    </span>
                    <span className="text-[10px] font-medium leading-tight sm:text-[11px]">
                      {SURFACE_LABELS[surface]}
                    </span>
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 bottom-1 h-px bg-white/70"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
